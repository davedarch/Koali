class DragInputMethod extends InputMethod {
  constructor(options = {}) {
    super(options);
    this.activeElements = [];
    this.dropTarget = null;
    this.isDragging = false;
    this.currentDragElement = null;
  }
  
  setupForChallenge(challengeData) {
    super.setupForChallenge(challengeData);
    
    this.activeElements = [];
    
    // Create drop target
    this.createDropTarget();
    
    // Add drag functionality to elements
    challengeData.elements.forEach(element => {
      // Add draggable class
      element.classList.add('draggable');
      
      // Make the element draggable
      element.setAttribute('draggable', 'true');
      
      // Drag start event
      const dragStartHandler = (e) => {
        this.handleDragStart(e, element);
      };
      
      // Drag end event
      const dragEndHandler = (e) => {
        this.handleDragEnd(e, element);
      };
      
      // Store handlers to remove later
      element._dragStartHandler = dragStartHandler;
      element._dragEndHandler = dragEndHandler;
      
      // Add event listeners
      element.addEventListener('dragstart', dragStartHandler);
      element.addEventListener('dragend', dragEndHandler);
      
      // For touch devices
      element.addEventListener('touchstart', (e) => {
        this.handleTouchStart(e, element);
      });
      
      element.addEventListener('touchmove', (e) => {
        this.handleTouchMove(e, element);
      });
      
      element.addEventListener('touchend', (e) => {
        this.handleTouchEnd(e, element);
      });
      
      // Add to active elements
      this.activeElements.push(element);
    });
    
    // Modify instruction
    if (challengeData.instruction) {
      challengeData.instruction = this.modifyInstructionForInput(challengeData.instruction);
    }
  }
  
  createDropTarget() {
    // Create a drop target
    this.dropTarget = document.createElement('div');
    this.dropTarget.className = 'drop-target';
    this.dropTarget.textContent = 'Drop here';
    
    // Style the drop target
    Object.assign(this.dropTarget.style, {
      width: '150px',
      height: '150px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      borderRadius: '10px',
      border: '3px dashed #333',
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    });
    
    // Position the drop target
    this.positionDropTarget();
    
    // Add drop events
    this.dropTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropTarget.classList.add('highlight');
    });
    
    this.dropTarget.addEventListener('dragleave', () => {
      this.dropTarget.classList.remove('highlight');
    });
    
    this.dropTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      this.handleDrop(e);
    });
    
    // Add to container
    this.container.appendChild(this.dropTarget);
  }
  
  positionDropTarget() {
    if (!this.container || !this.dropTarget) return;
    
    // Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    
    // Position in a sensible location (right side of container)
    const dropWidth = 150;
    const dropHeight = 150;
    
    // Randomize position but avoid overlaps with elements
    const margin = 60;
    const maxX = containerRect.width - dropWidth - margin;
    const maxY = containerRect.height - dropHeight - margin;
    
    // Position not too close to edges
    const x = margin + Math.random() * (maxX - margin * 2);
    const y = margin + Math.random() * (maxY - margin * 2);
    
    this.dropTarget.style.left = `${x}px`;
    this.dropTarget.style.top = `${y}px`;
  }
  
  handleDragStart(e, element) {
    this.isDragging = true;
    this.currentDragElement = element;
    
    // Set data for drag operation
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', 'dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
    
    // Add dragging class
    element.classList.add('dragging');
    
    // Highlight drop target
    if (this.dropTarget) {
      this.dropTarget.classList.add('highlight');
    }
  }
  
  handleDragEnd(e, element) {
    this.isDragging = false;
    
    // Remove dragging class
    element.classList.remove('dragging');
    
    // Remove highlight from drop target
    if (this.dropTarget) {
      this.dropTarget.classList.remove('highlight');
    }
  }
  
  handleDrop(e) {
    if (!this.currentDragElement) return;
    
    // Remove highlight from drop target
    this.dropTarget.classList.remove('highlight');
    
    // Check if the current element is the correct one
    const isCorrect = this.validateInteraction(this.currentDragElement);
    
    if (isCorrect) {
      // Success animation
      this.currentDragElement.classList.add('success-animation');
      this.dropTarget.classList.add('success-animation');
      
      // Trigger correct event
      this.triggerEvent('correct', { element: this.currentDragElement });
    } else {
      // Incorrect animation
      this.currentDragElement.classList.add('incorrect-click');
      
      // Remove after animation completes
      setTimeout(() => {
        this.currentDragElement.classList.remove('incorrect-click');
      }, 500);
      
      // Reset position
      this.resetElementPosition(this.currentDragElement);
      
      // Trigger incorrect event
      this.triggerEvent('incorrect', { element: this.currentDragElement });
    }
    
    this.currentDragElement = null;
  }
  
  resetElementPosition(element) {
    // If using a proper drag library, we'd reset position here
    // For now, just remove the dragging class
    element.classList.remove('dragging');
  }
  
  // Touch event handlers for mobile support
  handleTouchStart(e, element) {
    // Prevent default to avoid scrolling
    e.preventDefault();
    
    this.isDragging = true;
    this.currentDragElement = element;
    element.classList.add('dragging');
    
    // Get the touch position
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    
    // Get element position
    const rect = element.getBoundingClientRect();
    this.elementStartX = rect.left;
    this.elementStartY = rect.top;
  }
  
  handleTouchMove(e, element) {
    if (!this.isDragging) return;
    
    // Prevent default to avoid scrolling
    e.preventDefault();
    
    // Get the touch position
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Calculate new position
    const newX = this.elementStartX + (touchX - this.touchStartX);
    const newY = this.elementStartY + (touchY - this.touchStartY);
    
    // Apply new position
    element.style.position = 'absolute';
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
    
    // Check if over drop target
    if (this.dropTarget) {
      const dropRect = this.dropTarget.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      
      if (
        elemRect.right > dropRect.left &&
        elemRect.left < dropRect.right &&
        elemRect.bottom > dropRect.top &&
        elemRect.top < dropRect.bottom
      ) {
        this.dropTarget.classList.add('highlight');
      } else {
        this.dropTarget.classList.remove('highlight');
      }
    }
  }
  
  handleTouchEnd(e, element) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    element.classList.remove('dragging');
    
    // Check if over drop target
    if (this.dropTarget) {
      const dropRect = this.dropTarget.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      
      if (
        elemRect.right > dropRect.left &&
        elemRect.left < dropRect.right &&
        elemRect.bottom > dropRect.top &&
        elemRect.top < dropRect.bottom
      ) {
        // Simulate drop
        this.handleDrop(e);
      } else {
        // Reset position
        this.resetElementPosition(element);
        this.dropTarget.classList.remove('highlight');
      }
    }
  }
  
  cleanup() {
    // Remove all event listeners
    this.activeElements.forEach(element => {
      if (element._dragStartHandler) {
        element.removeEventListener('dragstart', element._dragStartHandler);
        delete element._dragStartHandler;
      }
      if (element._dragEndHandler) {
        element.removeEventListener('dragend', element._dragEndHandler);
        delete element._dragEndHandler;
      }
      
      // Remove touch event listeners
      element.removeEventListener('touchstart', element._touchStartHandler);
      element.removeEventListener('touchmove', element._touchMoveHandler);
      element.removeEventListener('touchend', element._touchEndHandler);
      
      element.classList.remove('draggable', 'dragging', 'success-animation', 'incorrect-click');
      element.removeAttribute('draggable');
    });
    
    // Remove drop target
    if (this.dropTarget && this.container.contains(this.dropTarget)) {
      this.container.removeChild(this.dropTarget);
    }
    
    this.dropTarget = null;
    this.activeElements = [];
    this.currentDragElement = null;
    this.isDragging = false;
  }
  
  modifyInstructionForInput(instruction) {
    // Convert "Click on..." to "Drag..."
    if (instruction.startsWith('Click on')) {
      return instruction.replace('Click on', 'Drag');
    }
    // Add instruction about dropping
    if (!instruction.includes('to the drop target')) {
      return `${instruction} to the drop target`;
    }
    return instruction;
  }
} 