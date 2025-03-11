class GameFactory {
  static createInputMethod(type, options = {}) {
    switch (type.toLowerCase()) {
      case 'click':
        return new ClickInputMethod(options);
      case 'drag':
        return new DragInputMethod(options);
      case 'select':
        return new SelectInputMethod(options);
      default:
        throw new Error(`Unknown input method: ${type}`);
    }
  }
  
  static createChallenge(type, options = {}) {
    switch (type.toLowerCase()) {
      case 'basic':
        return new BasicChallenge(options);
      case 'number':
        return new NumberChallenge(options);
      case 'size':
        return new SizeChallenge(options);
      case 'word':
        return new WordChallenge(options);
      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  }
  
  static createGame(inputType, challengeType, options = {}) {
    const input = this.createInputMethod(inputType, options.inputOptions || {});
    const challenge = this.createChallenge(challengeType, options.challengeOptions || {});
    
    return new Game(input, challenge, options);
  }
} 