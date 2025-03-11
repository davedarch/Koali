class SpeechService {
  constructor(options = {}) {
    this.options = Object.assign({
      rate: 0.75,  // Default slower rate for clearer speech
      pitch: 1.0,
      volume: 1.0
    }, options);
  }
  
  speak(text, options = {}) {
    if (!text) return;
    
    // Create a new utterance with merged options
    const utterance = new SpeechSynthesisUtterance(text);
    const utteranceOptions = Object.assign({}, this.options, options);
    
    // Apply options
    utterance.rate = utteranceOptions.rate;
    utterance.pitch = utteranceOptions.pitch;
    utterance.volume = utteranceOptions.volume;
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    return utterance;
  }
  
  speakInstruction(instruction) {
    // Split instruction into words for possible word-by-word speaking
    this.words = instruction.split(' ');
    this.speak(instruction);
  }
  
  speakWord(word) {
    this.speak(word);
  }
  
  // Create clickable instruction element
  createClickableInstruction(instruction, container) {
    // Clear container
    container.innerHTML = '';
    
    // Create a single play icon at the beginning
    const playIcon = document.createElement('i');
    playIcon.className = 'fas fa-volume-up play-icon';
    playIcon.style.fontSize = '24px';
    playIcon.style.marginRight = '15px';
    playIcon.style.cursor = 'pointer';
    playIcon.style.color = '#000'; // Black color
    
    // Add click handler to play icon
    playIcon.addEventListener('click', () => {
      this.speakInstruction(instruction);
    });
    
    container.appendChild(playIcon);
    
    // Split text into words
    const words = instruction.split(' ');
    
    // Create span for each word
    words.forEach(word => {
      const span = document.createElement('span');
      span.classList.add('clickable-word');
      span.textContent = word;
      
      // Add click handler
      span.addEventListener('click', () => {
        this.speakWord(word);
      });
      
      container.appendChild(span);
      
      // Add space after each word except the last
      if (word !== words[words.length - 1]) {
        container.appendChild(document.createTextNode(' '));
      }
    });
    
    return container;
  }
  
  // Make any element speak its text content when clicked
  makeSpeakable(element, customText = null) {
    element.style.cursor = 'pointer';
    
    element.addEventListener('click', () => {
      const textToSpeak = customText || element.textContent;
      this.speakWord(textToSpeak);
    });
    
    return element;
  }
} 