class ClickInputMethod extends InputMethod {
  constructor(options = {}) {
    super(options);
    this.activeElements = [];
    this.selectedElements = new Set();
  }
  
  setupForChallenge(challengeData) {
    super.setupForChallenge(challengeData);
    
    this.activeElements = [];
    this.selectedElements.clear();
    
    // Add click functionality to elements
    challengeData.elements.forEach(element => {
      // Add clickable class
      element.classList.add('clickable');
      
      // Add click listener
      const clickHandler = (e) => {
        // Prevent default behavior
        e.preventDefault();
        
        // Handle the click
        this.handleClick(element);
      };
      
      // Store the handler to remove it later
      element._clickHandler = clickHandler;
      
      // Add the event listener
      element.addEventListener('click', clickHandler);
      
      // Add to active elements
      this.activeElements.push(element);
    });
    
    // Make elements speak their attributes when clicked
    challengeData.elements.forEach(element => {
      const game = challengeData.game || window.game;
      if (game && game.speechService) {
        let speakText = '';
        if (element.dataset.color && element.dataset.shape) {
          speakText = `${element.dataset.color} ${element.dataset.shape}`;
        } else if (element.textContent) {
          speakText = element.textContent;
        }
        
        if (speakText) {
          // This is added in addition to (not replacing) the click handler
          element.addEventListener('speechclick', () => {
            game.speechService.speak(speakText);
          });
          
          // Save original click handler if exists
          const originalClickHandler = element.onclick;
          
          // Create new click handler that speaks and then calls original handler
          element.onclick = (e) => {
            element.dispatchEvent(new CustomEvent('speechclick'));
            if (typeof originalClickHandler === 'function') {
              originalClickHandler.call(element, e);
            }
          };
        }
      }
    });
    
    // Modify instruction if needed
    if (challengeData.instruction) {
      challengeData.instruction = this.modifyInstructionForInput(challengeData.instruction);
    }
  }
  
  handleClick(element) {
    const isCorrect = this.validateInteraction(element);
    
    if (isCorrect) {
      // Add success animation
      element.classList.add('success-animation');
      
      // For multi-select challenges
      if (this.challengeData.mode === 'all') {
        // Add to selected elements
        this.selectedElements.add(element);
        
        // Check if all correct elements are selected
        const allSelected = this.challengeData.correctElements.every(el => 
          this.selectedElements.has(el)
        );
        
        if (allSelected) {
          // All correct elements have been selected
          this.triggerEvent('correct', { element });
        }
      } else {
        // For single-select challenges
        this.triggerEvent('correct', { element });
      }
    } else {
      // Add incorrect animation
      element.classList.add('incorrect-click');
      
      // Remove after animation completes
      setTimeout(() => {
        element.classList.remove('incorrect-click');
      }, 500);
      
      // Trigger incorrect event
      this.triggerEvent('incorrect', { element });
    }
  }
  
  cleanup() {
    // Remove all event listeners
    this.activeElements.forEach(element => {
      if (element._clickHandler) {
        element.removeEventListener('click', element._clickHandler);
        delete element._clickHandler;
      }
      element.classList.remove('clickable', 'success-animation', 'incorrect-click');
    });
    
    this.activeElements = [];
    this.selectedElements.clear();
  }
  
  modifyInstructionForInput(instruction) {
    // No need to modify for click, as "Click on..." is already correct
    return instruction;
  }
} 