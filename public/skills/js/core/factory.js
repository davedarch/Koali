class GameFactory {
  static createInputMethod(type, options = {}) {
    console.log(`GameFactory.createInputMethod - Creating input method of type: ${type}`);
    
    switch (type.toLowerCase()) {
      case 'click':
        console.log("Creating ClickInputMethod");
        return new ClickInputMethod(options);
      case 'drag':
        console.log("Creating DragInputMethod");
        return new DragInputMethod(options);
      case 'select':
        console.log("Creating SelectInputMethod");
        return new SelectInputMethod(options);
      case 'sequence':
        console.log("Creating SequenceInputMethod");
        return new SequenceInputMethod(options);
      default:
        console.error(`Unknown input method: ${type}`);
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
    console.log(`GameFactory.createGame - Creating game with input: ${inputType}, challenge: ${challengeType}`);
    
    const input = this.createInputMethod(inputType, options.inputOptions || {});
    const challenge = this.createChallenge(challengeType, options.challengeOptions || {});
    
    return new Game(input, challenge, options);
  }
} 