class SelectInputMethod extends InputMethod {
  constructor(options = {}) {
    super(options);
    this.activeElements = [];
    this.correctElements = [];
    this.isSelecting = false;
    this.startX = 0;
    this.startY = 0;
    this.selectionBox = null;
  }
  
  setupForChallenge(challengeData) {
    super.setupForChallenge(challengeData);
    
    this.activeElements = [];
    
    // Handle both singular and plural correctElement(s)
    if (challengeData.correctElements) {
      this.correctElements = challengeData.correctElements;
    } else if (challengeData.correctElement) {
      // Convert single element to array
      this.correctElements = [challengeData.correctElement];
    } else {
      this.correctElements = [];
    }
    
    // Create selection box if it doesn't exist
    this.createSelectionBox();
    
    // Add selectable class to elements
    challengeData.elements.forEach(element => {
      element.classList.add('selectable');
      this.activeElements.push(element);
      
      // Make elements speakable - speaking their attributes
      if (element.dataset.color && element.dataset.shape) {
        const game = challengeData.game || window.game;
        if (game && game.speechService) {
          game.speechService.makeSpeakable(element, `${element.dataset.color} ${element.dataset.shape}`);
        }
      }
    });
    
    // Modify instruction if needed
    if (challengeData.instruction) {
      challengeData.instruction = this.modifyInstructionForInput(challengeData.instruction);
    }
    
    // Add selection event listeners
    this.addSelectionListeners();
  }
  
  createSelectionBox() {
    // Remove any existing selection box
    if (this.selectionBox && this.container.contains(this.selectionBox)) {
      this.container.removeChild(this.selectionBox);
    }
    
    // Create selection box element
    this.selectionBox = document.createElement('div');
    this.selectionBox.id = 'selection-box';
    this.selectionBox.style.display = 'none';
    this.selectionBox.style.position = 'absolute';
    this.selectionBox.style.border = '2px dashed #3498db';
    this.selectionBox.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
    this.selectionBox.style.pointerEvents = 'none';
    this.selectionBox.style.zIndex = '500';
    
    // Add to container
    this.container.appendChild(this.selectionBox);
  }
  
  addSelectionListeners() {
    // Store these handler references to be able to remove them later
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    
    // Add the listeners to the document
    document.addEventListener('mousedown', this.mouseDownHandler);
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
    
    // Touch event support
    this.touchStartHandler = this.handleTouchStart.bind(this);
    this.touchMoveHandler = this.handleTouchMove.bind(this);
    this.touchEndHandler = this.handleTouchEnd.bind(this);
    
    document.addEventListener('touchstart', this.touchStartHandler);
    document.addEventListener('touchmove', this.touchMoveHandler);
    document.addEventListener('touchend', this.touchEndHandler);
  }
  
  handleMouseDown(e) {
    // Don't start selection if clicking on instruction or UI elements
    if (e.target.closest('#instruction') || 
        e.target.closest('#progress-container')) {
      return;
    }
    
    // Get the container's position relative to the viewport
    const containerRect = this.container.getBoundingClientRect();
    
    this.isSelecting = true;
    
    // Calculate position relative to the container
    this.startX = e.clientX - containerRect.left;
    this.startY = e.clientY - containerRect.top;
    
    // Log the start position
    this.logSelectionEvent('selection_start', {
      clientX: e.clientX,
      clientY: e.clientY,
      containerRelativeX: this.startX,
      containerRelativeY: this.startY,
      containerRect: {
        left: containerRect.left,
        top: containerRect.top,
        width: containerRect.width,
        height: containerRect.height
      }
    });
    
    // Display the selection box
    this.selectionBox.style.display = 'block';
    this.selectionBox.style.left = `${this.startX}px`;
    this.selectionBox.style.top = `${this.startY}px`;
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
  }
  
  handleMouseMove(e) {
    if (!this.isSelecting) return;
    
    // Get the container's position relative to the viewport
    const containerRect = this.container.getBoundingClientRect();
    
    // Calculate position relative to the container
    const currentX = e.clientX - containerRect.left;
    const currentY = e.clientY - containerRect.top;
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);
    
    // Update selection box dimensions
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
  }
  
  handleMouseUp(e) {
    if (!this.isSelecting) return;
    this.isSelecting = false;
    
    // Get the selection box final dimensions from its style
    const selectionLeft = parseFloat(this.selectionBox.style.left);
    const selectionTop = parseFloat(this.selectionBox.style.top);
    const selectionWidth = parseFloat(this.selectionBox.style.width);
    const selectionHeight = parseFloat(this.selectionBox.style.height);
    
    // Save rectangle before hiding the selection box
    const selectionRect = {
      left: selectionLeft,
      top: selectionTop,
      right: selectionLeft + selectionWidth,
      bottom: selectionTop + selectionHeight
    };
    
    // Hide the selection box
    this.selectionBox.style.display = 'none';

    // Calculate selection results using simple geometric overlap
    const selectionResult = this.checkSelectionResult(selectionRect);
    
    // Log the selection result with detailed information
    this.logSelectionEvent('selection_end', {
      selectionBox: {
        left: selectionLeft,
        top: selectionTop,
        width: selectionWidth,
        height: selectionHeight
      },
      correctElements: this.correctElements.map(el => {
        const rect = el.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        return {
          id: el.id || "unknown",
          tagName: el.tagName,
          text: el.textContent.trim(),
          position: {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height
          }
        };
      }),
      selectedElements: selectionResult.selectedElements.map(el => {
        const rect = el.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        return {
          id: el.id || "unknown",
          tagName: el.tagName,
          text: el.textContent.trim(),
          position: {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height
          }
        };
      }),
      result: selectionResult.isCorrect ? "CORRECT" : "INCORRECT"
    });
    
    if (selectionResult.isCorrect) {
      // Show success animation
      this.correctElements.forEach(element => {
        element.classList.add('success-animation');
      });
      this.triggerEvent('correct', { elements: this.correctElements });
    } else {
      // Show incorrect feedback
      this.triggerEvent('incorrect', { correct: this.correctElements });
      this.highlightCorrectElements();
    }
  }
  
  // Touch event handlers
  handleTouchStart(e) {
    if (e.target.closest('#instruction') || 
        e.target.closest('#progress-container')) {
      return;
    }
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const containerRect = this.container.getBoundingClientRect();
    
    this.isSelecting = true;
    this.startX = touch.clientX - containerRect.left;
    this.startY = touch.clientY - containerRect.top;
    
    this.selectionBox.style.display = 'block';
    this.selectionBox.style.left = `${this.startX}px`;
    this.selectionBox.style.top = `${this.startY}px`;
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
  }
  
  handleTouchMove(e) {
    if (!this.isSelecting) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const containerRect = this.container.getBoundingClientRect();
    
    const currentX = touch.clientX - containerRect.left;
    const currentY = touch.clientY - containerRect.top;
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);
    
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
  }
  
  handleTouchEnd(e) {
    if (!this.isSelecting) return;
    this.isSelecting = false;
    
    e.preventDefault();
    
    // Get the selection box final dimensions from its style
    const selectionLeft = parseFloat(this.selectionBox.style.left);
    const selectionTop = parseFloat(this.selectionBox.style.top);
    const selectionWidth = parseFloat(this.selectionBox.style.width);
    const selectionHeight = parseFloat(this.selectionBox.style.height);
    
    // Save rectangle before hiding the selection box
    const selectionRect = {
      left: selectionLeft,
      top: selectionTop,
      right: selectionLeft + selectionWidth,
      bottom: selectionTop + selectionHeight
    };
    
    // Hide the selection box
    this.selectionBox.style.display = 'none';

    // Calculate selection results using simple geometric overlap
    const selectionResult = this.checkSelectionResult(selectionRect);
    
    if (selectionResult.isCorrect) {
      // Show success animation
      this.correctElements.forEach(element => {
        element.classList.add('success-animation');
      });
      this.triggerEvent('correct', { elements: this.correctElements });
    } else {
      // Show incorrect feedback
      this.triggerEvent('incorrect', { correct: this.correctElements });
      this.highlightCorrectElements();
    }
  }
  
  // New method for consistent selection checking across mouse and touch
  checkSelectionResult(selectionRect) {
    const containerRect = this.container.getBoundingClientRect();
    const selectedElements = [];
    const elementDetails = [];
    
    // Check each element
    for (const element of this.activeElements) {
      const elementRect = element.getBoundingClientRect();
      
      // Convert element rect to container coordinates
      const relElementRect = {
        left: elementRect.left - containerRect.left,
        top: elementRect.top - containerRect.top,
        right: elementRect.right - containerRect.left,
        bottom: elementRect.bottom - containerRect.top
      };
      
      // Calculate percent of element contained in selection
      const elementArea = (relElementRect.right - relElementRect.left) * 
                           (relElementRect.bottom - relElementRect.top);
      
      // Calculate intersection
      const overlapLeft = Math.max(relElementRect.left, selectionRect.left);
      const overlapRight = Math.min(relElementRect.right, selectionRect.right);
      const overlapTop = Math.max(relElementRect.top, selectionRect.top);
      const overlapBottom = Math.min(relElementRect.bottom, selectionRect.bottom);
      
      // Is there an overlap?
      let percentContained = 0;
      let hasOverlap = false;
      
      if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
        hasOverlap = true;
        const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
        percentContained = overlapArea / elementArea;
        
        // Add to selected if at least 50% contained
        if (percentContained >= 0.5) {
          selectedElements.push(element);
        }
      }
      
      // Collect details for logging
      elementDetails.push({
        id: element.id || "unknown",
        isCorrect: this.correctElements.includes(element),
        position: relElementRect,
        hasOverlap,
        percentContained,
        isSelected: percentContained >= 0.5
      });
    }
    
    // Selection is correct if:
    // 1. All correct elements are selected (have >50% overlap)
    // 2. No incorrect elements are selected
    const allCorrectSelected = this.correctElements.every(element => 
      selectedElements.includes(element)
    );
    
    const noIncorrectSelected = selectedElements.every(element => 
      this.correctElements.includes(element)
    );
    
    const isCorrect = allCorrectSelected && noIncorrectSelected;
    
    // Log the selection calculation details
    this.logSelectionEvent('selection_calculation', {
      selectionRect,
      elementDetails,
      allCorrectSelected,
      noIncorrectSelected,
      result: isCorrect ? "CORRECT" : "INCORRECT"
    });
    
    return {
      isCorrect,
      selectedElements
    };
  }
  
  highlightCorrectElements() {
    // Briefly highlight the correct elements to provide feedback
    this.correctElements.forEach(element => {
      element.classList.add('highlight-correct');
      
      setTimeout(() => {
        element.classList.remove('highlight-correct');
      }, 800);
    });
  }
  
  cleanup() {
    // Remove event listeners
    document.removeEventListener('mousedown', this.mouseDownHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
    
    document.removeEventListener('touchstart', this.touchStartHandler);
    document.removeEventListener('touchmove', this.touchMoveHandler);
    document.removeEventListener('touchend', this.touchEndHandler);
    
    // Remove selection box
    if (this.selectionBox && this.container.contains(this.selectionBox)) {
      this.container.removeChild(this.selectionBox);
    }
    
    // Remove classes from elements
    this.activeElements.forEach(element => {
      element.classList.remove('selectable', 'success-animation', 'highlight-correct');
    });
    
    this.activeElements = [];
    this.correctElements = [];
    this.selectionBox = null;
  }
  
  modifyInstructionForInput(instruction) {
    // Convert "Click on..." to "Select..."
    if (instruction.startsWith('Click on')) {
      return instruction.replace('Click on', 'Select');
    }
    return instruction;
  }
  
  logSelectionEvent(event, data) {
    // Format timestamp
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
    
    // Format log entry
    const logEntry = {
      timestamp,
      event,
      ...data
    };
    
    // Log to console in an easily copyable format
    console.log('LOG_DATA:', JSON.stringify(logEntry));
  }
} 