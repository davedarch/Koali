class DragInputMethod extends InputMethod {
  constructor(options = {}) {
    super(options);
    this.draggables = [];
    this.correctTarget = null;
    this.correctTargets = [];
    this.mode = 'single';
    this.draggedElement = null;
    this.dropTargets = [];
    this.selectedElements = new Set();
  }
  
  setupEventListeners() {
    this.container.addEventListener('mousedown', this.handleDragStart.bind(this));
    this.container.addEventListener('mousemove', this.handleDragMove.bind(this));
    this.container.addEventListener('mouseup', this.handleDragEnd.bind(this));
    
    // Touch support
    this.container.addEventListener('touchstart', this.handleDragStart.bind(this));
    this.container.addEventListener('touchmove', this.handleDragMove.bind(this));
    this.container.addEventListener('touchend', this.handleDragEnd.bind(this));
  }
  
  handleDragStart(event) {
    if (!this.active) return;
    
    // Prevent default for touch events
    if (event.type === 'touchstart') {
      event.preventDefault();
    }
    
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    const draggable = event.target.closest('.draggable');
    if (!draggable) return;
    
    // Store reference to dragged element
    this.draggedElement = draggable;
    
    // Add dragging class
    draggable.classList.add('dragging');
    
    // Store initial position
    const rect = draggable.getBoundingClientRect();
    draggable.dataset.offsetX = clientX - rect.left;
    draggable.dataset.offsetY = clientY - rect.top;
    
    // Set initial position
    this.updateElementPosition(draggable, clientX, clientY);
  }
  
  handleDragMove(event) {
    if (!this.active || !this.draggedElement) return;
    
    // Prevent default for touch events
    if (event.type === 'touchmove') {
      event.preventDefault();
    }
    
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    // Update position
    this.updateElementPosition(this.draggedElement, clientX, clientY);
  }
  
  handleDragEnd(event) {
    if (!this.active || !this.draggedElement) return;
    
    // Remove dragging class
    this.draggedElement.classList.remove('dragging');
    
    // Check if dropped on a target
    const droppedOnTarget = this.checkDropTarget(this.draggedElement);
    
    if (droppedOnTarget) {
      // Handle successful drop
      if (this.mode === 'single') {
        // For single mode, check if dropped on correct target
        if (this.correctTargets.includes(droppedOnTarget)) {
          this.draggedElement.classList.add('success-animation');
          this.onCorrectAction(this.draggedElement);
        } else {
          this.draggedElement.classList.add('incorrect-drop');
          setTimeout(() => {
            this.draggedElement.classList.remove('incorrect-drop');
            this.resetElementPosition(this.draggedElement);
          }, 500);
          this.onIncorrectAction(this.draggedElement);
        }
      } else if (this.mode === 'all') {
        // For all mode, track selections
        const isCorrectPairing = this.checkCorrectPairing(this.draggedElement, droppedOnTarget);
        
        if (isCorrectPairing) {
          // Add to selected elements
          this.selectedElements.add(this.draggedElement);
          
          // Check if all correct elements are selected
          if (this.selectedElements.size === this.correctTargets.length) {
            // All correct elements selected
            this.selectedElements.forEach(el => {
              el.classList.add('success-animation');
            });
            this.onCorrectAction(this.draggedElement);
          }
        } else {
          // Incorrect pairing
          this.draggedElement.classList.add('incorrect-drop');
          setTimeout(() => {
            this.draggedElement.classList.remove('incorrect-drop');
            this.resetElementPosition(this.draggedElement);
          }, 500);
          this.onIncorrectAction(this.draggedElement);
        }
      }
    } else {
      // Reset position if not dropped on a target
      this.resetElementPosition(this.draggedElement);
    }
    
    // Clear reference
    this.draggedElement = null;
  }
  
  updateElementPosition(element, clientX, clientY) {
    const offsetX = parseFloat(element.dataset.offsetX) || 0;
    const offsetY = parseFloat(element.dataset.offsetY) || 0;
    
    element.style.position = 'absolute';
    element.style.left = `${clientX - offsetX}px`;
    element.style.top = `${clientY - offsetY}px`;
    element.style.zIndex = '1000';
  }
  
  resetElementPosition(element) {
    // Reset to original position
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.zIndex = '';
  }
  
  checkDropTarget(element) {
    // Get element position
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Check if over any drop target
    for (const target of this.dropTargets) {
      const targetRect = target.getBoundingClientRect();
      if (
        centerX >= targetRect.left &&
        centerX <= targetRect.right &&
        centerY >= targetRect.top &&
        centerY <= targetRect.bottom
      ) {
        return target;
      }
    }
    
    return null;
  }
  
  checkCorrectPairing(element, target) {
    // This would be implemented based on your specific pairing logic
    // For example, matching words with their categories
    return element.dataset.category === target.dataset.category;
  }
  
  setupForChallenge(challenge) {
    super.setupForChallenge(challenge);
    
    // Reset state
    this.selectedElements = new Set();
    this.draggedElement = null;
    
    // Store references
    this.draggables = challenge.elements || [];
    
    // Set mode
    this.mode = challenge.metadata?.mode || challenge.mode || 'single';
    
    // Create drop targets based on challenge type
    this.createDropTargets(challenge);
    
    // Add draggable class to all elements
    if (this.draggables && this.draggables.length > 0) {
      this.draggables.forEach(element => {
        if (element) {
          element.classList.add('draggable');
          element.classList.remove('success-animation', 'incorrect-drop');
        }
      });
    }
  }
  
  createDropTargets(challenge) {
    // Clear existing drop targets
    this.dropTargets.forEach(target => {
      if (target.parentNode) {
        target.parentNode.removeChild(target);
      }
    });
    this.dropTargets = [];
    
    // Create new drop targets based on challenge type
    // This would be customized based on your specific challenge types
    
    // For basic challenges, create a single target area
    const targetArea = document.createElement('div');
    targetArea.classList.add('drop-target');
    targetArea.style.position = 'absolute';
    targetArea.style.bottom = '20%';
    targetArea.style.left = '50%';
    targetArea.style.transform = 'translateX(-50%)';
    targetArea.style.width = '200px';
    targetArea.style.height = '200px';
    targetArea.style.border = '3px dashed #333';
    targetArea.style.borderRadius = '10px';
    targetArea.style.display = 'flex';
    targetArea.style.justifyContent = 'center';
    targetArea.style.alignItems = 'center';
    
    // Set correct target
    this.correctTarget = targetArea;
    this.correctTargets = [targetArea];
    
    this.container.appendChild(targetArea);
    this.dropTargets.push(targetArea);
  }
  
  cleanup() {
    super.cleanup();
    
    // Remove draggable class from elements
    if (this.draggables && this.draggables.length > 0) {
      this.draggables.forEach(element => {
        if (element) {
          element.classList.remove('draggable', 'dragging');
          this.resetElementPosition(element);
        }
      });
    }
    
    // Remove drop targets
    this.dropTargets.forEach(target => {
      if (target.parentNode) {
        target.parentNode.removeChild(target);
      }
    });
    
    this.draggables = [];
    this.correctTarget = null;
    this.correctTargets = [];
    this.dropTargets = [];
    this.selectedElements = new Set();
  }
} 