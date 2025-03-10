// Debug Panel for Skills Game
class DebugPanel {
  constructor(game) {
    this.game = game;
    this.isVisible = false;
    this.container = null;
    this.init();
  }

  init() {
    // Create debug panel container
    this.container = document.createElement('div');
    this.container.id = 'debug-panel';
    this.container.className = 'debug-panel';
    
    // Set initial styles for the panel
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0',
      right: '0',
      width: '300px',
      height: '100%',
      backgroundColor: 'rgba(25, 25, 25, 0.9)',
      color: 'white',
      padding: '10px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      zIndex: '10000',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.3)'
    });

    // Create panel content
    this.createPanelContent();
    
    // Add toggle button
    this.createToggleButton();
    
    // Add to document
    document.body.appendChild(this.container);
    
    // Register keyboard shortcut (Alt+D)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'd') {
        this.toggle();
      }
    });
  }

  createPanelContent() {
    // Header
    const header = document.createElement('h2');
    header.textContent = 'Debug Panel';
    header.style.margin = '0 0 15px 0';
    header.style.color = '#3498db';
    this.container.appendChild(header);
    
    // Create sections
    this.createInfoSection();
    this.createLevelSection();
    this.createChallengeSection();
    this.createControlsSection();
    this.createLogSection();
  }
  
  createInfoSection() {
    const section = this.createSection('Game Info');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const input = urlParams.get('input') || 'None';
    const challenge = urlParams.get('challenge') || 'None';
    const level = urlParams.get('level') || '1';
    
    const info = document.createElement('div');
    info.innerHTML = `
      <div><strong>Input:</strong> <span id="debug-input">${input}</span></div>
      <div><strong>Challenge:</strong> <span id="debug-challenge">${challenge}</span></div>
      <div><strong>Current Level:</strong> <span id="debug-current-level">${level}</span></div>
    `;
    section.appendChild(info);
    
    // Add event listener to update info
    const updateInfo = () => {
      const currentLevel = this.game?.currentLevel || 'Unknown';
      document.getElementById('debug-current-level').textContent = currentLevel;
    };
    
    // Update every second
    setInterval(updateInfo, 1000);
  }
  
  createLevelSection() {
    const section = this.createSection('Level Control');
    
    // Create level selector
    const levelControl = document.createElement('div');
    levelControl.style.display = 'flex';
    levelControl.style.marginBottom = '10px';
    
    // Level input
    const levelInput = document.createElement('input');
    levelInput.type = 'number';
    levelInput.id = 'debug-level-input';
    levelInput.min = '1';
    levelInput.max = '20';
    levelInput.value = this.game?.currentLevel || '1';
    levelInput.style.width = '60px';
    levelInput.style.marginRight = '10px';
    levelControl.appendChild(levelInput);
    
    // Go button
    const goButton = this.createButton('Go');
    goButton.addEventListener('click', () => {
      const level = parseInt(document.getElementById('debug-level-input').value, 10);
      this.setLevel(level);
    });
    levelControl.appendChild(goButton);
    
    section.appendChild(levelControl);
    
    // Level navigation buttons
    const levelNav = document.createElement('div');
    levelNav.style.display = 'flex';
    levelNav.style.gap = '10px';
    
    const prevButton = this.createButton('← Prev');
    prevButton.addEventListener('click', () => {
      const currentLevel = parseInt(document.getElementById('debug-level-input').value, 10);
      if (currentLevel > 1) {
        this.setLevel(currentLevel - 1);
        document.getElementById('debug-level-input').value = currentLevel - 1;
      }
    });
    levelNav.appendChild(prevButton);
    
    const nextButton = this.createButton('Next →');
    nextButton.addEventListener('click', () => {
      const currentLevel = parseInt(document.getElementById('debug-level-input').value, 10);
      this.setLevel(currentLevel + 1);
      document.getElementById('debug-level-input').value = currentLevel + 1;
    });
    levelNav.appendChild(nextButton);
    
    section.appendChild(levelNav);
  }
  
  createChallengeSection() {
    const section = this.createSection('Challenge Types');
    
    // Get all available challenge types
    const challengeTypes = ['basic', 'number', 'word', 'spelling'];
    
    const challengeSelect = document.createElement('select');
    challengeSelect.id = 'debug-challenge-select';
    challengeSelect.style.width = '100%';
    challengeSelect.style.marginBottom = '10px';
    challengeSelect.style.padding = '5px';
    
    // Add options for each challenge type
    challengeTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      
      // Set selected based on current URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('challenge') === type) {
        option.selected = true;
      }
      
      challengeSelect.appendChild(option);
    });
    
    section.appendChild(challengeSelect);
    
    // Change challenge button
    const changeButton = this.createButton('Change Challenge');
    changeButton.style.width = '100%';
    changeButton.addEventListener('click', () => {
      const challenge = document.getElementById('debug-challenge-select').value;
      this.changeChallenge(challenge);
    });
    section.appendChild(changeButton);
  }
  
  createControlsSection() {
    const section = this.createSection('Controls');
    
    const controlsGrid = document.createElement('div');
    controlsGrid.style.display = 'grid';
    controlsGrid.style.gridTemplateColumns = '1fr 1fr';
    controlsGrid.style.gap = '10px';
    
    // Skip button
    const skipButton = this.createButton('Skip Challenge');
    skipButton.addEventListener('click', () => this.skipChallenge());
    controlsGrid.appendChild(skipButton);
    
    // Autocomplete button
    const autocompleteButton = this.createButton('Autocomplete');
    autocompleteButton.addEventListener('click', () => this.autocomplete());
    controlsGrid.appendChild(autocompleteButton);
    
    // Show Answers button
    const showAnswersButton = this.createButton('Show Answers');
    showAnswersButton.addEventListener('click', () => this.showAnswers());
    controlsGrid.appendChild(showAnswersButton);
    
    // Reset Game button
    const resetButton = this.createButton('Reset Game');
    resetButton.addEventListener('click', () => this.resetGame());
    controlsGrid.appendChild(resetButton);
    
    section.appendChild(controlsGrid);
  }
  
  createLogSection() {
    const section = this.createSection('Debug Log');
    
    // Create log container
    const logContainer = document.createElement('div');
    logContainer.id = 'debug-log';
    logContainer.style.height = '150px';
    logContainer.style.backgroundColor = '#111';
    logContainer.style.color = '#2ecc71';
    logContainer.style.padding = '5px';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.fontSize = '12px';
    logContainer.style.overflowY = 'scroll';
    section.appendChild(logContainer);
    
    // Add clear button
    const clearButton = this.createButton('Clear Log');
    clearButton.style.marginTop = '5px';
    clearButton.addEventListener('click', () => {
      document.getElementById('debug-log').innerHTML = '';
    });
    section.appendChild(clearButton);
    
    // Override console.log
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      this.addToLog(args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return arg.toString();
          }
        }
        return arg;
      }).join(' '));
    };
  }
  
  addToLog(message) {
    const logElement = document.getElementById('debug-log');
    if (logElement) {
      const entry = document.createElement('div');
      entry.textContent = message;
      logElement.appendChild(entry);
      logElement.scrollTop = logElement.scrollHeight;
    }
  }
  
  createToggleButton() {
    const button = document.createElement('button');
    button.id = 'debug-toggle';
    button.textContent = '⚙️';
    
    Object.assign(button.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: '10001',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)'
    });
    
    button.addEventListener('click', () => this.toggle());
    document.body.appendChild(button);
  }
  
  createSection(title) {
    const section = document.createElement('div');
    section.className = 'debug-section';
    section.style.marginBottom = '20px';
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.margin = '0 0 10px 0';
    sectionTitle.style.padding = '0 0 5px 0';
    sectionTitle.style.borderBottom = '1px solid #666';
    sectionTitle.style.color = '#f1c40f';
    
    section.appendChild(sectionTitle);
    this.container.appendChild(section);
    
    return section;
  }
  
  createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    
    Object.assign(button.style, {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer'
    });
    
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#2980b9';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#3498db';
    });
    
    return button;
  }
  
  toggle() {
    this.isVisible = !this.isVisible;
    this.container.style.transform = this.isVisible ? 'translateX(0)' : 'translateX(100%)';
  }
  
  setLevel(level) {
    try {
      // Update level in game
      if (this.game && typeof this.game.setLevel === 'function') {
        this.game.setLevel(level);
      } else {
        // Fallback: reload the page with the new level
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('level', level);
        window.location.href = `${window.location.pathname}?${urlParams.toString()}`;
      }
      this.addToLog(`Setting level to ${level}`);
    } catch (error) {
      this.addToLog(`Error setting level: ${error.message}`);
    }
  }
  
  changeChallenge(challenge) {
    try {
      // Update URL and reload
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('challenge', challenge);
      window.location.href = `${window.location.pathname}?${urlParams.toString()}`;
      this.addToLog(`Changing challenge to ${challenge}`);
    } catch (error) {
      this.addToLog(`Error changing challenge: ${error.message}`);
    }
  }
  
  skipChallenge() {
    try {
      // Try to access the game and trigger next challenge
      if (this.game && typeof this.game.nextChallenge === 'function') {
        this.game.nextChallenge();
        this.addToLog('Skipped to next challenge');
      } else {
        this.addToLog('Game or nextChallenge method not found');
      }
    } catch (error) {
      this.addToLog(`Error skipping challenge: ${error.message}`);
    }
  }
  
  autocomplete() {
    try {
      // Get the current challenge from the game
      const challenge = this.game?.currentChallenge;
      
      if (!challenge) {
        this.addToLog('No active challenge found');
        return;
      }
      
      // Get the correct elements
      if (challenge.mode === 'all') {
        // For "all" mode, click all correct elements
        if (challenge.correctElements && challenge.correctElements.length) {
          challenge.correctElements.forEach(element => {
            element.click();
          });
          this.addToLog(`Clicked ${challenge.correctElements.length} correct elements`);
        }
      } else {
        // For single mode, click the correct element
        if (challenge.correctElement) {
          challenge.correctElement.click();
          this.addToLog('Clicked correct element');
        }
      }
    } catch (error) {
      this.addToLog(`Error autocompleting challenge: ${error.message}`);
    }
  }
  
  showAnswers() {
    try {
      // Get the current challenge from the game
      const challenge = this.game?.currentChallenge;
      
      if (!challenge) {
        this.addToLog('No active challenge found');
        return;
      }
      
      // Highlight the correct elements
      if (challenge.mode === 'all') {
        if (challenge.correctElements && challenge.correctElements.length) {
          challenge.correctElements.forEach(element => {
            this.highlightElement(element);
          });
          this.addToLog(`Highlighted ${challenge.correctElements.length} correct elements`);
        }
      } else {
        if (challenge.correctElement) {
          this.highlightElement(challenge.correctElement);
          this.addToLog('Highlighted correct element');
        }
      }
      
      // Remove highlights after 2 seconds
      setTimeout(() => {
        document.querySelectorAll('.debug-highlight').forEach(el => {
          el.classList.remove('debug-highlight');
        });
      }, 2000);
    } catch (error) {
      this.addToLog(`Error showing answers: ${error.message}`);
    }
  }
  
  highlightElement(element) {
    // Store original style
    const originalOutline = element.style.outline;
    const originalZIndex = element.style.zIndex;
    
    // Add highlight
    element.classList.add('debug-highlight');
    element.style.outline = '3px solid #2ecc71';
    element.style.outlineOffset = '2px';
    element.style.zIndex = '1000';
    
    // Reset after 2 seconds
    setTimeout(() => {
      element.style.outline = originalOutline;
      element.style.zIndex = originalZIndex;
    }, 2000);
  }
  
  resetGame() {
    try {
      window.location.reload();
      this.addToLog('Game reset');
    } catch (error) {
      this.addToLog(`Error resetting game: ${error.message}`);
    }
  }
}

// Initialize debug panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for the game to initialize
  setTimeout(() => {
    // Try to find the game instance
    const game = window.game || null;
    
    // Create debug panel
    window.debugPanel = new DebugPanel(game);
    
    // Log initialization
    console.log('Debug panel initialized. Press Alt+D to toggle.');
  }, 1000);
}); 