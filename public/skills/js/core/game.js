class Game {
  constructor(inputMethod, challenge, options = {}) {
    this.inputMethod = inputMethod;
    this.challenge = challenge;
    this.options = options;
    
    // Set default options
    this.options.startLevel = options.startLevel || 1;
    this.options.maxLevel = options.maxLevel || 10;
    
    // Create game state
    this.state = new GameState({
      startLevel: this.options.startLevel,
      maxLevel: this.options.maxLevel
    });
    
    // Get container
    this.container = document.getElementById('game-container');
    
    // Create game area
    this.gameArea = document.createElement('div');
    this.gameArea.className = 'game-area';
    this.container.appendChild(this.gameArea);
    
    // Initialize UI components
    this.feedback = new FeedbackSystem(this.container);
    this.progressBar = new ProgressBar(this.container);
    this.audio = new AudioSystem();
    
    // Initialize challenge and input method
    this.challenge.init(this.gameArea);
    this.inputMethod.init(this.gameArea);
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for correct actions
    this.inputMethod.on('correct', (data) => {
      this.handleCorrectAction(data);
    });
    
    // Listen for incorrect actions
    this.inputMethod.on('incorrect', (data) => {
      this.handleIncorrectAction(data);
    });
  }
  
  handleCorrectAction(data) {
    // Show success feedback
    this.feedback.showSuccess();
    this.audio.playSound('success');
    
    // Update progress
    const result = this.state.incrementProgress();
    this.progressBar.updateProgress(this.state.levelProgress);
    
    // Check if level up or game complete
    if (result === true) {
      // Game complete
      setTimeout(() => {
        this.feedback.showGameComplete();
        this.audio.playSound('complete');
      }, 1000);
    } else if (result === 'level-up') {
      // Level up
      this.progressBar.updateLevel(this.state.currentLevel);
      setTimeout(() => {
        this.setupNextChallenge();
      }, 1000);
    } else {
      // Continue current level
      setTimeout(() => {
        this.setupNextChallenge();
      }, 1000);
    }
  }
  
  handleIncorrectAction(data) {
    // Show error feedback
    this.feedback.showError();
    this.audio.playSound('error');
    
    // Update progress (optional penalty)
    this.state.decrementProgress();
    this.progressBar.updateProgress(this.state.levelProgress);
  }
  
  async setupNextChallenge() {
    console.log('Setting up next challenge...');
    
    // Clean up previous challenge
    this.challenge.cleanup();
    this.inputMethod.cleanup();
    
    try {
      // Generate new challenge
      const challengeData = await this.challenge.generateChallenge(this.state.currentLevel);
      console.log('Challenge generated:', challengeData);
      
      // Ensure the game area is properly sized before positioning elements
      // Force a reflow
      this.gameArea.offsetHeight;
      
      // Set up input method for this challenge
      this.inputMethod.setupForChallenge(challengeData);
      
      // Set instruction
      console.log('Setting instruction:', challengeData.instruction);
      this.feedback.setInstruction(challengeData.instruction);
    } catch (error) {
      console.error('Error generating challenge:', error);
      this.feedback.setInstruction('Error: Could not generate challenge');
    }
  }
  
  async start() {
    console.log('Starting game...');
    
    // Set initial level display
    this.progressBar.updateLevel(this.state.currentLevel);
    this.progressBar.updateProgress(this.state.levelProgress);
    
    // Set up first challenge
    await this.setupNextChallenge();
  }
  
  reset() {
    // Reset game state
    this.state.resetGame();
    
    // Update UI
    this.progressBar.updateLevel(this.state.currentLevel);
    this.progressBar.updateProgress(this.state.levelProgress);
    
    // Set up new challenge
    this.setupNextChallenge();
  }
} 