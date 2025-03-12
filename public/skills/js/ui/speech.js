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
  createClickableInstruction(htmlString, container) {
    console.log("SpeechService.createClickableInstruction - Input HTML:", htmlString);
    
    // Clear the container
    container.innerHTML = '';
    
    // Create a wrapper div to hold all content
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.flexDirection = 'column';
    contentWrapper.style.alignItems = 'center';
    contentWrapper.style.width = '100%';
    container.appendChild(contentWrapper);
    
    // Split the HTML at the <br> tag first, then remove other HTML tags
    const parts = htmlString.split(/<br>/);
    console.log("Parts after splitting by <br>:", parts);
    
    // Process each part (before and after the <br>)
    parts.forEach((part, index) => {
      // Remove remaining HTML tags
      const cleanPart = part.replace(/<[^>]*>/g, '').trim();
      if (!cleanPart) return; // Skip empty parts
      
      console.log(`Processing part ${index}:`, cleanPart);
      
      const lineContainer = document.createElement('div');
      lineContainer.style.display = 'flex';
      lineContainer.style.width = '100%';
      lineContainer.style.justifyContent = 'center';
      lineContainer.style.alignItems = 'center';
      
      // Add play icon to the first part only
      if (index === 0) {
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-volume-up play-icon';
        playIcon.style.fontSize = '24px';
        playIcon.style.marginRight = '10px';
        playIcon.style.cursor = 'pointer';
        playIcon.style.color = '#000';
        
        // Add click handler to play icon that reads the entire instruction
        playIcon.addEventListener('click', () => {
          const fullText = htmlString.replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');
          console.log("Speaking full instruction:", fullText);
          this.speakInstruction(fullText);
        });
        
        lineContainer.appendChild(playIcon);
      }
      
      // Create a container for words
      const wordsContainer = document.createElement('div');
      wordsContainer.style.display = 'inline-block';
      
      // Style the second part (sequence items)
      if (index === 1) {
        wordsContainer.style.fontWeight = 'bold';
        wordsContainer.style.marginTop = '10px'; // Reduced from 20px
        wordsContainer.style.paddingTop = '5px'; // Reduced from 10px
        wordsContainer.style.borderTop = '1px solid #eee';
        wordsContainer.style.color = '#000';
      }
      
      // Split this part into words and create clickable spans
      const words = cleanPart.split(/\s+/);
      
      words.forEach(word => {
        if (!word) return;
        
        const span = document.createElement('span');
        span.className = 'clickable-word';
        span.textContent = word + ' ';
        span.style.cursor = 'pointer';
        
        // Make each word clickable
        span.addEventListener('click', () => {
          console.log("Speaking word:", word);
          this.speakWord(word);
        });
        
        wordsContainer.appendChild(span);
      });
      
      lineContainer.appendChild(wordsContainer);
      contentWrapper.appendChild(lineContainer);
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