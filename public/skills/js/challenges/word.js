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
      
      // For "single" mode, ensure we have exactly one target word
      if (mode === 'single') {
        const hasTargetWord = selectedWords.some(word => word.isTarget);
        if (!hasTargetWord) {
          // If no target words in the selection, replace the first word with a target word
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
      
      // Take the required number of words
      selectedWords = selectedWords.slice(0, wordCount);
      
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
            instruction = `Click on ${article} word that is ${article} ${targetCategory.name}`;
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

  positionElements(elements) {
    // First, add elements to the DOM if not already there
    elements.forEach(element => {
      if (!this.container.contains(element)) {
        this.container.appendChild(element);
      }
    });
    
    // Force a reflow to ensure elements have their dimensions
    this.container.offsetHeight;
    
    // Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    console.log(`Container dimensions: ${containerWidth} x ${containerHeight}`);
    
    // Define the usable area (central area not overlapping instructions/progress)
    const topMargin = 120;    // Fixed top margin for instructions
    const bottomMargin = 100; // Fixed bottom margin for progress bar
    const leftMargin = 80;    // Fixed left margin
    const rightMargin = 80;   // Fixed right margin
    
    const usableWidth = containerWidth - leftMargin - rightMargin;
    const usableHeight = containerHeight - topMargin - bottomMargin;
    
    console.log(`Usable area: ${usableWidth} x ${usableHeight}`);
    
    // Keep track of placed elements to prevent overlaps
    const placedElements = [];
    // Safety margin around elements to prevent them from being too close
    const safetyMargin = 20;
    
    // Position each element randomly within the usable area
    elements.forEach((element, index) => {
      // Get element dimensions (or use defaults)
      const measuredWidth = element.offsetWidth;
      const measuredHeight = element.offsetHeight;
      const width = measuredWidth || 120;
      const height = measuredHeight || 40;
      
      console.log(`Element ${index} measured dimensions: ${measuredWidth}x${measuredHeight} (using ${width}x${height})`);
      
      // Compute available random space (ensure non-negative)
      const availableX = Math.max(0, usableWidth - width);
      const availableY = Math.max(0, usableHeight - height);
      
      // Try to find a position without overlaps
      let left = 0, top = 0;
      let overlaps = true;
      let attempts = 0;
      const maxAttempts = 50; // Prevent infinite loops
      
      while (overlaps && attempts < maxAttempts) {
        attempts++;
        
        // Generate random position
        const randomFactorX = Math.random();
        const randomFactorY = Math.random();
        left = leftMargin + randomFactorX * availableX;
        top = topMargin + randomFactorY * availableY;
        
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
      
      console.log(`Element ${index} (${element.textContent}): positioned at ${left}px, ${top}px} (after ${attempts} attempts)`);
    });
  }
}

// If not using modules, add this line to make the class global
window.WordChallenge = WordChallenge;