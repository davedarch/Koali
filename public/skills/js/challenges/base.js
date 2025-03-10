class Challenge {
  constructor(options = {}) {
    this.options = options;
    this.container = null;
    this.currentLevel = 1;
  }
  
  init(container) {
    this.container = container;
  }
  
  generateChallenge(level) {
    this.currentLevel = level;
    
    // To be implemented by subclasses
    // Should return an object with:
    // - instruction: String with the challenge instruction
    // - elements: Array of elements for the challenge
    // - correctElement: The correct element to interact with
    // - metadata: Any additional data needed
    
    return {
      instruction: "Default instruction",
      elements: [],
      correctElement: null,
      metadata: {}
    };
  }
  
  createElements(count) {
    // Helper to create DOM elements for the challenge
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      element.classList.add('challenge-element');
      element.dataset.index = i;
      elements.push(element);
    }
    
    return elements;
  }
  
  renderElements(elements) {
    // Clear container
    const gameArea = this.container.querySelector('.game-area') || this.container;
    gameArea.innerHTML = '';
    
    // Add elements to container
    elements.forEach(element => {
      gameArea.appendChild(element);
    });
  }
  
  positionElements(elements) {
    // First, add elements to the DOM if not already there
    elements.forEach(element => {
      if (!this.container.contains(element)) {
        this.container.appendChild(element);
      }
    });
    
    // Force a reflow to ensure elements have their dimensions
    this.container.offsetHeight;
    
    // Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    console.log(`Container dimensions: ${containerWidth} x ${containerHeight}`);
    
    // Define the usable area (central area not overlapping instructions/progress)
    const topMargin = 120;    // Fixed top margin for instructions
    const bottomMargin = 100; // Fixed bottom margin for progress bar
    const leftMargin = 80;    // Fixed left margin
    const rightMargin = 80;   // Fixed right margin
    
    const usableWidth = containerWidth - leftMargin - rightMargin;
    const usableHeight = containerHeight - topMargin - bottomMargin;
    
    console.log(`Usable area: ${usableWidth} x ${usableHeight}`);
    
    // Keep track of placed elements to prevent overlaps
    const placedElements = [];
    // Safety margin around elements to prevent them from being too close
    const safetyMargin = 20;
    
    // Position each element randomly within the usable area
    elements.forEach((element, index) => {
      // Get element dimensions (or use defaults)
      const measuredWidth = element.offsetWidth;
      const measuredHeight = element.offsetHeight;
      const width = measuredWidth || 120;
      const height = measuredHeight || 40;
      
      // Compute available random space (ensure non-negative)
      const availableX = Math.max(0, usableWidth - width);
      const availableY = Math.max(0, usableHeight - height);
      
      // Try to find a position without overlaps
      let left = 0, top = 0;
      let overlaps = true;
      let attempts = 0;
      const maxAttempts = 50; // Prevent infinite loops
      
      while (overlaps && attempts < maxAttempts) {
        attempts++;
        
        // Generate random position
        const randomFactorX = Math.random();
        const randomFactorY = Math.random();
        left = leftMargin + randomFactorX * availableX;
        top = topMargin + randomFactorY * availableY;
        
        // Check if this position overlaps with any placed element
        overlaps = placedElements.some(placedEl => {
          // Check if rectangles overlap with safety margin
          return !(
            left + width + safetyMargin < placedEl.left ||
            left > placedEl.left + placedEl.width + safetyMargin ||
            top + height + safetyMargin < placedEl.top ||
            top > placedEl.top + placedEl.height + safetyMargin
          );
        });
        
        if (attempts === maxAttempts) {
          console.warn(`Couldn't find non-overlapping position for element ${index} after ${maxAttempts} attempts`);
        }
      }
      
      // Apply position
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      
      // Add this element to placed elements
      placedElements.push({
        left,
        top,
        width,
        height,
        element
      });
      
      if (element.textContent) {
        console.log(`Element ${index} (${element.textContent}): positioned at ${left}px, ${top}px} (after ${attempts} attempts)`);
      } else {
        console.log(`Element ${index}: positioned at ${left}px, ${top}px} (after ${attempts} attempts)`);
      }
    });
    
    return elements;
  }
  
  randomPosition(element) {
    // Generate random position within container
    const container = this.container.querySelector('.game-area') || this.container;
    const containerRect = container.getBoundingClientRect();
    
    const maxX = containerRect.width - element.offsetWidth;
    const maxY = containerRect.height - element.offsetHeight;
    
    // Avoid top area where instructions might be
    const minY = containerRect.height * 0.15;
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;
    
    element.style.position = 'absolute';
    element.style.left = `${randomX}px`;
    element.style.top = `${randomY}px`;
  }
  
  resolveOverlaps(elements, maxAttempts = 50) {
    // Check for overlaps and reposition elements
    for (let i = 0; i < elements.length; i++) {
      let attempts = 0;
      let hasOverlap = true;
      
      while (hasOverlap && attempts < maxAttempts) {
        hasOverlap = false;
        
        for (let j = 0; j < elements.length; j++) {
          if (i !== j && this.checkOverlap(elements[i], elements[j])) {
            hasOverlap = true;
            this.randomPosition(elements[i]);
            break;
          }
        }
        
        attempts++;
      }
    }
  }
  
  checkOverlap(element1, element2, margin = 10) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    return !(
      rect1.right + margin < rect2.left ||
      rect1.left > rect2.right + margin ||
      rect1.bottom + margin < rect2.top ||
      rect1.top > rect2.bottom + margin
    );
  }
} 