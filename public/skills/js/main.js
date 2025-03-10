// Example of creating a game
function createGame(interactionType, challengeType, options = {}) {
  const interaction = InteractionFactory.create(interactionType);
  const challenge = ChallengeFactory.create(challengeType);
  
  return new Game(interaction, challenge, options);
}

// Usage
const clickNumberGame = createGame('click', 'number', { maxLevel: 5 });
const dragSizeGame = createGame('drag', 'size', { maxLevel: 3 }); 