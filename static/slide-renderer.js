// Slide Renderer Module
export class SlideRenderer {
  constructor() {
    this.slides = [];
    this.config = {};
    console.log('SlideRenderer initialized');
  }

  async loadSlides() {
    try {
      console.log('Loading slides from /api/slides...');
      const response = await fetch('/api/slides');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Slides loaded successfully:', data);
      
      this.slides = data.slides;
      this.config = data.config;
      return true;
    } catch (error) {
      console.error('Failed to load slides:', error);
      return false;
    }
  }

  renderSlide(slideIndex, isPresenter = false) {
    console.log(`Rendering slide ${slideIndex}, isPresenter: ${isPresenter}`);
    
    if (!this.slides || slideIndex >= this.slides.length || slideIndex < 0) {
      console.error('Slide not found:', { slideIndex, totalSlides: this.slides.length });
      return '<div class="text-red-500">Slide not found</div>';
    }

    const slide = this.slides[slideIndex];
    console.log('Rendering slide:', slide);
    
    const modeIndicator = isPresenter 
      ? '<div class="mb-4 text-sm text-blue-400 font-semibold">🎤 PRESENTER MODE</div>'
      : '<div class="mb-4 text-sm text-green-400 font-semibold">👀 VIEWER MODE</div>';

    let slideContent = '';

    // Render based on slide type
    switch (slide.type) {
      case 'text':
        slideContent = this.renderTextSlide(slide);
        break;
      case 'image':
        slideContent = this.renderImageSlide(slide);
        break;
      case 'video':
        slideContent = this.renderVideoSlide(slide);
        break;
      case 'mixed':
        slideContent = this.renderMixedSlide(slide);
        break;
      default:
        slideContent = this.renderTextSlide(slide);
    }

    const controls = isPresenter ? this.renderPresenterControls(slideIndex) : this.renderViewerControls();
    const navigation = this.renderNavigation(slideIndex, isPresenter);

    return `
      <div class="flex flex-col items-center justify-center w-full h-full" style="background-color: ${slide.background || '#1f2937'}">
        ${modeIndicator}
        ${slideContent}
        ${controls}
        <div class="text-sm text-gray-400 mb-2">Slide ${slideIndex + 1} of ${this.slides.length}</div>
        ${navigation}
      </div>
    `;
  }

  renderTextSlide(slide) {
    const listItems = slide.list ? 
      `<ul class="text-lg space-y-2 mt-4 text-left max-w-2xl">
        ${slide.list.map(item => `<li class="flex items-start"><span class="mr-2">•</span><span>${item}</span></li>`).join('')}
      </ul>` : '';

    return `
      <h1 class="text-4xl font-bold mb-4 text-center">${slide.title}</h1>
      <p class="text-xl mb-4 text-center max-w-4xl">${slide.content}</p>
      ${listItems}
    `;
  }

  renderImageSlide(slide) {
    const media = slide.media;
    return `
      <h1 class="text-4xl font-bold mb-4 text-center">${slide.title}</h1>
      <div class="flex flex-col lg:flex-row items-center gap-8 max-w-6xl">
        <div class="flex-1">
          <p class="text-xl mb-4">${slide.content}</p>
        </div>
        <div class="flex-1">
          <img src="${media.src}" alt="${media.alt}" class="max-w-full h-auto rounded-lg shadow-lg" 
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='; this.alt='Image not found';" />
        </div>
      </div>
    `;
  }

  renderVideoSlide(slide) {
    const media = slide.media;
    return `
      <h1 class="text-4xl font-bold mb-4 text-center">${slide.title}</h1>
      <p class="text-xl mb-6 text-center max-w-4xl">${slide.content}</p>
      <div class="max-w-4xl w-full">
        <video class="w-full rounded-lg shadow-lg" ${media.controls ? 'controls' : ''} ${media.poster ? `poster="${media.poster}"` : ''}>
          <source src="${media.src}" type="video/mp4">
          <p class="text-gray-400">Your browser doesn't support video playback.</p>
        </video>
      </div>
    `;
  }

  renderMixedSlide(slide) {
    const media = slide.media;
    const listItems = slide.list ? 
      `<ul class="text-lg space-y-2 text-left">
        ${slide.list.map(item => `<li class="flex items-start"><span class="mr-2">•</span><span>${item}</span></li>`).join('')}
      </ul>` : '';

    let mediaElement = '';
    if (media) {
      if (media.type === 'image') {
        mediaElement = `<img src="${media.src}" alt="${media.alt}" class="max-w-full h-auto rounded-lg shadow-lg" 
                       onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='; this.alt='Image not found';" />`;
      } else if (media.type === 'video') {
        mediaElement = `<video class="w-full rounded-lg shadow-lg" ${media.controls ? 'controls' : ''} ${media.poster ? `poster="${media.poster}"` : ''}>
                        <source src="${media.src}" type="video/mp4">
                        <p class="text-gray-400">Your browser doesn't support video playback.</p>
                      </video>`;
      }
    }

    return `
      <h1 class="text-4xl font-bold mb-4 text-center">${slide.title}</h1>
      <div class="flex flex-col lg:flex-row items-start gap-8 max-w-6xl">
        <div class="flex-1">
          <p class="text-xl mb-4">${slide.content}</p>
          ${listItems}
        </div>
        ${mediaElement ? `<div class="flex-1">${mediaElement}</div>` : ''}
      </div>
    `;
  }

  renderPresenterControls(slideIndex) {
    return `
      <div class="flex gap-4 mb-4">
        <button id="prev" class="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" ${slideIndex === 0 ? "disabled" : ""}>← Previous</button>
        <button id="next" class="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" ${slideIndex === this.slides.length - 1 ? "disabled" : ""}>Next →</button>
        <button id="fullscreen" class="px-6 py-3 bg-green-600 rounded hover:bg-green-700">🔍 Full Screen</button>
      </div>
    `;
  }

  renderViewerControls() {
    return `
      <div class="flex gap-4 mb-4">
        <button id="fullscreen" class="px-6 py-3 bg-green-600 rounded hover:bg-green-700">🔍 Full Screen</button>
      </div>
      <div class="text-xs text-gray-500 mb-4">
        Waiting for presenter to change slides...
      </div>
    `;
  }

  renderNavigation(slideIndex, isPresenter) {
    return `
      <div class="text-xs text-gray-500">
        <a href="/" class="hover:text-gray-300">← Back to Home</a> | 
        <a href="${isPresenter ? '/viewer' : '/presenter'}" target="_blank" class="hover:text-gray-300">
          ${isPresenter ? 'Open Viewer →' : 'Open Presenter →'}
        </a>
      </div>
    `;
  }

  getTotalSlides() {
    return this.slides.length;
  }

  getSlideTitle(slideIndex) {
    return this.slides[slideIndex]?.title || 'Untitled Slide';
  }
} 