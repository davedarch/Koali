// Base interaction class
class Interaction {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.eventHandlers = {};
  }
  
  init() {
    // Common initialization
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // To be implemented by subclasses
  }
  
  onCorrectAction(target) {
    // Common correct action handling
    this.triggerEvent('correct', { target });
  }
  
  onIncorrectAction(target) {
    // Common incorrect action handling
    this.triggerEvent('incorrect', { target });
  }
  
  // Event system
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
    // Remove event listeners, etc.
  }
} 