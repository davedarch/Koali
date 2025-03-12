class NumberChallenge extends Challenge {
  constructor(options = {}) {
    super(options);
    
    // Define colors
    this.colors = [
      { hex: '#3498db', name: 'blue' },
      { hex: '#e67e22', name: 'orange' },
      { hex: '#9b59b6', name: 'purple' },
      { hex: '#f1c40f', name: 'yellow' },
      { hex: '#c0392b', name: 'red' }
    ];
  }
  
  async generateChallenge(level) {
    console.log("=== GENERATING NUMBER CHALLENGE ===");
    this.currentLevel = level;
    
    // Determine number of elements based on level
    const elementCount = Math.min(3 + level, 10);
    
    // Create elements
    const elements = this.createElements(elementCount);
    
    // Generate numbers based on level
    let maxNumber = 10 + (level * 5);
    let numbers = [];
    let challengeType;
    let correctElements = [];
    let instruction;
    let mode = 'single'; // Default to single selection
    
    // Determine challenge type based on level
    if (level <= 2) {
      // Find the largest number
      challengeType = 'largest';
      
      // Generate random numbers
      for (let i = 0; i < elementCount; i++) {
        let num;
        do {
          num = Math.floor(Math.random() * maxNumber) + 1;
        } while (numbers.includes(num));
        numbers.push(num);
      }
      
      const largestNumber = Math.max(...numbers);
      correctElements = [elements.find((el, idx) => idx === numbers.indexOf(largestNumber))];
      instruction = 'Click on the largest number';
    } 
    else if (level <= 4) {
      // Find the smallest number
      challengeType = 'smallest';
      
      // Generate random numbers
      for (let i = 0; i < elementCount; i++) {
        let num;
        do {
          num = Math.floor(Math.random() * maxNumber) + 1;
        } while (numbers.includes(num));
        numbers.push(num);
      }
      
      const smallestNumber = Math.min(...numbers);
      correctElements = [elements.find((el, idx) => idx === numbers.indexOf(smallestNumber))];
      instruction = 'Click on the smallest number';
    }
    else if (level <= 6) {
      // Find multiples of X (moved up from levels 7-8)
      challengeType = 'multiples';
      maxNumber = 30; // Keep numbers manageable for multiples
      
      // Choose a number to find multiples of (2, 3, 5, or 10)
      const multipleBases = [2, 3, 5, 10];
      const baseNumber = multipleBases[Math.floor(Math.random() * multipleBases.length)];
      
      // Ensure we have at least 2 multiples and some non-multiples
      const targetMultipleCount = Math.max(2, Math.floor(elementCount * 0.4));
      
      // Generate multiples first
      for (let i = 0; i < targetMultipleCount; i++) {
        let multiple;
        do {
          multiple = baseNumber * (Math.floor(Math.random() * (maxNumber / baseNumber)) + 1);
        } while (numbers.includes(multiple));
        
        numbers.push(multiple);
      }
      
      // Then generate non-multiples
      for (let i = numbers.length; i < elementCount; i++) {
        let num;
        do {
          num = Math.floor(Math.random() * maxNumber) + 1;
        } while (numbers.includes(num) || num % baseNumber === 0);
        
        numbers.push(num);
      }
      
      // Shuffle numbers
      numbers = numbers.sort(() => Math.random() - 0.5);
      
      // Identify all multiples as correct
      correctElements = elements.filter((el, idx) => numbers[idx] % baseNumber === 0);
      mode = 'all';
      instruction = `Click on ALL multiples of ${baseNumber}`;
    }
    else if (level <= 8) {
      // Find factors of X (moved up from levels 9-10)
      challengeType = 'factors';
      
      // Choose a number with several factors
      const numberWithFactors = [12, 16, 18, 20, 24, 30, 36];
      const targetNumber = numberWithFactors[Math.floor(Math.random() * numberWithFactors.length)];
      
      // Generate all factors
      const factors = [];
      for (let i = 1; i <= targetNumber; i++) {
        if (targetNumber % i === 0) {
          factors.push(i);
        }
      }
      
      // Choose a subset of factors if we have too many
      let selectedFactors = factors;
      if (factors.length > elementCount - 1) {
        selectedFactors = factors.sort(() => Math.random() - 0.5).slice(0, elementCount - 1);
      }
      
      // Add non-factors to reach elementCount
      const nonFactors = [];
      while (selectedFactors.length + nonFactors.length < elementCount) {
        const num = Math.floor(Math.random() * (targetNumber * 2)) + 1;
        if (!factors.includes(num) && !nonFactors.includes(num)) {
          nonFactors.push(num);
        }
      }
      
      // Combine and shuffle
      numbers = [...selectedFactors, ...nonFactors].sort(() => Math.random() - 0.5);
      
      // Identify all factors as correct
      correctElements = elements.filter((el, idx) => targetNumber % numbers[idx] === 0);
      mode = 'all';
      instruction = `Click on ALL factors of ${targetNumber}`;
    }
    else if (level <= 10) {
      // Find square numbers (moved up from levels 11-12)
      challengeType = 'squares';
      maxNumber = 12; // Up to 12² = 144
      
      // Ensure we have at least one square number
      const squareRoot = Math.floor(Math.random() * maxNumber) + 1;
      const squareNumber = squareRoot * squareRoot;
      numbers.push(squareNumber);
      
      // Generate other non-square numbers
      while (numbers.length < elementCount) {
        const num = Math.floor(Math.random() * (maxNumber * maxNumber)) + 1;
        const root = Math.sqrt(num);
        if (!numbers.includes(num) && Math.floor(root) !== root) {
          numbers.push(num);
        }
      }
      
      // Shuffle numbers
      numbers = numbers.sort(() => Math.random() - 0.5);
      
      // Identify the square number(s) as correct
      correctElements = elements.filter((el, idx) => {
        const num = numbers[idx];
        const root = Math.sqrt(num);
        return Math.floor(root) === root;
      });
      
      // Decide if we're looking for one or all square numbers
      if (correctElements.length === 1) {
        instruction = 'Click on the square number';
      } else {
        mode = 'all';
        instruction = 'Click on ALL square numbers';
      }
    }
    else {
      // Find prime numbers (moved up from levels 13+)
      challengeType = 'primes';
      maxNumber = 50; // Reasonable range for prime checking
      
      // Helper to check if a number is prime
      const isPrime = (num) => {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
          if (num % i === 0) return false;
        }
        return true;
      };
      
      // Generate a mix of prime and non-prime numbers
      const targetPrimeCount = Math.max(2, Math.floor(elementCount * 0.4));
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      
      // Select some prime numbers
      const selectedPrimes = primes.sort(() => Math.random() - 0.5).slice(0, targetPrimeCount);
      numbers.push(...selectedPrimes);
      
      // Add non-prime numbers
      while (numbers.length < elementCount) {
        const num = Math.floor(Math.random() * maxNumber) + 1;
        if (!isPrime(num) && !numbers.includes(num)) {
          numbers.push(num);
        }
      }
      
      // Shuffle numbers
      numbers = numbers.sort(() => Math.random() - 0.5);
      
      // Identify all prime numbers as correct
      correctElements = elements.filter((el, idx) => isPrime(numbers[idx]));
      mode = 'all';
      instruction = 'Click on ALL prime numbers';
    }
    
    // Apply numbers and colors to elements
    elements.forEach((element, index) => {
      element.classList.add('challenge-element', 'number-element');
      element.textContent = numbers[index];
      element.dataset.number = numbers[index];
      
      // Set correct attribute
      const isCorrect = correctElements.includes(element);
      element.dataset.isTarget = isCorrect.toString();
      
      // Select random color
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      element.style.backgroundColor = color.hex;
      
      // Make numbers bigger - approximately 67% increase
      element.style.width = '100px';  // Increased to 100px
      element.style.height = '100px'; // Increased to 100px
      element.style.fontSize = '52px'; // Increased proportionally
      element.style.fontWeight = 'bold';
      
      // Additional styling to ensure numbers are centered
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      
      // Add a slight drop shadow for better visibility
      element.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
    });
    
    // Position elements
    this.renderElements(elements);
    this.positionElements(elements);
    
    console.log("Elements after creation:", elements);
    
    return {
      instruction,
      elements,
      correctElement: mode === 'single' ? correctElements[0] : null,
      correctElements,
      mode,
      metadata: {
        challengeType,
        numbers
      }
    };
  }

  positionElements(elements) {
    console.log("=== NUMBER CHALLENGE POSITIONING START ===");
    console.log(`Positioning ${elements.length} elements`);
    
    // Ensure elements are in the DOM
    elements.forEach(element => {
      if (!this.container.contains(element)) {
        this.container.appendChild(element);
      }
    });
    
    // Force a reflow to ensure elements have dimensions
    this.container.offsetHeight;
    
    // Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Define usable area
    const topMargin = 120;    // Fixed top margin for instructions
    const bottomMargin = 100; // Fixed bottom margin for progress bar
    const leftMargin = 80;    // Fixed left margin
    const rightMargin = 80;   // Fixed right margin
    
    const usableWidth = containerWidth - leftMargin - rightMargin;
    const usableHeight = containerHeight - topMargin - bottomMargin;
    
    console.log(`Usable area: ${usableWidth} x ${usableHeight}`);
    
    // Track placed elements to prevent overlaps
    const placedElements = [];
    const safetyMargin = 30;  // Increased from 20 to ensure better separation
    
    // Position each element
    elements.forEach((element, index) => {
      // Get actual element dimensions
      const measuredWidth = element.offsetWidth;
      const measuredHeight = element.offsetHeight;
      const width = measuredWidth || 100;  // Fallback width
      const height = measuredHeight || 100; // Fallback height
      
      console.log(`Element ${index} (${element.textContent}): ${width}x${height}`);
      
      // Available positioning space
      const availableX = Math.max(0, usableWidth - width);
      const availableY = Math.max(0, usableHeight - height);
      
      // Try to find non-overlapping position
      let left = 0, top = 0;
      let overlaps = true;
      let attempts = 0;
      const maxAttempts = 100; // Increased from 50
      
      while (overlaps && attempts < maxAttempts) {
        attempts++;
        
        // Generate random position
        const randomX = Math.random();
        const randomY = Math.random();
        left = leftMargin + randomX * availableX;
        top = topMargin + randomY * availableY;
        
        // Check if this position overlaps with any placed element
        overlaps = placedElements.some(placedEl => {
          // Check if rectangles overlap with safety margin
          return !(
            left + width + safetyMargin < placedEl.left ||
            left > placedEl.left + placedEl.width + safetyMargin ||
            top + height + safetyMargin < placedEl.top ||
            top > placedEl.top + placedEl.height + safetyMargin
          );
        });
        
        if (attempts === maxAttempts) {
          console.warn(`Couldn't find non-overlapping position for element ${index} after ${maxAttempts} attempts`);
        }
      }
      
      // Apply position
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      
      // Add this element to placed elements
      placedElements.push({
        left,
        top,
        width,
        height,
        element
      });
      
      console.log(`Positioned element ${index} (${element.textContent}): at ${left}px, ${top}px after ${attempts} attempts`);
    });
    
    console.log("=== NUMBER CHALLENGE POSITIONING COMPLETE ===");
    return elements;
  }

  createNumberElement(number, type) {
    console.log(`Creating number element: ${number} with type: ${type}`);
    
    const element = document.createElement('div');
    element.classList.add('challenge-element', 'number');
    
    // Add a distinctive class to help identify our styled elements
    element.classList.add('number-element');
    
    element.dataset.number = number;
    element.dataset.type = type;
    element.textContent = number;
    
    // Apply styles with !important to ensure they aren't overridden
    element.style.fontSize = '48px !important'; // Even larger for testing
    element.style.width = '75px !important';
    element.style.height = '75px !important';
    
    // Apply other styles
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.borderRadius = '50%';
    element.style.backgroundColor = this.getNumberColor(number);
    element.style.color = 'white';
    element.style.fontWeight = 'bold';
    element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    
    // Log what we expect the size to be
    console.log(`Number ${number} - Setting size to: ${element.style.width}x${element.style.height}, fontSize: ${element.style.fontSize}`);
    
    return element;
  }

  generateSequenceChallenge(level) {
    this.currentLevel = level;
    
    // Determine sequence length based on level
    const sequenceLength = Math.min(3 + Math.floor(level / 2), 6);
    
    // Create elements for the sequence
    const elements = [];
    const numbers = [];
    
    // Generate unique numbers
    let maxNumber = 30 + (level * 5);
    while (numbers.length < sequenceLength) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    
    // Sort numbers for the sequence (ascending by default)
    let sortedNumbers = [...numbers].sort((a, b) => a - b);
    let sequenceDirection = 'ascending';
    
    // For higher levels, sometimes use descending order
    if (level > 3 && Math.random() > 0.5) {
      sortedNumbers = [...numbers].sort((a, b) => b - a);
      sequenceDirection = 'descending';
    }
    
    // Create elements for each number
    numbers.forEach((number, index) => {
      const element = this.createNumberElement(number, 'number');
      element.dataset.sortValue = number; // For sorting
      element.dataset.index = index; // To track original order
      elements.push(element);
    });
    
    // Create additional distractor elements for higher levels
    if (level > 2) {
      const distractorCount = Math.min(2 + Math.floor(level / 2), 4);
      for (let i = 0; i < distractorCount; i++) {
        let num;
        do {
          num = Math.floor(Math.random() * maxNumber) + 1;
        } while (numbers.includes(num));
        
        const element = this.createNumberElement(num, 'distractor');
        element.dataset.sortValue = num;
        element.dataset.index = sequenceLength + i;
        elements.push(element);
      }
    }
    
    // Define the correct sequence - indices of elements that should be in sorted order
    const correctSequence = elements
      .filter(el => el.dataset.type === 'number')
      .sort((a, b) => {
        if (sequenceDirection === 'ascending') {
          return parseInt(a.dataset.sortValue) - parseInt(b.dataset.sortValue);
        } else {
          return parseInt(b.dataset.sortValue) - parseInt(a.dataset.sortValue);
        }
      })
      .map(el => el.dataset.index);
    
    // Create instruction
    const instruction = `Arrange the numbers in ${sequenceDirection} order`;
    
    // Shuffle all elements
    this.shuffleArray(elements);
    
    return {
      instruction,
      elements,
      correctSequence,
      mode: 'sequence'
    };
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
} 