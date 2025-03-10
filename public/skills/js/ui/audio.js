class AudioSystem {
  constructor() {
    this.isMuted = false;
    
    // Create silent audio elements as fallbacks
    this.createSilentAudio();
    
    // Try to load actual sound files
    this.loadSounds();
  }
  
  createSilentAudio() {
    // Create silent audio elements as fallbacks
    this.sounds = {
      success: this.createSilentAudioElement(),
      error: this.createSilentAudioElement(),
      complete: this.createSilentAudioElement()
    };
  }
  
  createSilentAudioElement() {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    return audio;
  }
  
  loadSounds() {
    // Try to load actual sound files
    const soundFiles = {
      success: '/skills/sounds/success.mp3',
      error: '/skills/sounds/error.mp3',
      complete: '/skills/sounds/complete.mp3'
    };
    
    // Try to load each sound
    Object.entries(soundFiles).forEach(([name, path]) => {
      fetch(path)
        .then(response => {
          if (response.ok) {
            // If file exists, create audio element
            this.sounds[name] = new Audio(path);
            this.sounds[name].load();
          }
        })
        .catch(error => {
          console.warn(`Could not load sound: ${name}`, error);
        });
    });
  }
  
  speak(text) {
    if (this.isMuted) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not available:', error);
    }
  }
  
  playSound(name) {
    if (this.isMuted) return;
    
    try {
      if (this.sounds[name]) {
        // Reset sound to beginning
        this.sounds[name].currentTime = 0;
        
        // Play sound
        this.sounds[name].play().catch(error => {
          console.warn('Could not play sound:', error);
        });
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
} 