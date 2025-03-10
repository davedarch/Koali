class ProgressBar {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    
    this.progressBar = container.querySelector('#progress-bar');
    this.progressFill = container.querySelector('#progress-fill');
    this.levelIndicator = container.querySelector('#level-indicator');
  }
  
  updateProgress(progress) {
    this.progressFill.style.width = `${progress}%`;
  }
  
  updateLevel(level) {
    this.levelIndicator.textContent = `Level ${level}`;
  }
  
  showLevelComplete() {
    if (this.progressBar) {
      this.progressBar.classList.add('level-complete-animation');
      
      setTimeout(() => {
        this.progressBar.classList.remove('level-complete-animation');
      }, 1000);
    }
  }
} 