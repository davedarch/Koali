class InputMethod {
  constructor(options = {}) {
    this.options = options;
    this.container = null;
    this.eventHandlers = {};
    this.active = false;
    this.startTime = 0;
  }
  
  init(container) {
    this.container = container;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // To be implemented by subclasses
  }
  
  setupForChallenge(challenge) {
    // Reset state
    this.startTime = Date.now();
    this.active = true;
    
    // To be extended by subclasses
  }
  
  onCorrectAction(target) {
    if (!this.active) return;
    
    // Calculate time taken
    const endTime = Date.now();
    const timeTaken = (endTime - this.startTime) / 1000;
    
    // Prevent further actions
    this.active = false;
    
    // Trigger event
    this.triggerEvent('correct', { 
      target, 
      timeTaken 
    });
  }
  
  onIncorrectAction(target) {
    if (!this.active) return;
    
    // Trigger event
    this.triggerEvent('incorrect', { target });
  }
  
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }
  
  triggerEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }
  
  cleanup() {
    // Remove event listeners
    this.active = false;
  }
} 