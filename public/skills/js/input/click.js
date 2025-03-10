class ClickInputMethod extends InputMethod {
  constructor(options = {}) {
    super(options);
    this.clickables = [];
    this.correctClickable = null;
    this.correctClickables = [];
    this.mode = 'single'; // Default mode
    this.selectedElements = new Set(); // Track selected elements in 'all' mode
  }
  
  setupEventListeners() {
    this.container.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    if (!this.active) return;
    
    console.log('Click detected, mode:', this.mode);
    
    // Check if a clickable element was clicked
    const clickedElement = event.target.closest('.clickable');
    if (clickedElement) {
      console.log('Clickable element clicked:', clickedElement.textContent || clickedElement.dataset.shape);
      
      // Prevent double-clicks
      event.preventDefault();
      
      // Handle based on mode
      if (this.mode === 'single') {
        this.handleSingleClick(clickedElement);
      } else if (this.mode === 'all') {
        this.handleMultiClick(clickedElement);
      }
    }
  }
  
  handleSingleClick(clickedElement) {
    // Check if correct element was clicked
    if (clickedElement === this.correctClickable) {
      // Correct action
      clickedElement.classList.add('success-animation');
      this.onCorrectAction({
        element: clickedElement,
        timeTaken: 0 // Could implement timing here
      });
    } else {
      // Incorrect action
      clickedElement.classList.add('incorrect-click');
      setTimeout(() => {
        clickedElement.classList.remove('incorrect-click');
      }, 500);
      
      this.onIncorrectAction({
        element: clickedElement,
        correctElement: this.correctClickable
      });
    }
  }
  
  handleMultiClick(clickedElement) {
    console.log('Processing in all mode');
    
    // Check if already selected
    const isSelected = this.selectedElements.has(clickedElement);
    console.log('Is already selected:', isSelected);
    
    if (isSelected) {
      // Deselect
      this.selectedElements.delete(clickedElement);
      clickedElement.classList.remove('selected');
    } else {
      // Select
      this.selectedElements.add(clickedElement);
      clickedElement.classList.add('selected');
    }
    
    console.log('Selected elements count:', this.selectedElements.size);
    
    // Auto-check after a short delay
    clearTimeout(this.checkTimeout);
    this.checkTimeout = setTimeout(() => {
      this.checkAllSelections();
    }, 500);
  }
  
  checkAllSelections() {
    console.log('Auto-checking selections...');
    
    // Convert sets to arrays for easier logging
    const selectedArray = Array.from(this.selectedElements).map(el => el.textContent || el.dataset.shape);
    const correctArray = this.correctClickables.map(el => el.textContent || el.dataset.shape);
    
    console.log('Selected:', selectedArray);
    console.log('Correct:', correctArray);
    
    // Check if all correct elements are selected and no incorrect ones
    const allCorrectSelected = this.correctClickables.every(el => 
      this.selectedElements.has(el)
    );
    
    const noIncorrectSelected = Array.from(this.selectedElements).every(el => 
      this.correctClickables.includes(el)
    );
    
    if (allCorrectSelected && noIncorrectSelected) {
      console.log('All correct elements selected!');
      
      // Add success animation to all selected elements
      this.selectedElements.forEach(el => {
        el.classList.add('success-animation');
      });
      
      this.onCorrectAction({
        elements: Array.from(this.selectedElements)
      });
    } else if (allCorrectSelected) {
      console.log('All correct elements selected, but some incorrect ones too');
      this.onIncorrectAction({
        message: 'You selected some incorrect items'
      });
    } else {
      console.log('Not all correct elements selected yet');
      
      // If they've selected some but not all, give a hint
      if (this.selectedElements.size > 0 && 
          this.selectedElements.size < this.correctClickables.length) {
        console.log('Hint: There are more to find!');
      }
    }
  }
  
  setupForChallenge(challenge) {
    super.setupForChallenge(challenge);
    
    // Clean up previous state
    this.cleanup();
    
    // Determine mode based on challenge
    this.mode = challenge.mode || 'single';
    console.log('Setting up click input with mode:', this.mode);
    
    if (this.mode === 'single') {
      // Single selection mode
      this.correctClickable = challenge.correctElement;
      
      // Make all elements clickable
      challenge.elements.forEach(element => {
        element.classList.add('clickable');
        this.clickables.push(element);
      });
    } else if (this.mode === 'all') {
      // Multi-selection mode
      this.correctClickables = challenge.correctElements || [];
      console.log('Correct elements:', this.correctClickables.length);
      
      // Make all elements clickable
      challenge.elements.forEach(element => {
        element.classList.add('clickable');
        this.clickables.push(element);
      });
    }
  }
  
  cleanup() {
    // Remove clickable class and event listeners from elements
    this.clickables.forEach(element => {
      if (element) {
        element.classList.remove('clickable', 'selected', 'success-animation', 'incorrect-click');
      }
    });
    
    this.clickables = [];
    this.correctClickable = null;
    this.correctClickables = [];
    this.selectedElements = new Set();
  }
} 