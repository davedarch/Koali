class GameState {
  constructor(options = {}) {
    this.options = options;
    this.currentLevel = options.startLevel || 1;
    this.maxLevel = options.maxLevel || 5;
    this.levelProgress = 0;
    this.progressIncrement = options.progressIncrement || 20;
    this.progressPenalty = options.progressPenalty || 5;
  }
  
  incrementProgress() {
    this.levelProgress += this.progressIncrement;
    
    // Check if level is complete
    if (this.levelProgress >= 100) {
      this.levelProgress = 0;
      this.currentLevel++;
      
      // Check if game is complete
      if (this.currentLevel > this.maxLevel) {
        return true; // Game complete
      }
      
      return 'level-up'; // Level up
    }
    
    return false; // Continue current level
  }
  
  decrementProgress() {
    this.levelProgress = Math.max(0, this.levelProgress - this.progressPenalty);
    return false; // Continue current level
  }
  
  saveState() {
    localStorage.setItem('gameState', JSON.stringify({
      level: this.currentLevel,
      progress: this.levelProgress
    }));
  }
  
  loadState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.currentLevel = state.level || this.options.startLevel || 1;
        this.levelProgress = state.progress || 0;
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }
  
  resetGame() {
    this.currentLevel = this.options.startLevel || 1;
    this.levelProgress = 0;
  }
} 