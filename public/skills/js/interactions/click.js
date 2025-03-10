class ClickInteraction extends Interaction {
  constructor(container, options = {}) {
    super(container, options);
    this.clickables = [];
  }
  
  setupEventListeners() {
    this.container.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    const clickable = event.target.closest('.clickable');
    if (!clickable) return;
    
    if (clickable.dataset.correct === 'true') {
      this.onCorrectAction(clickable);
    } else {
      this.onIncorrectAction(clickable);
    }
  }
  
  setClickables(elements) {
    this.clickables = elements;
  }
  
  setCorrectClickable(element) {
    this.clickables.forEach(el => {
      el.dataset.correct = (el === element) ? 'true' : 'false';
    });
  }
} 