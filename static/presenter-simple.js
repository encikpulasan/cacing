console.log('Simple presenter.js loaded');

let currentSlide = 0;
let slides = [];

// Simple slide renderer without modules
function renderSlide() {
  console.log('renderSlide called, currentSlide:', currentSlide);
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found!');
    return;
  }

  if (slides.length === 0) {
    app.innerHTML = '<div class="text-center text-white">No slides loaded</div>';
    return;
  }

  const slide = slides[currentSlide];
  
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center w-full h-full" style="background-color: ${slide.background || '#1f2937'}">
      <div class="mb-4 text-sm text-blue-400 font-semibold">🎤 PRESENTER MODE</div>
      <h1 class="text-4xl font-bold mb-4 text-center">${slide.title}</h1>
      <p class="text-xl mb-4 text-center max-w-4xl">${slide.content}</p>
      <div class="flex gap-4 mb-4">
        <button id="prev" class="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" ${currentSlide === 0 ? "disabled" : ""}>← Previous</button>
        <button id="next" class="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" ${currentSlide === slides.length - 1 ? "disabled" : ""}>Next →</button>
        <button id="fullscreen" class="px-6 py-3 bg-green-600 rounded hover:bg-green-700">🔍 Full Screen</button>
      </div>
      <div class="text-sm text-gray-400 mb-2">Slide ${currentSlide + 1} of ${slides.length}</div>
      <div class="text-xs text-gray-500">
        <a href="/" class="hover:text-gray-300">← Back to Home</a> | 
        <a href="/viewer" target="_blank" class="hover:text-gray-300">Open Viewer →</a>
      </div>
    </div>
  `;

  // Add event listeners
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const fullscreenBtn = document.getElementById("fullscreen");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentSlide > 0) {
        currentSlide--;
        renderSlide();
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
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

async function loadSlides() {
  try {
    console.log('Loading slides from /api/slides...');
    const response = await fetch('/api/slides');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Slides loaded successfully:', data);
    
    slides = data.slides;
    return true;
  } catch (error) {
    console.error('Failed to load slides:', error);
    return false;
  }
}

// Initialize the app
window.onload = async () => {
  console.log('Window loaded, initializing simple presenter...');
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found on window load!');
    return;
  }
  
  app.innerHTML = '<div class="text-center text-white">Loading slides...</div>';
  
  try {
    const loaded = await loadSlides();
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