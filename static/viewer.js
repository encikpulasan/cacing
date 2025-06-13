import { SlideRenderer } from './slide-renderer.js';

let currentSlide = 0;
const isPresenter = false; // Always viewer mode
const slideRenderer = new SlideRenderer();

// Use Server-Sent Events to receive slide updates
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'slide') {
    currentSlide = data.index;
    renderSlide();
  }
};

eventSource.onerror = (error) => {
  console.log('SSE connection error:', error);
};

function renderSlide() {
  const app = document.getElementById("app");
  app.innerHTML = slideRenderer.renderSlide(currentSlide, isPresenter);

  // Keyboard navigation for fullscreen only
  document.addEventListener('keydown', handleKeyPress);
  
  const fullscreenBtn = document.getElementById("fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    };
  }
}

function handleKeyPress(event) {
  if (event.key === 'f' || event.key === 'F11') {
    event.preventDefault();
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
}

// Initialize the app
window.onload = async () => {
  const app = document.getElementById("app");
  app.innerHTML = '<div class="text-center">Loading slides...</div>';
  
  const loaded = await slideRenderer.loadSlides();
  if (loaded) {
    renderSlide();
  } else {
    app.innerHTML = '<div class="text-red-500 text-center">Failed to load slides. Please check slides.json file.</div>';
  }
}; 