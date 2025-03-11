class InputMethod extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.container = null;
    this.challengeData = null;
  }
  
  init(container) {
    this.container = container;
  }
  
  setupForChallenge(challengeData) {
    this.challengeData = challengeData;
    // To be implemented by subclasses
  }
  
  cleanup() {
    // To be implemented by subclasses
  }
  
  modifyInstructionForInput(instruction) {
    // To be implemented by subclasses
    return instruction;
  }
  
  validateInteraction(element) {
    // Default validation - check if element is the correct one
    if (this.challengeData.mode === 'all') {
      // For multi-select challenges
      return this.challengeData.correctElements.includes(element);
    } else {
      // For single-select challenges
      return element === this.challengeData.correctElement;
    }
  }
} 