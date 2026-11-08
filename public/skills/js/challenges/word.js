class WordChallenge extends Challenge {
  constructor(options = {}) {
    super(options);
    
    // Define word categories with correct paths
    this.categories = [
      { id: 'animals', name: 'animal', file: '/skills/words/animals.txt' },
      { id: 'body', name: 'body part', file: '/skills/words/body.txt' },
      { id: 'clothes', name: 'clothing item', file: '/skills/words/clothes.txt' },
      { id: 'colors', name: 'color', file: '/skills/words/colors.txt' },
      { id: 'countries', name: 'country', file: '/skills/words/countries.txt' },
      { id: 'emotions', name: 'emotion', file: '/skills/words/emotions.txt' },
      { id: 'food', name: 'food', file: '/skills/words/food.txt' },
      { id: 'jobs', name: 'job', file: '/skills/words/jobs.txt' },
      { id: 'rooms', name: 'room', file: '/skills/words/rooms.txt' },
      { id: 'vehicles', name: 'vehicle', file: '/skills/words/vehicles.txt' }
    ];
    
    // Use the same color palette as in BasicChallenge
    this.colors = [
      { hex: '#3498db', name: 'blue' },
      { hex: '#e67e22', name: 'orange' },
      { hex: '#9b59b6', name: 'purple' },
      { hex: '#f1c40f', name: 'yellow' },
      { hex: '#c0392b', name: 'red' }
    ];
    
    // Cache for loaded word lists
    this.wordCache = {};
    
    // Challenge modes
    this.modes = ['single', 'all'];
    
    // Fallback words for each category in case loading fails
    this.fallbackWords = {
      animals: ['cat', 'dog', 'horse', 'lion', 'tiger', 'elephant', 'monkey', 'zebra', 'bear', 'rabbit'],
      body: ['head', 'arm', 'leg', 'foot', 'hand', 'eye', 'ear', 'nose', 'mouth', 'hair'],
      clothes: ['shirt', 'trousers', 'dress', 'shoes', 'hat', 'coat', 'scarf', 'gloves', 'jumper', 'skirt'],
      colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'],
      countries: ['England', 'France', 'Spain', 'Italy', 'Germany', 'America', 'Canada', 'China', 'Japan', 'Australia'],
      emotions: ['happy', 'sad', 'angry', 'scared', 'excited', 'tired', 'bored', 'surprised', 'confused', 'proud'],
      food: ['apple', 'banana', 'pizza', 'pasta', 'bread', 'cheese', 'chicken', 'rice', 'potato', 'carrot'],
      jobs: ['teacher', 'doctor', 'nurse', 'police', 'firefighter', 'chef', 'farmer', 'driver', 'pilot', 'artist'],
      rooms: ['kitchen', 'bedroom', 'bathroom', 'living room', 'dining room', 'hallway', 'attic', 'garage', 'garden', 'office'],
      vehicles: ['car', 'bus', 'train', 'plane', 'bike', 'boat', 'ship', 'truck', 'tractor', 'helicopter']
    };
  }
  
  async loadWordList(categoryId) {
    // Return from cache if already loaded
    if (this.wordCache[categoryId]) {
      return this.wordCache[categoryId];
    }
    
    // Find category file path
    const category = this.categories.find(cat => cat.id === categoryId);
    if (!category) {
      console.error(`Category not found: ${categoryId}`);
      return [];
    }
    
    try {
      const response = await fetch(category.file);
      if (!response.ok) {
        throw new Error(`Failed to load word list: ${response.status}`);
      }
      
      const text = await response.text();
      const words = text.split('\n')
        .map(word => word.trim())
        .filter(word => word && !word.startsWith('#'));
      
      // Cache the result
      this.wordCache[categoryId] = words;
      return words;
    } catch (error) {
      console.error('Error loading word list:', error);
      return [];
    }
  }
  
  async generateChallenge(level) {
    this.currentLevel = level;
    
    try {
      // Determine challenge mode based on level
      // For odd levels: single selection, for even levels: select all
      const modeIndex = level % 2;
      const mode = this.modes[modeIndex];
      
      // Determine number of words to show based on level
      const wordCount = Math.min(4 + level, 10);
      
      // Select categories for this challenge
      const categoryCount = Math.min(2 + Math.floor(level / 2), this.categories.length);
      const shuffledCategories = [...this.categories].sort(() => Math.random() - 0.5).slice(0, categoryCount);
      
      // Select one category as the target
      const targetCategory = shuffledCategories[Math.floor(Math.random() * shuffledCategories.length)];
      
      // Load words for all selected categories
      const wordLists = await Promise.all(
        shuffledCategories.map(category => this.loadWordList(category.id))
      );
      
      // Create a pool of words from all categories
      const wordPool = shuffledCategories.flatMap((category, index) => {
        return wordLists[index].map(word => ({
          text: word,
          category: category.id,
          isTarget: category.id === targetCategory.id
        }));
      });
      
      // If no words were loaded, create a fallback challenge
      if (wordPool.length === 0) {
        return this.createFallbackChallenge(level);
      }
      
      // Shuffle the word pool - use a variable that can be reassigned
      let selectedWords = [...wordPool].sort(() => Math.random() - 0.5);
      
      // For "all" mode, ensure we have at least 2 target words (but not too many)
      if (mode === 'all') {
        const targetWords = wordPool.filter(word => word.isTarget);
        const nonTargetWords = wordPool.filter(word => !word.isTarget);
        
        // Aim for about 30-40% of words to be targets in "all" mode
        const desiredTargetCount = Math.max(2, Math.floor(wordCount * 0.3));
        
        // Rebuild the word selection with the desired ratio
        let newSelectedWords = [];
        
        // Add target words (up to the desired count)
        if (targetWords.length > 0) {
          // Shuffle target words
          const shuffledTargets = [...targetWords].sort(() => Math.random() - 0.5);
          // Take up to the desired count
          newSelectedWords = shuffledTargets.slice(0, desiredTargetCount);
        }
        
        // Fill the rest with non-target words
        if (nonTargetWords.length > 0) {
          // Shuffle non-target words
          const shuffledNonTargets = [...nonTargetWords].sort(() => Math.random() - 0.5);
          // Take enough to reach wordCount
          newSelectedWords = [
            ...newSelectedWords,
            ...shuffledNonTargets.slice(0, wordCount - newSelectedWords.length)
          ];
        }
        
        // Final shuffle of the selected words
        selectedWords = newSelectedWords.sort(() => Math.random() - 0.5);
      }
      
      // Take the required number of words
      selectedWords = selectedWords.slice(0, wordCount);

      // For "single" mode, ensure we have exactly one target word
      if (mode === 'single') {
        const hasTargetWord = selectedWords.some(word => word.isTarget);
        if (!hasTargetWord) {
          // If no target words survived the cut, swap one in (was previously
          // done before slicing, so the only target could be sliced away)
          const targetWords = wordPool.filter(word => word.isTarget);
          if (targetWords.length > 0) {
            selectedWords[0] = targetWords[Math.floor(Math.random() * targetWords.length)];
          }
        } else {
          // If multiple target words, keep only one
          let foundTarget = false;
          selectedWords = selectedWords.map(word => {
            if (word.isTarget) {
              if (foundTarget) {
                // Convert extra targets to non-targets
                return { ...word, isTarget: false };
              }
              foundTarget = true;
            }
            return word;
          });
        }
      }
      
      
      // Create elements for the words
      const elements = this.createElements(selectedWords.length);
      
      // Apply words to elements
      elements.forEach((element, index) => {
        const word = selectedWords[index];
        
        element.textContent = word.text;
        element.dataset.category = word.category;
        element.dataset.isTarget = word.isTarget.toString();
        element.classList.add('word-element');
        
        // Use the consistent color palette
        const colorIndex = index % this.colors.length;
        element.style.backgroundColor = this.colors[colorIndex].hex;
        element.style.color = 'white';
        element.style.borderRadius = '24px';
        element.style.padding = '40px 60px';
        element.style.fontSize = '48px';
        element.style.fontWeight = 'bold';
        
        // Add these explicit styles to fix the width issue
        element.style.display = 'inline-block';
        element.style.width = 'auto';
        element.style.maxWidth = '500px';
        element.style.whiteSpace = 'nowrap';
        element.style.overflow = 'hidden';
        element.style.textOverflow = 'ellipsis';
      });
      
      // Find all correct elements (there might be multiple)
      const correctElements = elements.filter(el => el.dataset.isTarget === 'true');
      
      // For single mode, select one correct element for the instruction
      let correctElement = null;
      if (mode === 'single') {
        correctElement = correctElements[0];
      }
      
      // Create instruction based on mode
      let instruction;
      if (mode === 'single') {
        // Check if there are multiple target words available in the word pool
        const targetWordsInPool = wordPool.filter(word => word.isTarget).length;
        
        if (level <= 2) {
          // Simpler instruction for lower levels
          // Use "a" or "an" if there are multiple targets available
          if (targetWordsInPool > 1) {
            // Determine if we should use "a" or "an"
            const firstLetter = targetCategory.name.trim().charAt(0).toLowerCase();
            const useAn = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            const article = useAn ? 'an' : 'a';
            instruction = `Click on ${article} ${targetCategory.name}`;
          } else {
            // Only one target, use "the"
            instruction = `Click on the ${targetCategory.name}`;
          }
        } else {
          // More complex instruction for higher levels
          if (targetWordsInPool > 1) {
            // Determine if we should use "a" or "an"
            const firstLetter = targetCategory.name.trim().charAt(0).toLowerCase();
            const useAn = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
            const article = useAn ? 'an' : 'a';
            instruction = `Click on a word that is ${article} ${targetCategory.name}`;
          } else {
            instruction = `Click on the word that is a ${targetCategory.name}`;
          }
        }
      } else { // 'all' mode
        instruction = `Click on ALL the ${targetCategory.name}s`;
      }
      
      // Position elements
      this.renderElements(elements);
      this.positionElements(elements);
      
      // Log all words for debugging
      console.log("Challenge words:", selectedWords.map(word => ({
        text: word.text,
        category: word.category,
        isTarget: word.isTarget
      })));
      
      // Validate that we have at least one correct element for the target category
      if (correctElements.length === 0) {
        console.error(`ERROR: No ${targetCategory.name} words found in the challenge!`);
        console.warn("Regenerating challenge with fallback words");
        return this.createFallbackChallenge(level);
      }
      
      return {
        instruction,
        elements,
        correctElement,
        correctElements,
        mode,
        metadata: {
          category: targetCategory.id,
          categoryName: targetCategory.name,
          mode
        }
      };
    } catch (error) {
      console.error('Error generating word challenge:', error);
      return this.createFallbackChallenge(level);
    }
  }

  // Update the createFallbackChallenge method to use more varied fallback words
  createFallbackChallenge(level) {
    // Determine mode based on level
    const modeIndex = level % 2;
    const mode = this.modes[modeIndex];
    
    // Select random categories for this fallback challenge
    const availableCategories = Object.keys(this.fallbackWords);
    const shuffledCategories = [...availableCategories].sort(() => Math.random() - 0.5);
    
    // Select target category
    const targetCategory = shuffledCategories[0];
    const targetCategoryName = this.categories.find(c => c.id === targetCategory)?.name || targetCategory;
    
    // Create a pool of words from the fallback lists
    let wordPool = [];
    
    // Add target words
    const targetWords = this.fallbackWords[targetCategory] || ['cat', 'dog'];
    wordPool = wordPool.concat(targetWords.map(word => ({
      text: word,
      category: targetCategory,
      isTarget: true
    })));
    
    // Add words from other categories
    for (let i = 1; i < Math.min(3, shuffledCategories.length); i++) {
      const category = shuffledCategories[i];
      const words = this.fallbackWords[category] || [];
      wordPool = wordPool.concat(words.map(word => ({
        text: word,
        category: category,
        isTarget: false
      })));
    }
    
    // Shuffle the pool
    const shuffledPool = [...wordPool].sort(() => Math.random() - 0.5);
    
    // Determine number of words to show
    const wordCount = Math.min(4 + level, 10);
    
    // For "all" mode, ensure we have multiple target words
    let selectedWords = [];
    if (mode === 'all') {
      // Get target words
      const targetWords = shuffledPool.filter(word => word.isTarget);
      // Get non-target words
      const nonTargetWords = shuffledPool.filter(word => !word.isTarget);
      
      // Select 2-3 target words
      const targetCount = Math.min(Math.max(2, Math.floor(wordCount * 0.4)), targetWords.length);
      selectedWords = targetWords.slice(0, targetCount);
      
      // Fill the rest with non-target words
      selectedWords = [
        ...selectedWords,
        ...nonTargetWords.slice(0, wordCount - selectedWords.length)
      ];
      
      // Final shuffle
      selectedWords = selectedWords.sort(() => Math.random() - 0.5);
    } else {
      // For single mode, just take one target and the rest non-targets
      const targetWord = shuffledPool.find(word => word.isTarget);
      const nonTargetWords = shuffledPool.filter(word => !word.isTarget);
      
      if (targetWord) {
        selectedWords = [targetWord, ...nonTargetWords.slice(0, wordCount - 1)];
        // Shuffle
        selectedWords = selectedWords.sort(() => Math.random() - 0.5);
      } else {
        // Fallback if no target word found
        selectedWords = shuffledPool.slice(0, wordCount);
        if (selectedWords.length > 0) {
          selectedWords[0].isTarget = true;
        }
      }
    }
    
    // Create elements
    const elements = this.createElements(selectedWords.length);
    
    // Apply words to elements
    elements.forEach((element, index) => {
      const word = selectedWords[index];
      
      element.textContent = word.text;
      element.dataset.category = word.category;
      element.dataset.isTarget = word.isTarget.toString();
      element.classList.add('word-element');
      
      // Use the consistent color palette
      const colorIndex = index % this.colors.length;
      element.style.backgroundColor = this.colors[colorIndex].hex;
      element.style.color = 'white';
      element.style.borderRadius = '24px';
      element.style.padding = '40px 60px';
      element.style.fontSize = '48px';
      element.style.fontWeight = 'bold';
      
      // Add these explicit styles to fix the width issue
      element.style.display = 'inline-block';
      element.style.width = 'auto';
      element.style.maxWidth = '500px';
      element.style.whiteSpace = 'nowrap';
      element.style.overflow = 'hidden';
      element.style.textOverflow = 'ellipsis';
    });
    
    // Find all correct elements
    const correctElements = elements.filter(el => el.dataset.isTarget === 'true');
    
    // Validate that we have at least one correct element
    if (correctElements.length === 0) {
      console.error("ERROR: No target words in fallback challenge!");
      
      // Force at least one word to be a target
      if (selectedWords.length > 0 && elements.length > 0) {
        console.warn("Forcing first word to be a target");
        selectedWords[0].isTarget = true;
        elements[0].dataset.isTarget = 'true';
        // Update correctElements array
        correctElements.push(elements[0]);
      }
    }
    
    // Create instruction based on mode
    let instruction;
    if (mode === 'single') {
      // Count how many target words we have
      const targetWordCount = selectedWords.filter(word => word.isTarget).length;
      
      if (targetWordCount > 1) {
        // Determine if we should use "a" or "an"
        const firstLetter = targetCategoryName.trim().charAt(0).toLowerCase();
        const useAn = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter);
        const article = useAn ? 'an' : 'a';
        instruction = `Click on ${article} ${targetCategoryName}`;
      } else {
        instruction = `Click on the ${targetCategoryName}`;
      }
    } else {
      instruction = `Click on ALL the ${targetCategoryName}s`;
    }
    
    // Position elements
    this.renderElements(elements);
    this.positionElements(elements);
    
    // Log all fallback words for debugging
    console.log("Fallback words:", selectedWords.map(word => ({
      text: word.text,
      category: word.category,
      isTarget: word.isTarget
    })));
    
    return {
      instruction,
      elements,
      correctElement: mode === 'single' ? correctElements[0] : null,
      correctElements,
      mode,
      metadata: {
        category: targetCategory,
        categoryName: targetCategoryName,
        mode
      }
    };
  }

  renderElements(elements) {
    while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
    elements.forEach(element => this.container.appendChild(element));
    this.container.offsetHeight;
  }

  positionElements(elements) {
    // First, add elements to the DOM if not already there
    elements.forEach(element => {
      if (!this.container.contains(element)) {
        this.container.appendChild(element);
      }
      // .word-element carries a 5px margin; on an absolutely positioned card
      // that shifts the box off the computed left/top, so drop it.
      element.style.margin = '0';
    });

    // Force a reflow to ensure elements have their dimensions
    this.container.offsetHeight;

    // The container is the .game-area, which already sits between the
    // instruction bar and the progress bar, so only a small inset is needed.
    const containerRect = this.container.getBoundingClientRect();
    const inset = 16;
    const usableWidth = containerRect.width - inset * 2;
    const usableHeight = containerRect.height - inset * 2;

    // Measure the cards and lay them on a shuffled grid: every card gets its
    // own cell, then is jittered inside the cell's slack so the layout still
    // feels scattered. Random placement with rejection could not fit 7 cards
    // of ~240x135 in the area and left them stacked on top of each other.
    const n = elements.length;
    // Drag input adds a 150x150 drop target after we lay out: reserve a cell
    // for it so it never has to squeeze in between cards.
    const reserveDrop = new URLSearchParams(window.location.search).get('input') === 'drag';
    const slots = n + (reserveDrop ? 1 : 0);
    // Drop target is 150x150 on a big screen but shrinks with the cards on
    // small ones, so a phone can still fit ten cards plus the target.
    let dropW = 0, dropH = 0;
    const measure = () => elements.map(el => ({ w: el.offsetWidth || 120, h: el.offsetHeight || 40 }));
    let sizes = measure();
    const remeasure = () => {
      const cardW = Math.max(...sizes.map(s => s.w));
      const cardH = Math.max(...sizes.map(s => s.h));
      if (reserveDrop) {
        dropW = Math.min(150, Math.max(cardW, 90));
        dropH = Math.min(150, Math.max(cardH, 60));
      }
      maxW = Math.max(cardW, dropW);
      maxH = Math.max(cardH, dropH);
    };
    let maxW, maxH;
    remeasure();

    let gap = 24;
    let cols, rows, cellW, cellH;
    const fits = () => {
      cellW = maxW + gap;
      cellH = maxH + gap;
      cols = Math.max(1, Math.floor(usableWidth / cellW));
      rows = Math.max(1, Math.floor(usableHeight / cellH));
      return cols * rows >= slots;
    };
    const tryGaps = () => { gap = 24; while (!fits() && gap > 0) gap -= 4; return cols * rows >= slots; };

    // Step down through card sizes until the grid fits. Cards are styled
    // inline (48px / 40px 60px) by the challenge generator, so override here.
    const sizeSteps = [
      { font: '48px', pad: '40px 60px' },
      { font: '40px', pad: '28px 44px' },
      { font: '32px', pad: '20px 32px' },
      { font: '26px', pad: '14px 22px' }
    ];
    let fitted = tryGaps();
    for (let i = 1; i < sizeSteps.length && !fitted; i++) {
      elements.forEach(el => { el.style.fontSize = sizeSteps[i].font; el.style.padding = sizeSteps[i].pad; });
      this.container.offsetHeight;
      sizes = measure();
      remeasure();
      fitted = tryGaps();
    }
    console.log(`WordLayout: ${n} cards, area ${Math.round(usableWidth)}x${Math.round(usableHeight)}, card ${maxW}x${maxH}, grid ${cols}x${rows}, gap ${gap}, fitted ${fitted}`);

    if (!fitted) {
      // Even the smallest cards do not fit: pack as tightly as possible and
      // let the grid overflow rather than stacking cards on one another.
      cols = Math.max(1, Math.floor(usableWidth / maxW));
      rows = Math.ceil(slots / cols);
      cellW = usableWidth / cols;
      cellH = Math.max(maxH, usableHeight / rows);
      console.warn(`Word cards do not fit: ${n} cards, grid ${cols}x${rows}`);
    }

    // Centre the used grid block in the area
    const usedCols = Math.min(cols, slots);
    const usedRows = Math.ceil(slots / cols);
    const originX = inset + (usableWidth - usedCols * cellW) / 2;
    const originY = inset + (usableHeight - usedRows * cellH) / 2;

    // Shuffle cell order so the target word is not predictable by position
    const cells = Array.from({ length: cols * usedRows }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, slots);

    // Hand the spare cell to the drag input via a data attribute
    delete this.container.dataset.dropCell;
    if (reserveDrop) {
      const cell = cells[n];
      const col = cell % cols;
      const row = Math.floor(cell / cols);
      this.container.dataset.dropCell = JSON.stringify({
        x: Math.round(originX + col * cellW + (cellW - dropW) / 2),
        y: Math.round(originY + row * cellH + (cellH - dropH) / 2),
        w: dropW,
        h: dropH
      });
    }

    elements.forEach((element, index) => {
      const cell = cells[index];
      const col = cell % cols;
      const row = Math.floor(cell / cols);
      const slackX = Math.max(0, cellW - sizes[index].w);
      const slackY = Math.max(0, cellH - sizes[index].h);
      const left = originX + col * cellW + Math.random() * slackX;
      const top = originY + row * cellH + Math.random() * slackY;

      element.style.position = 'absolute';
      element.style.left = `${Math.round(left)}px`;
      element.style.top = `${Math.round(top)}px`;
    });
  }

  async generateSequenceChallenge(level) {
    this.currentLevel = level;
    
    // Determine sequence length based on level
    const sequenceLength = Math.min(3 + Math.floor(level / 2), 6);
    
    // Choose a category for this challenge
    const randomIndex = Math.floor(Math.random() * this.categories.length);
    const category = this.categories[randomIndex];
    
    // Load word list for this category
    let words = await this.loadWordList(category.id);
    
    // Fall back to fallback words if necessary
    if (!words || words.length < sequenceLength) {
      words = this.fallbackWords[category.id] || [];
    }
    
    // Choose random words from the list
    const selectedWords = [];
    while (selectedWords.length < sequenceLength && words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const word = words[randomIndex];
      
      // Skip duplicate words or too long words
      if (!selectedWords.includes(word) && word.length < 12) {
        selectedWords.push(word);
      }
      // Remove word from the pool to avoid duplicates
      words.splice(randomIndex, 1);
    }
    
    // Generate elements for each word
    const elements = [];
    
    selectedWords.forEach((word, index) => {
      const element = document.createElement('div');
      element.className = 'challenge-element word-element';
      element.textContent = word;
      element.dataset.word = word;
      element.dataset.index = index;
      
      // Apply random background color
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      element.style.backgroundColor = color.hex;
      
      elements.push(element);
    });
    
    // Decide on sequence type based on level
    let sequenceType = 'alphabetical';
    let correctSequence = [];
    
    if (level <= 3) {
      // Alphabetical order
      sequenceType = 'alphabetical';
      correctSequence = [...elements]
        .sort((a, b) => a.dataset.word.localeCompare(b.dataset.word))
        .map(el => el.dataset.index);
    } 
    else if (level <= 6) {
      // Word length order
      sequenceType = 'length';
      correctSequence = [...elements]
        .sort((a, b) => a.dataset.word.length - b.dataset.word.length)
        .map(el => el.dataset.index);
    } 
    else {
      // Custom sequence (like a simple sentence or logical sequence)
      sequenceType = 'custom';
      
      // For now, just use alphabetical as a fallback
      correctSequence = [...elements]
        .sort((a, b) => a.dataset.word.localeCompare(b.dataset.word))
        .map(el => el.dataset.index);
    }
    
    // Create instruction based on sequence type
    let instruction = `Arrange the ${category.name} words`;
    
    if (sequenceType === 'alphabetical') {
      instruction += ' in alphabetical order';
    } 
    else if (sequenceType === 'length') {
      instruction += ' from shortest to longest';
    } 
    else {
      instruction += ' in the correct order';
    }
    
    // Shuffle all elements
    this.shuffleArray(elements);
    
    return {
      instruction,
      elements,
      correctSequence,
      mode: 'sequence'
    };
  }

  // Add a shuffle method to the class
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// If not using modules, add this line to make the class global
window.WordChallenge = WordChallenge;