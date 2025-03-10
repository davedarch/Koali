class FeedbackSystem {
  constructor(container) {
    this.container = container;
    this.instructionElement = container.querySelector('#instruction');
  }
  
  setInstruction(text) {
    if (this.instructionElement) {
      console.log('Setting instruction:', text); // Debug log
      this.instructionElement.textContent = text;
      this.instructionElement.style.display = 'block'; // Ensure it's visible
    } else {
      console.error('Instruction element not found!');
      // Try to find it again or create it if missing
      this.instructionElement = this.container.querySelector('#instruction');
      if (!this.instructionElement) {
        this.instructionElement = document.createElement('div');
        this.instructionElement.id = 'instruction';
        this.instructionElement.style.fontSize = '48px';
        this.instructionElement.style.marginTop = '0';
        this.instructionElement.style.textAlign = 'center';
        this.instructionElement.style.display = 'flex';
        this.instructionElement.style.alignItems = 'center';
        this.instructionElement.style.justifyContent = 'center';
        this.instructionElement.style.height = '10vh';
        this.instructionElement.style.width = '100%';
        this.instructionElement.style.backgroundColor = '#f4f4f4';
        this.instructionElement.style.position = 'fixed';
        this.instructionElement.style.top = '0';
        this.instructionElement.style.zIndex = '1000';
        this.container.prepend(this.instructionElement);
      }
      this.instructionElement.textContent = text;
    }
  }
  
  showSuccess() {
    console.log('Success!');
    // Could add a success animation or sound here
  }
  
  showError() {
    console.log('Incorrect!');
    // Could add an error animation or sound here
  }
  
  showGameComplete() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '2000';
    
    const message = document.createElement('h1');
    message.textContent = 'Congratulations!';
    message.style.color = 'white';
    message.style.fontSize = '3rem';
    
    const button = document.createElement('button');
    button.textContent = 'Return to Home';
    button.style.marginTop = '20px';
    button.style.padding = '10px 20px';
    button.style.fontSize = '1.2rem';
    button.onclick = () => {
      window.location.href = '/';
    };
    
    overlay.appendChild(message);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
  }
} 