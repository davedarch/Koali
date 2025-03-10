class BasicChallenge extends Challenge {
  constructor(options = {}) {
    super(options);
    
    // Define shape types
    this.shapes = ['circle', 'square', 'triangle'];
    
    // Define colors
    this.colors = [
      { hex: '#3498db', name: 'blue' },
      { hex: '#e67e22', name: 'orange' },
      { hex: '#9b59b6', name: 'purple' },
      { hex: '#f1c40f', name: 'yellow' },
      { hex: '#c0392b', name: 'red' }
    ];
  }
  
  generateChallenge(level) {
    this.currentLevel = level;
    
    // Determine number of elements based on level
    const elementCount = Math.min(3 + level, 10);
    
    // Validate that we don't exceed possible unique combinations
    const maxUniqueCombinations = this.shapes.length * this.colors.length;
    const finalElementCount = Math.min(elementCount, maxUniqueCombinations);
    
    if (finalElementCount < elementCount) {
      console.warn(`Requested ${elementCount} elements but limited to ${finalElementCount} unique combinations`);
    }
    
    // Create elements
    const elements = this.createElements(finalElementCount);
    
    // Track used combinations to prevent duplicates
    const usedCombinations = new Set();
    
    // Apply random shapes and colors, ensuring no duplicates
    elements.forEach(element => {
      // Add challenge element class
      element.classList.add('challenge-element');
      
      let shape, color, combinationKey;
      
      // Keep trying until we find an unused combination
      do {
        // Select random shape
        shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        
        // Select random color
        color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Create a unique key for this combination
        combinationKey = `${shape}-${color.name}`;
      } while (usedCombinations.has(combinationKey));
      
      // Mark this combination as used
      usedCombinations.add(combinationKey);
      
      // Apply shape class
      element.classList.add(shape);
      
      // Apply color based on shape
      if (shape === 'triangle') {
        // For triangles, set the border-bottom-color
        element.style.borderBottomColor = color.hex;
      } else {
        // For other shapes, use background color
        element.style.backgroundColor = color.hex;
      }
      
      // Set dataset properties
      element.dataset.color = color.name;
      element.dataset.shape = shape;
    });
    
    // Select one element as the correct one
    const correctElement = elements[Math.floor(Math.random() * elements.length)];
    
    // Create instruction
    const colorName = correctElement.dataset.color || 'colored';
    const shapeName = correctElement.dataset.shape || 'shape';
    const instruction = `Click on the ${colorName} ${shapeName}`;
    
    // Position elements
    this.renderElements(elements);
    this.positionElements(elements);
    
    return {
      instruction,
      elements,
      correctElement
    };
  }

  positionElements(elements) {
    console.log("=== BASIC CHALLENGE POSITIONING START ===");
    console.log(`Positioning ${elements.length} elements`);
    
    // 1. Log all elements and their initial state
    elements.forEach((el, i) => {
      console.log(`Element ${i} initial:`, {
        shape: el.dataset.shape,
        color: el.dataset.color,
        classList: Array.from(el.classList),
        style: {
          position: el.style.position,
          left: el.style.left,
          top: el.style.top,
          width: el.offsetWidth,
          height: el.offsetHeight
        }
      });
    });

    // 2. First, ensure elements are in the DOM
    elements.forEach(element => {
      if (!this.container.contains(element)) {
        console.log(`Adding element to container: ${element.dataset.shape}-${element.dataset.color}`);
        this.container.appendChild(element);
      }
    });
    
    // 3. Force a reflow and log sizes
    this.container.offsetHeight;
    console.log("After reflow - element dimensions:");
    elements.forEach((el, i) => {
      console.log(`Element ${i} dimensions: ${el.offsetWidth}x${el.offsetHeight}`);
    });
    
    // 4. Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    console.log("Container rect:", containerRect);
    
    // 5. Define usable area
    const topMargin = 120;
    const bottomMargin = 100;
    const leftMargin = 80;
    const rightMargin = 80;
    
    const usableWidth = containerRect.width - leftMargin - rightMargin;
    const usableHeight = containerRect.height - topMargin - bottomMargin;
    
    console.log(`Usable area: ${usableWidth}x${usableHeight}`);
    
    // 6. Track placed elements
    const placedElements = [];
    const safetyMargin = 30; // Increased safety margin for better visibility
    
    // 7. Position each element
    elements.forEach((element, index) => {
      const width = element.offsetWidth || 100;
      const height = element.offsetHeight || 100;
      
      console.log(`Element ${index} measured: ${width}x${height}`);
      
      const availableX = Math.max(0, usableWidth - width);
      const availableY = Math.max(0, usableHeight - height);
      
      console.log(`Available space: ${availableX}x${availableY}`);
      
      let left = 0, top = 0;
      let overlaps = true;
      let attempts = 0;
      const maxAttempts = 100; // More attempts
      
      console.log(`Trying to position element ${index}...`);
      
      while (overlaps && attempts < maxAttempts) {
        attempts++;
        
        // Generate random position
        const randomX = Math.random();
        const randomY = Math.random();
        left = leftMargin + randomX * availableX;
        top = topMargin + randomY * availableY;
        
        // Check for overlaps
        overlaps = placedElements.some((placedEl, idx) => {
          const doesOverlap = !(
            left + width + safetyMargin < placedEl.left ||
            left > placedEl.left + placedEl.width + safetyMargin ||
            top + height + safetyMargin < placedEl.top ||
            top > placedEl.top + placedEl.height + safetyMargin
          );
          
          if (doesOverlap && attempts % 10 === 0) {
            console.log(`  Attempt ${attempts}: Overlaps with element ${idx} at [${placedEl.left},${placedEl.top}]`);
          }
          
          return doesOverlap;
        });
        
        if (attempts === maxAttempts) {
          console.warn(`MAX ATTEMPTS REACHED for element ${index}`);
        }
      }
      
      // Apply position
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      
      // Add to placed elements
      placedElements.push({
        left,
        top,
        width,
        height,
        element
      });
      
      console.log(`Positioned element ${index} at [${left},${top}] after ${attempts} attempts`);
    });
    
    console.log("=== BASIC CHALLENGE POSITIONING COMPLETE ===");
    console.log("Final element positions:", placedElements.map(el => ({
      shape: el.element.dataset.shape,
      color: el.element.dataset.color,
      left: el.left,
      top: el.top,
      width: el.width,
      height: el.height
    })));
    
    return elements;
  }
} 