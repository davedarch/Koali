class Challenge {
  constructor(options = {}) {
    this.container = null;
    this.options = options;
    this.currentLevel = 1;
  }
  
  init(container) {
    this.container = container;
  }
  
  generateChallenge(level) {
    // Determine if we should use a sequence challenge based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const inputType = urlParams.get('input');
    
    console.log("Challenge.generateChallenge - URL params:", urlParams.toString());
    console.log("Challenge.generateChallenge - Input type from URL:", inputType);
    
    if (inputType === 'sequence') {
      console.log("Using sequence challenge type");
      return this.generateSequenceChallenge(level);
    } else {
      console.log("Using standard challenge type (not sequence)");
      // Base method to be overridden by specific challenge types
      throw new Error('generateChallenge method must be implemented by subclass');
    }
  }
  
  generateSequenceChallenge(level) {
    // Base method to be overridden by specific challenge types
    throw new Error('generateSequenceChallenge method must be implemented by subclass');
  }
  
  createElements(count) {
    const elements = [];
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      elements.push(element);
    }
    return elements;
  }
  
  renderElements(elements) {
    // Add elements to the container
    elements.forEach(element => {
      this.container.appendChild(element);
    });
    
    // Force a reflow to ensure elements are rendered before positioning
    this.container.offsetHeight;
  }
  
  positionElements(elements) {
    // Position elements in the container
    const containerRect = this.container.getBoundingClientRect();
    const usableWidth = containerRect.width * 0.8;
    const usableHeight = containerRect.height * 0.6;
    const topMargin = containerRect.height * 0.15;
    
    elements.forEach(element => {
      // Get element dimensions
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      
      // Calculate random position within usable area
      const left = Math.random() * (usableWidth - width) + containerRect.width * 0.1;
      const top = Math.random() * (usableHeight - height) + topMargin;
      
      // Apply position
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
    });
  }
  
  cleanup() {
    // Remove all elements from the container
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
} 