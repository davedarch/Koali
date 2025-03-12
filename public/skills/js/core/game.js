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
    
    // Initialize UI components with game reference
    this.feedback = new FeedbackSystem(this.container, this);
    this.progressBar = new ProgressBar(this.container);
    this.audio = new AudioSystem();
    this.speechService = new SpeechService();
    
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
    this.feedback.showCorrectFeedback();
    
    // Update progress
    const result = this.state.incrementProgress();
    this.progressBar.updateProgress(this.state.levelProgress);
    
    // Check if level up or game complete
    if (result === true) {
      // Game complete
      setTimeout(() => {
        this.feedback.showGameComplete();
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
    this.feedback.showIncorrectFeedback();
    
    // Update progress (optional penalty)
    this.state.decrementProgress();
    this.progressBar.updateProgress(this.state.levelProgress);
  }
  
  async setupNextChallenge() {
    console.log('Game.setupNextChallenge - Setting up next challenge...');
    console.log('Current level:', this.state.currentLevel);
    
    // Clean up previous challenge
    this.challenge.cleanup();
    this.inputMethod.cleanup();
    
    try {
      // Generate new challenge
      console.log("Calling challenge.generateChallenge...");
      const challengeData = await this.challenge.generateChallenge(this.state.currentLevel);
      console.log('Challenge generated:', challengeData);
      console.log('Challenge mode:', challengeData.mode);
      
      // Ensure the game area is properly sized before positioning elements
      // Force a reflow
      this.gameArea.offsetHeight;
      
      // Set up input method for this challenge
      console.log("Setting up input method with challenge data");
      this.inputMethod.setupForChallenge(challengeData);
      
      // Set instruction
      console.log('Original instruction:', challengeData.instruction);
      const modifiedInstruction = this.inputMethod.modifyInstructionForInput(challengeData.instruction);
      console.log('Modified instruction:', modifiedInstruction);
      
      // Update to use the game's setInstruction method
      this.setInstruction(modifiedInstruction);
      
      // Update level indicator
      this.progressBar.updateLevel(this.state.currentLevel);
      
      // Update progress bar
      this.progressBar.updateProgress(this.state.levelProgress);
    } catch (error) {
      console.error('Error generating challenge:', error);
      this.feedback.setInstruction('Error: Could not generate challenge');
    }
  }
  
  async start() {
    console.log('Game.start - Starting game...');
    console.log('URL:', window.location.href);
    console.log('URL params:', new URLSearchParams(window.location.search).toString());
    
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
  
  setInstruction(instruction) {
    const instructionElement = document.getElementById('instruction');
    
    // Replace newline characters with <br> tags and wrap the entire instruction in a div
    const formattedInstruction = `<div style="display:block; text-align:center;">${instruction.replace(/\n/g, '<br>')}</div>`;
    
    if (this.speechService) {
      // Use the speech service on the full instruction text (one clickable icon for all)
      this.speechService.createClickableInstruction(formattedInstruction, instructionElement);
    } else {
      // Fall back on plain HTML if no speech service is available
      instructionElement.innerHTML = formattedInstruction;
    }
    
    // Store the original instruction text as well
    this.feedback.currentInstruction = instruction;
    
    console.log('Setting instruction:', instruction);
  }
} 