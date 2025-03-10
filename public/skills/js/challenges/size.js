class SizeChallenge extends Challenge {
  constructor(options = {}) {
    super(options);
    
    // Define shape types
    this.shapes = ['circle', 'square'];
    
    // Define colors
    this.colors = [
      { hex: '#3498db', name: 'blue' },
      { hex: '#e67e22', name: 'orange' },
      { hex: '#9b59b6', name: 'purple' },
      { hex: '#f1c40f', name: 'yellow' },
      { hex: '#c0392b', name: 'red' }
    ];
    
    // Define sizes
    this.sizes = [
      { class: 'size-small', name: 'small' },
      { class: 'size-medium', name: 'medium' },
      { class: 'size-large', name: 'large' }
    ];
  }
  
  generateChallenge(level) {
    this.currentLevel = level;
    
    // Determine number of elements based on level
    const elementCount = Math.min(3 + level, 9);
    
    // Create elements
    const elements = this.createElements(elementCount);
    
    // Apply random shapes, colors, and sizes
    elements.forEach(element => {
      // Add challenge element class
      element.classList.add('challenge-element');
      
      // Select random shape
      const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
      element.classList.add(shape);
      
      // Select random color
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      element.style.backgroundColor = color.hex;
      element.dataset.color = color.name;
      
      // Select random size
      const size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
      element.classList.add(size.class);
      element.dataset.size = size.name;
      element.dataset.shape = shape;
    });
    
    // Select one element as the correct one
    const correctElement = elements[Math.floor(Math.random() * elements.length)];
    
    // Create instruction
    const instruction = `Click on the ${correctElement.dataset.size} ${correctElement.dataset.color} ${correctElement.dataset.shape}`;
    
    // Position elements
    this.renderElements(elements);
    this.positionElements(elements);
    
    return {
      instruction,
      elements,
      correctElement
    };
  }
} 