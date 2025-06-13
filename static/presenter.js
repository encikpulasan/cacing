import { SlideRenderer } from './slide-renderer.js';

console.log('Presenter.js loaded');

let currentSlide = 0;
const isPresenter = true; // Always presenter mode
const slideRenderer = new SlideRenderer();

// Use Server-Sent Events to sync with other presenters (if any)
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  console.log('SSE message received:', event.data);
  const data = JSON.parse(event.data);
  if (data.type === 'slide') {
    currentSlide = data.index;
    renderSlide();
  }
};

eventSource.onerror = (error) => {
  console.log('SSE connection error:', error);
};

async function updateSlide(slideIndex) {
  try {
    console.log('Updating slide to:', slideIndex);
    await fetch('/slide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index: slideIndex }),
    });
  } catch (error) {
    console.error('Failed to update slide:', error);
  }
}

function renderSlide() {
  console.log('renderSlide called, currentSlide:', currentSlide);
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found!');
    return;
  }
  
  app.innerHTML = slideRenderer.renderSlide(currentSlide, isPresenter);

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyPress);

  // Add event listeners to buttons
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const fullscreenBtn = document.getElementById("fullscreen");

  if (prevBtn) {
    prevBtn.onclick = async () => {
      if (currentSlide > 0) {
        currentSlide--;
        await updateSlide(currentSlide);
        renderSlide();
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.onclick = async () => {
      if (currentSlide < slideRenderer.getTotalSlides() - 1) {
        currentSlide++;
        await updateSlide(currentSlide);
        renderSlide();
      }
    };
  }
  
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    };
  }
}

function handleKeyPress(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (currentSlide > 0) {
      currentSlide--;
      updateSlide(currentSlide);
      renderSlide();
    }
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') {
    event.preventDefault();
    if (currentSlide < slideRenderer.getTotalSlides() - 1) {
      currentSlide++;
      updateSlide(currentSlide);
      renderSlide();
    }
  } else if (event.key === 'f' || event.key === 'F11') {
    event.preventDefault();
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
}

// Initialize the app
window.onload = async () => {
  console.log('Window loaded, initializing presenter...');
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found on window load!');
    return;
  }
  
  app.innerHTML = '<div class="text-center text-white">Loading slides...</div>';
  
  try {
    const loaded = await slideRenderer.loadSlides();
    if (loaded) {
      console.log('Slides loaded successfully, rendering first slide');
      renderSlide();
    } else {
      console.error('Failed to load slides');
      app.innerHTML = '<div class="text-red-500 text-center">Failed to load slides. Please check slides.json file.</div>';
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    app.innerHTML = '<div class="text-red-500 text-center">Error loading presentation: ' + error.message + '</div>';
  }
}; 