class SizeChallenge extends Challenge {
  constructor(options = {}) {
    super(options);
    this.minElements = 3;
    this.maxElements = 6;
  }
  
  async generateChallenge(level) {
    console.log('=== SIZE CHALLENGE GENERATION START ===');
    
    // Determine number of elements based on level
    const numElements = Math.min(this.minElements + Math.floor(level / 2), this.maxElements);
    
    // Get random shape type for this challenge
    const shapes = ['circle', 'square', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    // Decide whether this is a "biggest" or "smallest" challenge
    const sizeMode = Math.random() > 0.5 ? 'biggest' : 'smallest';
    
    // Set minimum and maximum sizes based on level
    const minSize = 40 + (level * 3);
    const maxSize = 80 + (level * 6);
    
    // Generate elements with varying sizes
    const elements = [];
    const sizes = [];
    const usedColors = new Set();
    
    // Decide if we should use color as a qualifier (more likely in higher levels)
    const useColorQualifier = level > 3 && Math.random() > 0.5;
    let targetColor = null;
    
    if (useColorQualifier) {
      // If using color qualifier, select a target color
      const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];
      targetColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Ensure we'll have at least 2 elements of this color+shape to make size comparison meaningful
      const minTargetElements = 2;
      
      // Create the target elements (same color+shape, different sizes)
      for (let i = 0; i < minTargetElements; i++) {
        // Generate unique size
        let size;
        do {
          size = minSize + Math.floor(Math.random() * (maxSize - minSize));
        } while (sizes.includes(size));
        
        sizes.push(size);
        
        // Create element
        const element = this.createShapeElement(shape, targetColor, size);
        elements.push(element);
      }
      
      // Add the target color to used colors
      usedColors.add(targetColor);
    }
    
    // Fill remaining elements
    while (elements.length < numElements) {
      // Generate unique size
      let size;
      do {
        size = minSize + Math.floor(Math.random() * (maxSize - minSize));
      } while (sizes.includes(size));
      
      sizes.push(size);
      
      // If we're using a color qualifier, don't use the target color for these elements
      let color;
      if (useColorQualifier) {
        const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow']
          .filter(c => c !== targetColor);
        color = colors[Math.floor(Math.random() * colors.length)];
      } else {
        // Pick any color
        const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];
        color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      // Only allow the same color+shape combo if we're not using a color qualifier
      if (!useColorQualifier || shape !== shape || !usedColors.has(color)) {
        const element = this.createShapeElement(shape, color, size);
        elements.push(element);
        usedColors.add(color);
      }
    }
    
    // Determine the correct element
    let correctIndex;
    if (sizeMode === 'biggest') {
      correctIndex = sizes.indexOf(Math.max(...sizes));
    } else {
      correctIndex = sizes.indexOf(Math.min(...sizes));
    }
    
    const correctElement = elements[correctIndex];
    const correctColor = correctElement.dataset.color;
    
    // Generate instruction
    let instruction;
    if (useColorQualifier) {
      instruction = `Click on the ${sizeMode} ${targetColor} ${shape}`;
    } else {
      instruction = `Click on the ${sizeMode} ${shape}`;
    }
    
    // Position elements in the game area
    this.positionElementsInGameArea(elements);
    
    console.log('Generated size challenge:', {
      instruction,
      elements,
      correctElement
    });
    
    console.log('=== SIZE CHALLENGE GENERATION COMPLETE ===');
    
    return {
      instruction,
      elements,
      correctElement
    };
  }
  
  createShapeElement(shape, color, size) {
    const element = document.createElement('div');
    element.classList.add('challenge-element', shape, color);
    
    // Handle triangle specially
    if (shape === 'triangle') {
      // Set a custom property for the triangle size
      element.style.setProperty('--size', `${size}px`);
    } else {
      // For other shapes, set width and height directly
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
    }
    
    // Store data attributes
    element.dataset.shape = shape;
    element.dataset.color = color;
    element.dataset.size = size;
    
    return element;
  }
  
  // New method to position elements in the game area with overlap prevention
  positionElementsInGameArea(elements) {
    if (!this.gameArea) {
      console.error('Game area is not defined');
      return;
    }
    
    console.log('Positioning elements in game area:', elements.length);
    
    // Add elements to the game area
    elements.forEach(element => {
      this.gameArea.appendChild(element);
    });
    
    // Get container dimensions
    const containerRect = this.gameArea.getBoundingClientRect();
    const usableWidth = containerRect.width * 0.7;
    const usableHeight = containerRect.height * 0.5;
    const startY = 120;
    
    // Array to keep track of positioned elements
    const positionedElements = [];
    
    // Position each element with overlap checking
    elements.forEach(element => {
      // Get element dimensions
      const width = parseInt(element.dataset.size);
      const height = parseInt(element.dataset.size);
      
      // Try to find a position without overlap
      let left, top;
      let attempts = 0;
      const maxAttempts = 50;
      let overlapping = true;
      
      while (overlapping && attempts < maxAttempts) {
        // Calculate random position within bounds
        left = Math.floor(Math.random() * (usableWidth - width));
        top = startY + Math.floor(Math.random() * (usableHeight - height));
        
        // Check for overlap with already positioned elements
        overlapping = false;
        for (const positioned of positionedElements) {
          if (this.elementsOverlap(
            {left, top, width, height},
            {
              left: parseInt(positioned.style.left),
              top: parseInt(positioned.style.top),
              width: parseInt(positioned.dataset.size),
              height: parseInt(positioned.dataset.size)
            }
          )) {
            overlapping = true;
            break;
          }
        }
        
        attempts++;
      }
      
      console.log(`Positioned element after ${attempts} attempts`);
      
      // Apply position
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      
      // Make sure the element is visible
      element.style.zIndex = '10';
      element.style.display = 'block';
      
      // Add to positioned elements
      positionedElements.push(element);
    });
  }

  // Helper method to check if two elements overlap
  elementsOverlap(a, b) {
    // Allow 30% overlap for more natural positioning
    const overlapThreshold = 0.7;
    
    // Calculate overlap area
    const overlapX = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left));
    const overlapY = Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
    const overlapArea = overlapX * overlapY;
    
    // Calculate smaller element area
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const smallerArea = Math.min(areaA, areaB);
    
    // Calculate percentage of smaller element that is overlapped
    const overlapPercentage = overlapArea / smallerArea;
    
    // Return true if overlap percentage is above threshold
    return overlapPercentage > (1 - overlapThreshold);
  }

  init(gameArea) {
    super.init(gameArea);
    this.gameArea = gameArea; // Make sure to store the reference
  }

  generateSequenceChallenge(level) {
    this.currentLevel = level;
    
    // Determine sequence length based on level
    const sequenceLength = Math.min(3 + Math.floor(level / 2), 6);
    
    // Choose a shape type for this challenge
    const shapes = ['circle', 'square'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    // Generate sizes for elements
    const minSize = 30 + (level * 3);
    const maxSize = 80 + (level * 5);
    const sizeStep = (maxSize - minSize) / (sequenceLength - 1);
    
    // Generate elements with different sizes
    const elements = [];
    const sizes = [];
    
    // Generate sequence elements with progressive sizes
    for (let i = 0; i < sequenceLength; i++) {
      const size = Math.round(minSize + (i * sizeStep));
      sizes.push(size);
      
      // Choose a random color
      const colors = ['red', 'blue', 'green', 'purple', 'orange'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Create element
      const element = this.createShapeElement(shape, color, size);
      element.dataset.index = i;
      element.dataset.size = size;
      
      elements.push(element);
    }
    
    // Add some distractor elements for higher levels
    if (level > 2) {
      const distractorCount = Math.min(2 + Math.floor(level / 2), 4);
      
      for (let i = 0; i < distractorCount; i++) {
        // Create a size that's not too close to existing sizes
        let size;
        do {
          size = Math.round(minSize + (Math.random() * (maxSize - minSize)));
        } while (sizes.some(s => Math.abs(s - size) < 10));
        
        // Add the size to prevent future duplicates
        sizes.push(size);
        
        // Choose a random color
        const colors = ['red', 'blue', 'green', 'purple', 'orange'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create element
        const element = this.createShapeElement(shape, color, size);
        element.dataset.index = sequenceLength + i;
        element.dataset.size = size;
        
        elements.push(element);
      }
    }
    
    // Define sequence direction (small to large or large to small)
    const sequenceDirection = Math.random() > 0.5 ? 'ascending' : 'descending';
    
    // Sort elements by size to determine correct sequence
    const sortedElements = [...elements].sort((a, b) => {
      if (sequenceDirection === 'ascending') {
        return parseInt(a.dataset.size) - parseInt(b.dataset.size);
      } else {
        return parseInt(b.dataset.size) - parseInt(a.dataset.size);
      }
    });
    
    // Extract indices of the correctly sorted elements
    const correctSequence = sortedElements
      .slice(0, sequenceLength)
      .map(el => el.dataset.index);
    
    // Create instruction
    const instructionText = sequenceDirection === 'ascending' 
      ? 'smallest to largest' 
      : 'largest to smallest';
    
    const instruction = `Arrange the shapes from ${instructionText}`;
    
    // Shuffle all elements
    this.shuffleArray(elements);
    
    return {
      instruction,
      elements,
      correctSequence,
      mode: 'sequence'
    };
  }

  // Add a shuffle method to the class
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
} 