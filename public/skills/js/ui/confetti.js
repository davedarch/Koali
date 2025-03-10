function createConfetti() {
  const confettiCount = 200;
  const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 5 + 5}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.top = '-10px';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.opacity = Math.random();
    confetti.style.zIndex = '1999';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    document.body.appendChild(confetti);
    
    // Animate confetti
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 2;
    
    confetti.animate([
      { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${Math.random() * 100 - 50}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: duration * 1000,
      delay: delay * 1000,
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
      fill: 'forwards'
    });
    
    // Remove confetti after animation
    setTimeout(() => {
      document.body.removeChild(confetti);
    }, (duration + delay) * 1000);
  }
} 