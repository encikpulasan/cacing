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
    
    // Professional mode indicator
    const modeIndicator = isPresenter 
      ? '<div class="mb-4 px-4 py-2 rounded-full text-xs font-semibold bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 backdrop-filter backdrop-blur-sm">🎤 PRESENTER</div>'
      : '<div class="viewer-badge mb-4 px-4 py-2 rounded-full text-xs font-semibold">👁️ VIEWER</div>';

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

    const controls = isPresenter ? this.renderPresenterControls(slideIndex) : '';
    const slideCounter = this.renderSlideCounter(slideIndex);

    return `
      <div class="flex flex-col items-center justify-center w-full h-full relative" style="background: ${slide.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}">
        ${modeIndicator}
        <div class="slide-content rounded-2xl p-6 md:p-8 max-w-6xl w-full mx-4 text-center">
          ${slideContent}
        </div>
        ${controls}
        ${slideCounter}
      </div>
    `;
  }

  renderTextSlide(slide) {
    const titleStyle = slide.titleStyle ? this.generateStyleString(slide.titleStyle) : '';
    const contentStyle = slide.contentStyle ? this.generateStyleString(slide.contentStyle) : '';
    const listStyle = slide.listStyle ? this.generateStyleString(slide.listStyle) : '';

    const listItems = slide.list ? 
      `<ul class="slide-text text-lg md:text-xl space-y-3 mt-6 text-left max-w-3xl mx-auto" ${listStyle ? `style="${listStyle}"` : ''}>
        ${slide.list.map(item => `<li class="flex items-start leading-relaxed"><span class="mr-3 text-blue-300 font-bold">•</span><span>${item}</span></li>`).join('')}
      </ul>` : '';

    // Apply layout template
    return this.applyLayoutTemplate(slide, {
      title: `<h1 class="slide-title text-3xl md:text-5xl font-bold mb-6 text-white leading-tight" ${titleStyle ? `style="${titleStyle}"` : ''}>${slide.title}</h1>`,
      content: slide.content ? `<div class="slide-text text-lg md:text-xl mb-6 text-gray-100 max-w-4xl mx-auto leading-relaxed" ${contentStyle ? `style="${contentStyle}"` : ''}>${slide.content}</div>` : '',
      list: listItems,
      media: null
    });
  }

  renderImageSlide(slide) {
    const media = slide.media;
    if (!media) {
      return this.renderTextSlide(slide);
    }

    const titleStyle = slide.titleStyle ? this.generateStyleString(slide.titleStyle) : '';
    const contentStyle = slide.contentStyle ? this.generateStyleString(slide.contentStyle) : '';

    const mediaElement = `<img src="${media.src}" alt="${media.alt}" class="w-full h-auto rounded-xl shadow-2xl mx-auto" 
                         style="max-height: 60vh; object-fit: contain;"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='; this.alt='Image not found';" />`;

    // Apply layout template
    return this.applyLayoutTemplate(slide, {
      title: `<h1 class="slide-title text-3xl md:text-5xl font-bold mb-6 text-white leading-tight" ${titleStyle ? `style="${titleStyle}"` : ''}>${slide.title}</h1>`,
      content: slide.content ? `<div class="slide-text text-lg md:text-xl mb-8 text-gray-100 max-w-4xl mx-auto leading-relaxed text-center" ${contentStyle ? `style="${contentStyle}"` : ''}>${slide.content}</div>` : '',
      list: null,
      media: mediaElement
    });
  }

  renderVideoSlide(slide) {
    const media = slide.media;
    if (!media) {
      return this.renderTextSlide(slide);
    }

    const titleStyle = slide.titleStyle ? this.generateStyleString(slide.titleStyle) : '';
    const contentStyle = slide.contentStyle ? this.generateStyleString(slide.contentStyle) : '';

    const mediaElement = `<video class="w-full rounded-xl shadow-2xl" ${media.controls ? 'controls' : ''} ${media.poster ? `poster="${media.poster}"` : ''}>
                          <source src="${media.src}" type="video/mp4">
                          <p class="text-gray-300">Your browser doesn't support video playback.</p>
                        </video>`;

    // Apply layout template
    return this.applyLayoutTemplate(slide, {
      title: `<h1 class="slide-title text-3xl md:text-5xl font-bold mb-6 text-white leading-tight" ${titleStyle ? `style="${titleStyle}"` : ''}>${slide.title}</h1>`,
      content: slide.content ? `<div class="slide-text text-lg md:text-xl mb-8 text-gray-100 max-w-4xl mx-auto leading-relaxed" ${contentStyle ? `style="${contentStyle}"` : ''}>${slide.content}</div>` : '',
      list: null,
      media: mediaElement
    });
  }

  renderMixedSlide(slide) {
    const media = slide.media;
    const titleStyle = slide.titleStyle ? this.generateStyleString(slide.titleStyle) : '';
    const contentStyle = slide.contentStyle ? this.generateStyleString(slide.contentStyle) : '';
    const listStyle = slide.listStyle ? this.generateStyleString(slide.listStyle) : '';

    const listItems = slide.list ? 
      `<ul class="slide-text text-lg md:text-xl space-y-3 text-left" ${listStyle ? `style="${listStyle}"` : ''}>
        ${slide.list.map(item => `<li class="flex items-start leading-relaxed"><span class="mr-3 text-blue-300 font-bold">•</span><span>${item}</span></li>`).join('')}
      </ul>` : '';

    let mediaElement = '';
    if (media) {
      if (media.type === 'image') {
        mediaElement = `<img src="${media.src}" alt="${media.alt}" class="w-full h-auto rounded-xl shadow-2xl mx-auto" 
                       style="max-height: 50vh; object-fit: contain;"
                       onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='; this.alt='Image not found';" />`;
      } else if (media.type === 'video') {
        mediaElement = `<video class="w-full rounded-xl shadow-2xl mx-auto" style="max-height: 50vh;" ${media.controls ? 'controls' : ''} ${media.poster ? `poster="${media.poster}"` : ''}>
                        <source src="${media.src}" type="video/mp4">
                        <p class="text-gray-300">Your browser doesn't support video playback.</p>
                      </video>`;
      }
    }

    // Apply layout template
    return this.applyLayoutTemplate(slide, {
      title: `<h1 class="slide-title text-3xl md:text-5xl font-bold mb-6 text-white leading-tight" ${titleStyle ? `style="${titleStyle}"` : ''}>${slide.title}</h1>`,
      content: slide.content ? `<div class="slide-text text-lg md:text-xl mb-6 text-gray-100 leading-relaxed" ${contentStyle ? `style="${contentStyle}"` : ''}>${slide.content}</div>` : '',
      list: listItems,
      media: mediaElement
    });
  }

  renderPresenterControls(slideIndex) {
    return `
      <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-50">
        <button id="prev" class="control-button px-4 py-3 md:px-6 md:py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed" ${slideIndex === 0 ? "disabled" : ""}>
          <svg class="w-5 h-5 md:w-6 md:h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span class="hidden md:inline">Previous</span>
        </button>
        <button id="next" class="control-button px-4 py-3 md:px-6 md:py-3 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed" ${slideIndex === this.slides.length - 1 ? "disabled" : ""}>
          <span class="hidden md:inline">Next</span>
          <svg class="w-5 h-5 md:w-6 md:h-6 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        <button id="fullscreen" class="control-button px-4 py-3 rounded-xl text-white font-medium">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
          </svg>
        </button>
      </div>
    `;
  }

  renderSlideCounter(slideIndex) {
    return `
      <div class="fixed bottom-4 right-4 px-3 py-2 rounded-full text-xs font-medium backdrop-filter backdrop-blur-sm bg-white bg-opacity-10 border border-white border-opacity-20 text-white z-40">
        ${slideIndex + 1} / ${this.slides.length}
      </div>
    `;
  }

  getTotalSlides() {
    return this.slides.length;
  }

  getSlideTitle(slideIndex) {
    return this.slides[slideIndex]?.title || 'Untitled Slide';
  }

  // Helper method to generate CSS style string from style object
  generateStyleString(styleObj) {
    if (!styleObj || typeof styleObj !== 'object') return '';
    
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  // Apply layout template to slide content
  applyLayoutTemplate(slide, elements) {
    const layout = slide.layout || 'default';
    
    switch (layout) {
      case 'title-only':
        return `
          <div class="flex flex-col items-center justify-center w-full h-full text-center">
            ${elements.title}
          </div>
        `;
        
      case 'title-content':
        return `
          <div class="flex flex-col items-center justify-center w-full h-full text-center">
            ${elements.title}
            ${elements.content}
          </div>
        `;
        
      case 'title-list':
        return `
          <div class="flex flex-col items-center justify-start w-full h-full">
            <div class="text-center mb-8">
              ${elements.title}
            </div>
            <div class="flex-1 flex items-center justify-center w-full">
              ${elements.list}
            </div>
          </div>
        `;
        
      case 'title-media':
        return `
          <div class="flex flex-col items-center justify-center w-full h-full">
            <div class="text-center mb-8">
              ${elements.title}
            </div>
            <div class="flex-1 flex items-center justify-center w-full">
              <div class="max-w-5xl w-full">
                ${elements.media}
              </div>
            </div>
          </div>
        `;
        
      case 'split-content-media':
        if (elements.media) {
          return `
            <div class="flex flex-col items-center justify-center w-full h-full">
              ${elements.title}
              <div class="flex flex-col lg:flex-row items-center gap-8 max-w-6xl w-full flex-1">
                <div class="flex-1 text-left">
                  ${elements.content}
                  ${elements.list || ''}
                </div>
                <div class="flex-1 flex justify-center">
                  ${elements.media}
                </div>
              </div>
            </div>
          `;
        }
        // Fall through to default if no media
        
      case 'two-column':
        return `
          <div class="flex flex-col items-center justify-center w-full h-full">
            ${elements.title}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full flex-1 items-center">
              <div class="text-left">
                ${elements.content}
              </div>
              <div class="text-left">
                ${elements.list || elements.media || ''}
              </div>
            </div>
          </div>
        `;
        
      case 'center-focus':
        return `
          <div class="flex flex-col items-center justify-center w-full h-full text-center">
            ${elements.title}
            <div class="max-w-4xl mx-auto">
              ${elements.content}
              ${elements.list || ''}
              ${elements.media || ''}
            </div>
          </div>
        `;
        
      case 'full-media':
        return `
          <div class="flex flex-col items-center justify-center w-full h-full">
            <div class="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
              ${elements.title}
            </div>
            <div class="w-full h-full flex items-center justify-center">
              ${elements.media || elements.content}
            </div>
          </div>
        `;
        
      default: // 'default' layout
        return `
          <div class="flex flex-col items-center justify-center w-full h-full text-center">
            ${elements.title}
            ${elements.content}
            ${elements.list || ''}
            ${elements.media ? `<div class="flex justify-center items-center w-full mt-6"><div class="max-w-4xl w-full">${elements.media}</div></div>` : ''}
          </div>
        `;
    }
  }
} 