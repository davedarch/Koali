class InputMethod extends EventEmitter {
  constructor(options = {}) {
    super();
    this.container = null;
    this.options = options;
    this.active = false;
  }
  
  init(container) {
    this.container = container;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Base method to be overridden by specific input methods
    throw new Error('setupEventListeners method must be implemented by subclass');
  }
  
  setupForChallenge(challenge) {
    // Activate input method
    this.active = true;
  }
  
  onCorrectAction(data) {
    this.triggerEvent('correct', data);
  }
  
  onIncorrectAction(data) {
    this.triggerEvent('incorrect', data);
  }
  
  cleanup() {
    // Deactivate input method
    this.active = false;
  }
} 