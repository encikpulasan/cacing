import { SlideRenderer } from './slide-renderer.js';

console.log('Viewer.js loaded');

let currentSlide = 0;
const isPresenter = false; // Always viewer mode
const slideRenderer = new SlideRenderer();
let eventSource = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connectToEventSource() {
  if (eventSource) {
    eventSource.close();
  }
  
  console.log('Connecting to SSE...');
  eventSource = new EventSource('/events');
  
  eventSource.onopen = () => {
    console.log('SSE connection opened');
    reconnectAttempts = 0;
    updateSyncStatus('connected');
  };
  
  eventSource.onmessage = (event) => {
    console.log('SSE message received:', event.data);
    try {
      // Oak wraps the data in another data field, so we need to parse twice
      const outerData = JSON.parse(event.data);
      const actualData = JSON.parse(outerData.data);
      
      console.log('Parsed SSE data:', actualData);
      
      if (actualData.type === 'slide') {
        currentSlide = actualData.index;
        renderSlide();
        updateSyncStatus('synced');
      }
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.log('SSE connection error:', error);
    updateSyncStatus('disconnected');
    
    // Attempt to reconnect
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
      setTimeout(() => {
        connectToEventSource();
      }, 2000 * reconnectAttempts); // Exponential backoff
    } else {
      console.log('Max reconnection attempts reached');
      updateSyncStatus('failed');
    }
  };
}

function updateSyncStatus(status) {
  const syncStatus = document.getElementById('sync-status');
  if (!syncStatus) return;
  
  switch (status) {
    case 'connected':
      syncStatus.innerHTML = '<span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>Connected';
      syncStatus.className = 'sync-indicator rounded-full px-3 py-1 text-xs font-medium bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30';
      break;
    case 'synced':
      syncStatus.innerHTML = '<span class="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>Synced';
      syncStatus.className = 'sync-indicator rounded-full px-3 py-1 text-xs font-medium bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30';
      break;
    case 'disconnected':
      syncStatus.innerHTML = '<span class="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>Reconnecting...';
      syncStatus.className = 'sync-indicator rounded-full px-3 py-1 text-xs font-medium bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-30';
      break;
    case 'failed':
      syncStatus.innerHTML = '<span class="inline-block w-2 h-2 bg-red-400 rounded-full mr-2"></span>Connection Failed';
      syncStatus.className = 'sync-indicator rounded-full px-3 py-1 text-xs font-medium bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30';
      break;
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
}

function setupFullscreenButton() {
  const fullscreenBtn = document.getElementById("mobile-fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          el.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };
  }
}

// Handle fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('mozfullscreenchange', updateFullscreenButton);
document.addEventListener('MSFullscreenChange', updateFullscreenButton);

function updateFullscreenButton() {
  const fullscreenBtn = document.getElementById("mobile-fullscreen");
  if (fullscreenBtn) {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                           document.mozFullScreenElement || document.msFullscreenElement);
    
    if (isFullscreen) {
      fullscreenBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
    } else {
      fullscreenBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
        </svg>
      `;
    }
  }
}

// Prevent zoom on double tap for better mobile experience
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Handle page visibility changes to reconnect when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && (!eventSource || eventSource.readyState === EventSource.CLOSED)) {
    console.log('Page became visible, reconnecting...');
    connectToEventSource();
  }
});

// Initialize the app
window.onload = async () => {
  console.log('Window loaded, initializing viewer...');
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found on window load!');
    return;
  }
  
  app.innerHTML = '<div class="text-center text-white"><div class="animate-pulse">Loading presentation...</div></div>';
  
  try {
    const loaded = await slideRenderer.loadSlides();
    if (loaded) {
      console.log('Slides loaded successfully, rendering current slide');
      renderSlide();
      setupFullscreenButton();
      connectToEventSource();
    } else {
      console.error('Failed to load slides');
      app.innerHTML = '<div class="text-red-500 text-center">Failed to load slides. Please check your connection.</div>';
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    app.innerHTML = '<div class="text-red-500 text-center">Error loading presentation: ' + error.message + '</div>';
  }
}; 