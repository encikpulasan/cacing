// Markdown Parser Module
export class MarkdownParser {
  constructor() {
    this.slides = [];
    this.config = {};
  }

  parseMarkdown(markdownText) {
    console.log('Parsing markdown content...');
    
    // Extract config from the beginning
    this.config = this.extractConfig(markdownText);
    
    // Split by slide separators (---)
    const sections = markdownText.split(/^---$/gm);
    
    // Skip the first section if it only contains config
    const slidesSections = sections.filter(section => {
      const trimmed = section.trim();
      return trimmed && !trimmed.startsWith('<!-- SLIDE_CONFIG');
    });
    
    this.slides = slidesSections.map((section, index) => {
      return this.parseSlide(section.trim(), index);
    }).filter(slide => slide !== null);
    
    console.log(`Parsed ${this.slides.length} slides`);
    return { slides: this.slides, config: this.config };
  }

  extractConfig(markdownText) {
    const configMatch = markdownText.match(/<!-- SLIDE_CONFIG\s*([\s\S]*?)\s*-->/);
    const defaultConfig = {
      title: "Presentation",
      author: "Unknown",
      theme: "dark"
    };
    
    if (!configMatch) return defaultConfig;
    
    const configText = configMatch[1];
    const config = { ...defaultConfig };
    
    // Parse simple key: value pairs
    const lines = configText.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*"([^"]*)"$/);
      if (match) {
        config[match[1]] = match[2];
      }
    }
    
    return config;
  }

  parseSlide(section, index) {
    if (!section) return null;
    
    // Extract slide metadata
    const slideConfig = this.extractSlideConfig(section);
    
    // Remove slide config comments from content
    const content = section.replace(/<!-- SLIDE:.*?-->/g, '').trim();
    
    if (!content) return null;
    
    // Parse markdown content
    const parsedContent = this.parseMarkdownContent(content);
    
    return {
      id: index,
      type: slideConfig.type || 'text',
      background: slideConfig.background || '#1f2937',
      title: parsedContent.title || `Slide ${index + 1}`,
      content: parsedContent.content,
      list: parsedContent.list,
      media: parsedContent.media
    };
  }

  extractSlideConfig(section) {
    const configMatch = section.match(/<!-- SLIDE:\s*([^>]*)\s*-->/);
    const config = { type: 'text', background: '#1f2937' };
    
    if (!configMatch) return config;
    
    const configText = configMatch[1];
    const pairs = configText.split(',');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        config[key] = value;
      }
    }
    
    return config;
  }

  parseMarkdownContent(markdown) {
    const lines = markdown.split('\n');
    let title = '';
    let content = '';
    let list = [];
    let media = null;
    
    let currentSection = 'content';
    let listItems = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract title (first h1)
      if (line.startsWith('# ') && !title) {
        title = line.substring(2).trim();
        continue;
      }
      
      // Handle images
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        media = {
          type: 'image',
          src: imageMatch[2],
          alt: imageMatch[1] || 'Image'
        };
        continue;
      }
      
      // Handle videos
      const videoMatch = line.match(/<video([^>]*)>/);
      if (videoMatch) {
        const videoAttrs = videoMatch[1];
        const controlsMatch = videoAttrs.match(/controls/);
        const posterMatch = videoAttrs.match(/poster="([^"]+)"/);
        
        // Look for source tag in next lines
        let src = '';
        for (let j = i + 1; j < lines.length && j < i + 5; j++) {
          const sourceMatch = lines[j].match(/<source src="([^"]+)"/);
          if (sourceMatch) {
            src = sourceMatch[1];
            break;
          }
        }
        
        if (src) {
          media = {
            type: 'video',
            src: src,
            controls: !!controlsMatch,
            poster: posterMatch ? posterMatch[1] : null
          };
        }
        continue;
      }
      
      // Handle list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        listItems.push(this.parseInlineMarkdown(line.substring(2).trim()));
        continue;
      }
      
      // Handle numbered lists
      if (line.match(/^\d+\.\s/)) {
        listItems.push(this.parseInlineMarkdown(line.replace(/^\d+\.\s/, '')));
        continue;
      }
      
      // Handle nested list items
      if (line.match(/^\s+[-*]\s/)) {
        const indent = line.match(/^(\s+)/)[1].length;
        const text = line.replace(/^\s+[-*]\s/, '');
        listItems.push('&nbsp;'.repeat(indent) + this.parseInlineMarkdown(text));
        continue;
      }
      
      // Skip empty lines and headers (except h1)
      if (!line || line.startsWith('#')) {
        continue;
      }
      
      // Skip HTML comments and code blocks
      if (line.startsWith('<!--') || line.startsWith('```')) {
        continue;
      }
      
      // Add to content
      if (line) {
        content += (content ? ' ' : '') + this.parseInlineMarkdown(line);
      }
    }
    
    // Set list if we found list items
    if (listItems.length > 0) {
      list = listItems;
    }
    
    return {
      title: title || 'Untitled Slide',
      content: content || '',
      list: list.length > 0 ? list : null,
      media: media
    };
  }

  parseInlineMarkdown(text) {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank">$1</a>');
  }
} 