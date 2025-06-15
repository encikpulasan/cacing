import { SlideRenderer } from './slide-renderer.js';

let currentSlide = 0;
let totalSlides = 0;
let slides = [];
const isPresenter = false;
const slideRenderer = new SlideRenderer();

// UI Elements
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const slideCounter = document.getElementById('slide-counter');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// PDF generation libraries loading
let jsPDFReady = false;
let html2canvasReady = false;
let librariesReady = false;

function loadPDFLibraries() {
    // Load jsPDF v1.5.3 (confirmed working version)
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js';
    
    jsPDFScript.onload = () => {
        jsPDFReady = !!window.jsPDF;
        checkLibrariesReady();
    };
    
    jsPDFScript.onerror = () => {
        console.error('Failed to load jsPDF library');
        updatePDFButtonState();
    };
    
    // Load html2canvas
    const html2canvasScript = document.createElement('script');
    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    
    html2canvasScript.onload = () => {
        html2canvasReady = !!window.html2canvas;
        checkLibrariesReady();
    };
    
    html2canvasScript.onerror = () => {
        console.error('Failed to load html2canvas library');
        updatePDFButtonState();
    };
    
    document.head.appendChild(jsPDFScript);
    document.head.appendChild(html2canvasScript);
}

function checkLibrariesReady() {
    librariesReady = jsPDFReady && html2canvasReady;
    updatePDFButtonState();
}

function updatePDFButtonState() {
    const downloadBtn = document.getElementById('pdf-btn');
    if (!downloadBtn) return;
    
    if (librariesReady) {
        downloadBtn.textContent = 'Download PDF';
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else if (jsPDFReady || html2canvasReady) {
        downloadBtn.textContent = 'PDF Loading...';
        downloadBtn.disabled = true;
        downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        downloadBtn.textContent = 'PDF Unavailable';
        downloadBtn.disabled = true;
        downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function renderSlide() {
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found!');
    return;
  }
  
  app.innerHTML = slideRenderer.renderSlide(currentSlide, isPresenter);
  updateControls();
}

function updateControls() {
  slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
  updatePDFButtonState();
}

function goToPreviousSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    renderSlide();
  }
}

function goToNextSlide() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    renderSlide();
  }
}

function setupEventListeners() {
  // Navigation buttons
  prevBtn.addEventListener('click', goToPreviousSlide);
  nextBtn.addEventListener('click', goToNextSlide);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        goToPreviousSlide();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        goToNextSlide();
        break;
      case 'Home':
        e.preventDefault();
        currentSlide = 0;
        renderSlide();
        break;
      case 'End':
        e.preventDefault();
        currentSlide = totalSlides - 1;
        renderSlide();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  });
  
  // PDF download
  const downloadBtn = document.getElementById('pdf-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPDF);
  }
  
  // Fullscreen toggle
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  
  // Handle fullscreen changes
  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  document.addEventListener('mozfullscreenchange', updateFullscreenButton);
  document.addEventListener('MSFullscreenChange', updateFullscreenButton);
}

function toggleFullscreen() {
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
}

function updateFullscreenButton() {
  const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                         document.mozFullScreenElement || document.msFullscreenElement);
  
  if (isFullscreen) {
    fullscreenBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
  } else {
    fullscreenBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
      </svg>
    `;
  }
}

async function downloadPDF() {
  if (!librariesReady) {
    alert('PDF libraries are still loading. Please try again in a moment.');
    return;
  }

  const downloadBtn = document.getElementById('pdf-btn');
  const originalText = downloadBtn.textContent;
  const originalSlide = currentSlide;
  
  try {
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;
    
    // Create PDF with landscape orientation for slides
    const pdf = new window.jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Create a hidden container for rendering slides without affecting the visible UI
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 100vw;
      height: 100vh;
      background: #0f172a;
      z-index: -1000;
      pointer-events: none;
    `;
    hiddenContainer.id = 'pdf-render-container';
    document.body.appendChild(hiddenContainer);
    
    for (let i = 0; i < totalSlides; i++) {
      // Render slide in hidden container without affecting visible UI
      hiddenContainer.innerHTML = slideRenderer.renderSlide(i, false);
      
      // Wait for slide to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture the hidden slide
      const canvas = await window.html2canvas(hiddenContainer, {
        width: 1920,
        height: 1080,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: slides[i]?.background || '#1f2937',
        logging: false,
        removeContainer: false
      });
      
      // Add new page for subsequent slides
      if (i > 0) {
        pdf.addPage();
      }
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      
      // Update progress
      const progress = Math.round(((i + 1) / totalSlides) * 100);
      downloadBtn.textContent = `Generating PDF... ${progress}%`;
    }
    
    // Clean up hidden container
    document.body.removeChild(hiddenContainer);
    
    // Restore original slide view
    currentSlide = originalSlide;
    renderSlide();
    
    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    const filename = `slides_${timestamp}.pdf`;
    
    pdf.save(filename);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Please try again.');
    
    // Clean up hidden container if it exists
    const hiddenContainer = document.getElementById('pdf-render-container');
    if (hiddenContainer) {
      document.body.removeChild(hiddenContainer);
    }
    
    // Restore original slide view
    currentSlide = originalSlide;
    renderSlide();
    
  } finally {
    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;
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

// Touch/swipe navigation for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  if (!touchStartX || !touchStartY) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchStartX - touchEndX;
  const deltaY = touchStartY - touchEndY;
  
  // Only trigger if horizontal swipe is more significant than vertical
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // Swipe left - next slide
      goToNextSlide();
    } else {
      // Swipe right - previous slide
      goToPreviousSlide();
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
});

// Initialize the app
async function initializeReader() {
  const app = document.getElementById("app");
  
  if (!app) {
    console.error('App element not found on initialization!');
    return;
  }
  
  app.innerHTML = '<div class="text-center text-white"><div class="animate-pulse">Loading presentation...</div></div>';
  
  try {
    const loaded = await slideRenderer.loadSlides();
    if (loaded) {
      totalSlides = slideRenderer.slides.length;
      slides = slideRenderer.slides;
      setupEventListeners();
      renderSlide();
      
      // Load PDF libraries after slides are ready
      loadPDFLibraries();
      
    } else {
      console.error('Failed to load slides');
      app.innerHTML = '<div class="text-red-500 text-center">Failed to load slides. Please check your connection.</div>';
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    app.innerHTML = '<div class="text-red-500 text-center">Error loading presentation: ' + error.message + '</div>';
  }
}

// Auto-initialize when the module loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReader);
} else {
  initializeReader();
}

export default initializeReader; 