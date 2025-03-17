class SequenceInputMethod extends InputMethod {
  constructor(options = {}) {
    super(options);
    this.draggableElements = [];
    this.sequenceSlots = [];
    this.correctSequence = [];
    this.currentSequence = [];
  }
  
  setupForChallenge(challengeData) {
    super.setupForChallenge(challengeData);
    console.log("SequenceInputMethod.setupForChallenge - Setting up with data:", challengeData);
    console.log("Challenge mode:", challengeData.mode);
    console.log("Challenge instruction:", challengeData.instruction);
    
    // Store the correct sequence
    this.correctSequence = challengeData.correctSequence || [];
    console.log("Correct sequence:", this.correctSequence);
    
    // Reset state
    this.draggableElements = [];
    this.sequenceSlots = [];
    this.currentSequence = Array(this.correctSequence.length).fill(null);
    
    // Create draggable elements container
    this.createElementsContainer();
    
    // Create sequence slots container
    this.createSlotsContainer();
    
    // Setup draggable elements
    console.log("Setting up draggable elements:", challengeData.elements.length);
    challengeData.elements.forEach((element, index) => {
      console.log(`Element ${index}:`, {
        shape: element.dataset.shape,
        color: element.dataset.color,
        index: element.dataset.index
      });
      
      // Add draggable class
      element.classList.add('draggable');
      element.setAttribute('draggable', 'true');
      element.dataset.index = index;
      
      // Add drag event listeners
      this.addDragListeners(element);
      
      // Add to container
      this.elementsContainer.appendChild(element);
      
      // Store element
      this.draggableElements.push(element);
    });
    
    // Create sequence slots based on correct sequence length
    console.log(`Creating ${this.correctSequence.length} sequence slots`);
    this.createSequenceSlots(this.correctSequence.length);
    
    // Position elements nicely in the container
    this.positionElements();
  }
  
  createElementsContainer() {
    // Create container for draggable elements
    this.elementsContainer = document.createElement('div');
    this.elementsContainer.className = 'draggables-container';
    
    // Set explicit styles to ensure proper layout
    this.elementsContainer.style.display = 'flex';
    this.elementsContainer.style.flexWrap = 'wrap';
    this.elementsContainer.style.justifyContent = 'center';
    this.elementsContainer.style.gap = '15px';
    this.elementsContainer.style.margin = '20px 0';
    this.elementsContainer.style.padding = '15px';
    this.elementsContainer.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    this.elementsContainer.style.borderRadius = '10px';
    this.elementsContainer.style.minHeight = '120px';
    
    this.container.appendChild(this.elementsContainer);
  }
  
  createSlotsContainer() {
    // Create container for sequence slots
    this.slotsContainer = document.createElement('div');
    this.slotsContainer.className = 'sequence-slots-container';
    
    this.container.appendChild(this.slotsContainer);
  }
  
  createSequenceSlots(count) {
    for (let i = 0; i < count; i++) {
      const slot = document.createElement('div');
      slot.className = 'sequence-slot';
      slot.dataset.position = i;
      
      // Add drop event listeners
      this.addDropListeners(slot);
      
      // Add to container
      this.slotsContainer.appendChild(slot);
      
      // Store slot
      this.sequenceSlots.push(slot);
    }
  }
  
  addDragListeners(element) {
    element.addEventListener('dragstart', (e) => {
      console.log("Drag started:", element.dataset);
      element.classList.add('dragging');
      e.dataTransfer.setData('text/plain', element.dataset.index);
      
      // If element is already in a slot, remove it from the current sequence
      this.sequenceSlots.forEach((slot, index) => {
        if (slot.contains(element)) {
          // Remove the element from the slot's currentSequence
          this.currentSequence[index] = null;
          // Don't try to remove the child here - it will be moved by the browser
        }
      });
    });
    
    element.addEventListener('dragend', () => {
      element.classList.remove('dragging');
      
      // If the element wasn't dropped in a valid slot, return it to the container
      const isInSlot = this.sequenceSlots.some(slot => slot.contains(element));
      if (!isInSlot && !this.elementsContainer.contains(element)) {
        this.elementsContainer.appendChild(element);
      }
    });
  }
  
  addDropListeners(slot) {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('over');
    });
    
    slot.addEventListener('dragleave', () => {
      slot.classList.remove('over');
    });
    
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('over');
      
      const elementIndex = e.dataTransfer.getData('text/plain');
      const element = this.draggableElements.find(el => el.dataset.index === elementIndex);
      
      if (!element) return;
      
      // If slot already has an element, move it back to the container
      if (slot.children.length > 0) {
        const existingElement = slot.children[0];
        this.elementsContainer.appendChild(existingElement);
      }
      
      // Add element to slot
      slot.appendChild(element);
      
      // Update current sequence
      const position = parseInt(slot.dataset.position);
      this.currentSequence[position] = element;
      
      // Check if sequence is complete
      this.checkSequence();
    });
  }
  
  checkSequence() {
    // Check if all slots are filled
    const isComplete = this.currentSequence.every(element => element !== null);
    
    if (isComplete) {
      console.log("Sequence complete, checking correctness");
      
      // Log more detailed information for debugging
      console.log("Current sequence elements:", this.currentSequence.map(el => ({
        index: el.dataset.index,
        shape: el.dataset.shape,
        color: el.dataset.color
      })));
      
      console.log("Correct sequence indices:", this.correctSequence);
      
      // Get the expected sequence from the instruction
      const instructionText = document.getElementById('instruction').textContent;
      const match = instructionText.match(/Place these shapes in order: (.*)/);
      
      if (match) {
        const expectedSequence = match[1].split(', ');
        console.log("Expected sequence from instruction:", expectedSequence);
        
        // Check if the sequence matches what's expected
        const isCorrect = this.currentSequence.every((element, index) => {
          const expectedItem = expectedSequence[index].trim();
          const actualItem = `${element.dataset.color} ${element.dataset.shape}`.trim();
          
          console.log(`Position ${index}: Expected "${expectedItem}", Got "${actualItem}"`);
          
          return expectedItem === actualItem;
        });
        
        if (isCorrect) {
          console.log("Sequence is correct!");
          // Add visual feedback
          this.sequenceSlots.forEach(slot => {
            slot.classList.add('correct');
          });
          
          // Trigger correct action with a small delay
          setTimeout(() => {
            this.onCorrectAction();
          }, 500);
        } else {
          console.log("Sequence is incorrect");
          // Add visual feedback for incorrect sequence
          this.sequenceSlots.forEach((slot, index) => {
            const element = this.currentSequence[index];
            const expectedItem = expectedSequence[index].trim();
            const actualItem = `${element.dataset.color} ${element.dataset.shape}`.trim();
            
            if (expectedItem.trim() === actualItem.trim()) {
              slot.classList.add('correct');
            } else {
              slot.classList.add('incorrect');
              
              // Remove the incorrect class after a delay
              setTimeout(() => {
                slot.classList.remove('incorrect');
              }, 1000);
            }
          });
          
          // Trigger incorrect action
          this.onIncorrectAction();
        }
      } else {
        console.error("Could not parse expected sequence from instruction");
      }
    }
  }
  
  positionElements() {
    // Position elements in a grid layout within the draggables container
    console.log("Positioning draggable elements");
    
    // Reset any absolute positioning that might have been applied
    this.draggableElements.forEach((element, index) => {
      // Remove absolute positioning
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      
      // Make sure elements have proper size and margin
      element.style.margin = '10px';
      element.style.display = 'inline-flex';
      element.style.justifyContent = 'center';
      element.style.alignItems = 'center';
      
      // Add a specific class to help with styling
      element.classList.add('sequence-draggable');
      
      // Ensure elements are visible
      console.log(`Element ${element.dataset.index} positioned with shape: ${element.dataset.shape}, color: ${element.dataset.color}`);
    });
    
    // Force a reflow to ensure elements are properly laid out
    this.elementsContainer.offsetHeight;
  }
  
  cleanup() {
    // Remove all elements from the container
    if (this.elementsContainer && this.container.contains(this.elementsContainer)) {
      this.container.removeChild(this.elementsContainer);
    }
    
    if (this.slotsContainer && this.container.contains(this.slotsContainer)) {
      this.container.removeChild(this.slotsContainer);
    }
    
    // Reset state
    this.draggableElements = [];
    this.sequenceSlots = [];
    this.correctSequence = [];
    this.currentSequence = [];
  }
  
  modifyInstructionForInput(instruction) {
    console.log("SequenceInputMethod.modifyInstructionForInput - Original:", instruction);
    // The instruction should already be describing the sequence to create
    return instruction;
  }
  
  onCorrectAction() {
    console.log("Sequence correct action triggered");
    this.triggerEvent('correct', {});
  }
  
  onIncorrectAction() {
    console.log("Sequence incorrect action triggered");
    this.triggerEvent('incorrect', {});
  }
} 