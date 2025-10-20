import easyPuzzle from './puzzles/easy.mjs';
import mediumPuzzle from './puzzles/medium.mjs';
import hardPuzzle from './puzzles/hard.mjs';

export default class WordSearch {
    constructor(puzzle = null) {
        // Set default difficulty
        this.currentDifficulty = 'easy';

        // Define available puzzles (determines UI buttons and puzzle numbering)
        this.availablePuzzles = ['easy', 'medium'];

        // Initialize separate states for each difficulty
        this.difficultyStates = {
            easy: {
                selectedLetters: [],
                foundWords: [],
                gameWon: false,
                letterColors: null,
                currentColorIndex: 0,
                isDragging: false
            },
            medium: {
                selectedLetters: [],
                foundWords: [],
                gameWon: false,
                letterColors: null,
                currentColorIndex: 0,
                isDragging: false
            },
            hard: {
                selectedLetters: [],
                foundWords: [],
                gameWon: false,
                letterColors: null,
                currentColorIndex: 0,
                isDragging: false
            }
        };
        
        // Load puzzle data
        this.puzzle = puzzle || this.getDefaultPuzzle();

        this.name = this.puzzle.name || 'Word Haunt';
        this.description = this.puzzle.description || 'Find words hidden in the letter grid!';
        this.score = 0;
        this.isRunning = false;

        // Use puzzle data
        this.grid = this.puzzle.grid;
        this.validWords = this.puzzle.words;

        // Initialize dynamic grid dimensions based on puzzle
        const rows = this.grid.length;
        const cols = this.grid[0]?.length || 0;

        // Track selected letters
        this.selectedLetters = [];
        this.foundWords = [];

        // Victory state
        this.gameWon = false;

        // Initialize letter colors for current difficulty if not set
        if (!this.difficultyStates[this.currentDifficulty].letterColors) {
            this.difficultyStates[this.currentDifficulty].letterColors = Array(rows).fill(null).map(() => Array(cols).fill(null));
        }
        
        this.availableColors = ['orange', 'purple', 'green', 'red', 'blue', 'yellow', 'pink', 'cyan'];
        
        // Load initial state from current difficulty
        this.loadDifficultyState(this.currentDifficulty);

        // Bind handlers
        this.handleLetterClick = this.handleLetterClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    }

    getPuzzleData() {
        return {
            easy: easyPuzzle,
            medium: mediumPuzzle,
            hard: hardPuzzle
        };
    }

    getPuzzleNumber(difficulty) {
        const index = this.availablePuzzles.indexOf(difficulty);
        return index !== -1 ? index + 1 : 0;
    }

    switchDifficulty(difficulty) {
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            console.warn('Invalid difficulty:', difficulty);
            return;
        }
        
        // Don't switch if already on this difficulty
        if (this.currentDifficulty === difficulty) {
            return;
        }
        
        // Save current state before switching
        this.saveCurrentState();
        
        // Switch to new difficulty
        this.currentDifficulty = difficulty;
        this.puzzle = this.getDefaultPuzzle();
        
        // Update puzzle-dependent properties
        this.name = this.puzzle.name;
        this.description = this.puzzle.description;
        this.grid = this.puzzle.grid;
        this.validWords = this.puzzle.words;
        
        // Load state for new difficulty
        this.loadDifficultyState(difficulty);

        // Update main game score
        if (window.gameApp) {
            window.gameApp.updateScore(this.score);
        }

        // Refresh the display
        this.updateDisplay();
    }

    handleDifficultyChange(event) {
        const difficulty = event.target.dataset.difficulty;
        if (difficulty) {
            this.switchDifficulty(difficulty);
        }
    }

    saveCurrentState() {
        const state = this.difficultyStates[this.currentDifficulty];
        
        // Save current game state (deep clone arrays to prevent reference issues)
        state.selectedLetters = this.selectedLetters.map(letter => ({...letter}));
        state.foundWords = [...this.foundWords];
        state.gameWon = this.gameWon;
        state.currentColorIndex = this.currentColorIndex;
        state.isDragging = this.isDragging;
        
        // Save letter colors (deep clone 2D array)
        if (this.letterColors) {
            state.letterColors = this.letterColors.map(row => [...row]);
        }
    }

    loadDifficultyState(difficulty) {
        const state = this.difficultyStates[difficulty];
        
        // Load state into current game properties
        this.selectedLetters = state.selectedLetters.map(letter => ({...letter}));
        this.foundWords = [...state.foundWords];
        this.gameWon = state.gameWon;
        this.currentColorIndex = state.currentColorIndex;
        this.isDragging = state.isDragging;
        
        // Load or initialize letter colors for current grid dimensions
        const rows = this.grid.length;
        const cols = this.grid[0]?.length || 0;
        
        if (state.letterColors && 
            state.letterColors.length === rows && 
            state.letterColors[0]?.length === cols) {
            // Grid dimensions match, restore saved colors
            this.letterColors = state.letterColors.map(row => [...row]);
        } else {
            // Grid dimensions changed or not initialized, create new array
            this.letterColors = Array(rows).fill(null).map(() => Array(cols).fill(null));
            state.letterColors = this.letterColors.map(row => [...row]);
        }
    }

    initializeDifficultyState(difficulty) {
        const puzzles = this.getPuzzleData();
        const puzzle = puzzles[difficulty];
        const rows = puzzle.grid.length;
        const cols = puzzle.grid[0]?.length || 0;
        
        this.difficultyStates[difficulty] = {
            selectedLetters: [],
            foundWords: [],
            gameWon: false,
            letterColors: Array(rows).fill(null).map(() => Array(cols).fill(null)),
            currentColorIndex: 0,
            isDragging: false
        };
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);
    }

    render() {
        const gridHTML = this.grid.map((row, rowIndex) => {
            return row.map((letter, colIndex) => {
                const isSelected = this.selectedLetters.some(sel => sel.row === rowIndex && sel.col === colIndex);
                const letterColor = this.letterColors[rowIndex][colIndex];

                let cellClasses = 'letter-cell';
                if (isSelected) {
                    cellClasses += ' selected';
                } else if (letterColor) {
                    cellClasses += ` found-word-${letterColor}`;
                }

                // Add ghost animation when player wins
                const shouldAnimate = this.gameWon;
                if (shouldAnimate) {
                    cellClasses += ' ghost-materializing';
                }

                // Calculate staggered animation delay based on position
                const gridCols = this.grid[0]?.length || 0;
                const animationDelay = shouldAnimate ? `${(rowIndex * gridCols + colIndex) * 100}ms` : '';
                const delayStyle = shouldAnimate ? `animation-delay: ${animationDelay};` : '';

                return `
                    <div class="${cellClasses}"
                         data-row="${rowIndex}"
                         data-col="${colIndex}"
                         data-letter="${letter}"
                         style="${delayStyle}">
                        ${letter}
                    </div>
                `;
            }).join('');
        }).join('');

        const selectedWord = this.selectedLetters.map(sel => sel.letter).join('');

        // Get the color that will be used for the next found word
        const currentColor = this.availableColors[this.currentColorIndex];
        const colorMap = {
            'orange': '#ff8c00',
            'purple': '#9932cc',
            'green': '#228b22',
            'red': '#dc143c',
            'blue': '#1e3a8a',
            'yellow': '#eab308',
            'pink': '#ec4899',
            'cyan': '#0891b2'
        };
        const currentHoverColor = colorMap[currentColor];
        const currentTextColor = currentColor === 'yellow' ? 'black' : 'white';

        // Get current puzzle grid dimensions for dynamic CSS
        const gridCols = this.grid[0]?.length || 8; // fallback to 8
        const gridRows = this.grid.length || 7;     // fallback to 7

        // CSS styles for both game states
        const styles = `
            <style>
                .word-search-game {
                    padding: 20px;
                    height: 100%;
                    overflow-y: auto;
                }

                .puzzle-subtitle {
                    font-size: 18px;
                    color: #ffd700;
                    font-weight: 700;
                    margin: -10px 0 20px 0;
                    font-style: italic;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    letter-spacing: 0.5px;
                }

                .word-search-container {
                    display: flex;
                    gap: 20px;
                    height: calc(100% - 60px);
                }

                .word-search-grid {
                    display: grid;
                    grid-template-columns: repeat(${gridCols}, 45px);
                    grid-template-rows: repeat(${gridRows}, 45px);
                    gap: 8px;
                    background: #2a1a0a;
                    padding: 15px;
                    border-radius: 8px;
                    border: 2px solid #8b4513;
                    align-self: flex-start;
                }

                .letter-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f4a460;
                    color: #2a1a0a;
                    font-weight: bold;
                    font-size: 22px;
                    cursor: pointer;
                    border-radius: 6px;
                    border: 2px solid #d2691e;
                    transition: all 0.2s ease;
                    user-select: none;
                }

                .letter-cell:hover:not(.found-word-orange):not(.found-word-purple):not(.found-word-green):not(.found-word-red):not(.found-word-blue):not(.found-word-yellow):not(.found-word-pink):not(.found-word-cyan) {
                    background: var(--hover-color);
                    transform: scale(1.1);
                }

                .letter-cell.selected {
                    background: var(--hover-color);
                    color: var(--hover-text-color);
                }

                /* Found word colors - Halloween themed */
                .found-word-orange {
                    background: #ff8c00;
                    color: white;
                    border-color: #ff6600;
                }

                .found-word-purple {
                    background: #9932cc;
                    color: white;
                    border-color: #7b2cbf;
                }

                .found-word-green {
                    background: #228b22;
                    color: white;
                    border-color: #006400;
                }

                .found-word-red {
                    background: #dc143c;
                    color: white;
                    border-color: #b91c3c;
                }

                .found-word-blue {
                    background: #1e3a8a;
                    color: white;
                    border-color: #1e40af;
                }

                .found-word-yellow {
                    background: #eab308;
                    color: black;
                    border-color: #ca8a04;
                }

                .found-word-pink {
                    background: #ec4899;
                    color: white;
                    border-color: #db2777;
                }

                .found-word-cyan {
                    background: #0891b2;
                    color: white;
                    border-color: #0e7490;
                }

                .word-search-sidebar {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-width: 300px;
                }

                .selected-word-section,
                .found-words-section {
                    background: rgba(139, 69, 19, 0.3);
                    padding: 15px;
                    border-radius: 8px;
                    border: 2px solid #8b4513;
                }

                .selected-word-section h3,
                .found-words-section h3 {
                    margin: 0 0 10px 0;
                    color: #ffd700;
                    font-size: 16px;
                }

                .selected-word {
                    background: #2a1a0a;
                    color: #ffd700;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 18px;
                    font-weight: bold;
                    min-height: 20px;
                    margin-bottom: 10px;
                    border: 1px solid #8b4513;
                }

                .word-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .word-controls button {
                    flex: 1;
                    padding: 8px 12px;
                    background: #8b4513;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.2s ease;
                }

                .word-controls button:hover:not(:disabled) {
                    background: #a0522d;
                }

                .word-controls button:disabled {
                    background: #666;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .word-feedback {
                    padding: 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    text-align: center;
                    min-height: 20px;
                }

                .word-feedback.correct {
                    background: #90EE90;
                    color: #006400;
                }

                .word-feedback.incorrect {
                    background: #FFB6C1;
                    color: #8B0000;
                }


                /* Ghost Shimmer Animation */
                @keyframes ghostMaterialize {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 
                                    0 0 30px rgba(255, 255, 255, 0.4),
                                    inset 0 0 10px rgba(255, 255, 255, 0.2);
                    }
                    25% {
                        opacity: 0.3;
                        transform: scale(0.9);
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 
                                    0 0 40px rgba(255, 255, 255, 0.6),
                                    inset 0 0 15px rgba(255, 255, 255, 0.3);
                    }
                    75% {
                        opacity: 0.8;
                        transform: scale(1.05);
                        box-shadow: 0 0 25px rgba(255, 255, 255, 1), 
                                    0 0 50px rgba(255, 255, 255, 0.8),
                                    inset 0 0 20px rgba(255, 255, 255, 0.4);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                        box-shadow: none;
                    }
                }

                @keyframes shimmerEffect {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }

                .letter-cell.ghost-materializing {
                    animation: ghostMaterialize 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    position: relative;
                    overflow: hidden;
                }

                .letter-cell.ghost-materializing::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.6),
                        transparent
                    );
                    background-size: 200% 100%;
                    animation: shimmerEffect 2s ease-in-out infinite;
                    animation-delay: 0.5s;
                    border-radius: 6px;
                    pointer-events: none;
                }
            </style>
        `;


        const difficultyButtons = this.availablePuzzles.map(difficulty => {
            const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            return `<button data-difficulty="${difficulty}" class="difficulty-btn ${this.currentDifficulty === difficulty ? 'active' : ''}">${capitalizedDifficulty}</button>`;
        }).join('\n                    ');

        return `
            <div class="game-screen word-search-game" style="--hover-color: ${currentHoverColor}; --hover-text-color: ${currentTextColor};">
                <div class="difficulty-selector">
                    <label>Difficulty: </label>
                    ${difficultyButtons}
                </div>
                <h2>Word Haunt</h2>
                <div class="puzzle-subtitle">Puzzle ${this.getPuzzleNumber(this.currentDifficulty)}: ${this.puzzle.name}</div>
                <div class="word-search-container">
                    <div class="word-search-grid">
                        ${gridHTML}
                    </div>

                    <div class="word-search-sidebar">
                        <div class="selected-word-section">
                            <h3>Selected Word:</h3>
                            <div class="selected-word">${selectedWord || '(none)'}</div>
                            <div class="word-controls">
                                <button id="submit-word" ${selectedWord.length === 0 || this.gameWon ? 'disabled' : ''}>Submit</button>
                                <button id="reset-word" ${selectedWord.length === 0 || this.gameWon ? 'disabled' : ''}>Reset</button>
                            </div>
                            <div id="word-feedback" class="word-feedback"></div>
                        </div>

                        <div class="found-words-section">
                            <h3>Found Words: ${this.foundWords.length}/${this.validWords.length}</h3>
                        </div>
                    </div>
                </div>
                ${styles}
            </div>
        `;
    }

    handleLetterClick(event) {
        if (!this.isRunning || this.isDragging || this.gameWon) return;

        const cell = event.target.closest('.letter-cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const letter = cell.dataset.letter;

        // Check if this letter is already part of a found word (off-limits)
        if (this.letterColors[row][col] !== null) {
            return; // Ignore clicks on already found letters
        }

        // Check if this letter is already selected
        const existingIndex = this.selectedLetters.findIndex(sel => sel.row === row && sel.col === col);

        if (existingIndex !== -1) {
            // If clicking the last selected letter, remove it (backspace behavior)
            if (existingIndex === this.selectedLetters.length - 1) {
                this.selectedLetters.pop();
                this.updateDisplay();
            }
            // If clicking a letter in the middle, truncate the selection to this point
            else {
                this.selectedLetters = this.selectedLetters.slice(0, existingIndex + 1);
                this.updateDisplay();
            }
        } else {
            // Check adjacency if not the first letter
            if (this.selectedLetters.length > 0) {
                const lastLetter = this.selectedLetters[this.selectedLetters.length - 1];

                // Only allow selection if the new letter is adjacent to the last selected letter
                if (!this.isAdjacent(lastLetter.row, lastLetter.col, row, col)) {
                    // Not adjacent, start a new selection
                    this.selectedLetters = [{ row, col, letter }];
                    this.updateDisplay();
                    return;
                }
            }

            // Add new letter to selection
            this.selectedLetters.push({ row, col, letter });
            this.updateDisplay();
        }
    }

    handleSubmit() {
        if (!this.isRunning || this.selectedLetters.length === 0 || this.gameWon) return;

        // Check for victory conditions first
        const victoryType = this.checkVictoryConditions();
        if (victoryType) {
            this.gameWon = true;
            if (victoryType === 'cheat') {
                this.score += 1000; // Bonus for finding cheat code
            }

            // Update main game score
            if (window.gameApp) {
                window.gameApp.updateScore(this.score);
            }

            this.showVictoryScreen(victoryType);
            return;
        }

        const selectedWord = this.selectedLetters.map(sel => sel.letter).join('');
        const feedback = document.getElementById('word-feedback');

        if (this.validWords.includes(selectedWord.toUpperCase()) && !this.foundWords.includes(selectedWord.toUpperCase())) {
            // Correct word!
            this.foundWords.push(selectedWord.toUpperCase());
            this.score += selectedWord.length * 10; // Score based on word length

            // Color the letters with the next available color
            const currentColor = this.availableColors[this.currentColorIndex];
            for (const letter of this.selectedLetters) {
                this.letterColors[letter.row][letter.col] = currentColor;
            }
            this.currentColorIndex = (this.currentColorIndex + 1) % this.availableColors.length;

            // Update main game score
            if (window.gameApp) {
                window.gameApp.updateScore(this.score);
            }

            // Clear selection
            this.selectedLetters = [];
            this.updateDisplay();

            // Set feedback AFTER updating display so it doesn't get overwritten
            const feedbackAfterUpdate = document.getElementById('word-feedback');
            feedbackAfterUpdate.textContent = 'Correct!';
            feedbackAfterUpdate.className = 'word-feedback correct';

            // Check for normal victory after finding a word
            const normalVictory = this.checkVictoryConditions();
            if (normalVictory === 'normal') {
                this.gameWon = true;
                this.showVictoryScreen('normal');
                return;
            }
        } else {
            // Incorrect or already found
            feedback.textContent = this.foundWords.includes(selectedWord.toUpperCase()) ? 'Already found!' : 'No';
            feedback.className = 'word-feedback incorrect';
        }

        // Clear feedback after 2 seconds
        // Using a new reference to ensure we're manipulating the current DOM element
        setTimeout(() => {
            const currentFeedback = document.getElementById('word-feedback');
            if (currentFeedback) {
                currentFeedback.textContent = '';
                currentFeedback.className = 'word-feedback';
            }
        }, 2000);
    }

    handleReset() {
        if (!this.isRunning || this.gameWon) return;

        this.selectedLetters = [];
        this.updateDisplay();

        const feedback = document.getElementById('word-feedback');
        feedback.textContent = '';
        feedback.className = 'word-feedback';
    }

    updateDisplay() {
        // Re-render the entire game to update the display
        const gameContent = document.getElementById('game-content');
        if (gameContent) {
            gameContent.innerHTML = this.render();
            this.bindEvents();
        }
    }

    bindEvents() {
        // Bind letter click events
        const letterCells = document.querySelectorAll('.letter-cell');
        letterCells.forEach(cell => {
            cell.addEventListener('click', this.handleLetterClick);
            cell.addEventListener('mousedown', this.handleMouseDown);
            cell.addEventListener('mouseenter', this.handleMouseEnter);
        });

        // Bind drag events to document to handle mouse movement outside grid
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);

        // Prevent text selection during drag
        const grid = document.querySelector('.word-search-grid');
        if (grid) {
            grid.addEventListener('selectstart', (e) => e.preventDefault());
        }

        // Bind control button events
        const submitButton = document.getElementById('submit-word');
        const resetButton = document.getElementById('reset-word');

        if (submitButton) {
            submitButton.addEventListener('click', this.handleSubmit);
        }

        if (resetButton) {
            resetButton.addEventListener('click', this.handleReset);
        }
        
        // Bind difficulty button events
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', this.handleDifficultyChange);
        });
    }

    start() {
        this.isRunning = true;

        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.bindEvents();
        }, 100);
    }

    stop() {
        this.isRunning = false;

        // Remove event listeners
        const letterCells = document.querySelectorAll('.letter-cell');
        letterCells.forEach(cell => {
            cell.removeEventListener('click', this.handleLetterClick);
            cell.removeEventListener('mousedown', this.handleMouseDown);
            cell.removeEventListener('mouseenter', this.handleMouseEnter);
        });

        // Remove document-level event listeners
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);

        const submitButton = document.getElementById('submit-word');
        const resetButton = document.getElementById('reset-word');

        if (submitButton) {
            submitButton.removeEventListener('click', this.handleSubmit);
        }

        if (resetButton) {
            resetButton.removeEventListener('click', this.handleReset);
        }
    }

    getScore() {
        return this.score;
    }

    checkVictoryConditions() {
        // Check for cheat code: entire bottom row selected left-to-right
        const bottomRowLength = this.grid[0].length;
        if (this.selectedLetters.length === bottomRowLength) {
            const bottomRowIndex = this.grid.length - 1;
            
            // Check if all selected letters are in bottom row, ordered left-to-right
            const isBottomRowCheat = this.selectedLetters.every((letter, index) => 
                letter.row === bottomRowIndex && letter.col === index
            );
            
            if (isBottomRowCheat) {
                return 'cheat';
            }
        }

        // Check for normal victory: all words found
        if (this.foundWords.length === this.validWords.length) {
            return 'normal';
        }

        return false;
    }

    showVictoryScreen(victoryType) {
        // Update display to show victory state with ghost animation
        this.updateDisplay();
        
        // Set victory message in feedback area
        setTimeout(() => {
            const feedback = document.getElementById('word-feedback');
            if (feedback) {
                feedback.textContent = 'You Win!';
                feedback.className = 'word-feedback correct';
            }
        }, 100);
    }

    resetGame() {
        this.gameWon = false;
        this.selectedLetters = [];
        this.foundWords = [];
        this.score = 0;
        this.currentColorIndex = 0;
        this.isDragging = false;

        // Reset letter colors
        const rows = this.grid.length;
        const cols = this.grid[0]?.length || 0;
        this.letterColors = Array(rows).fill(null).map(() => Array(cols).fill(null));

        // Update main game score
        if (window.gameApp) {
            window.gameApp.updateScore(this.score);
        }

        this.updateDisplay();
    }

    // Mouse event handlers for drag selection
    handleMouseDown(event) {
        if (!this.isRunning || this.gameWon) return;

        const cell = event.target.closest('.letter-cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const letter = cell.dataset.letter;

        // Check if this letter is already part of a found word (off-limits)
        if (this.letterColors[row][col] !== null) {
            return; // Ignore clicks on already found letters
        }

        // Start dragging
        this.isDragging = true;

        // Check if this letter is already selected
        const existingIndex = this.selectedLetters.findIndex(sel => sel.row === row && sel.col === col);

        if (existingIndex !== -1) {
            // If it's already selected, just start dragging from this point
            // Truncate the selection if clicking in the middle of the path
            if (existingIndex < this.selectedLetters.length - 1) {
                this.selectedLetters = this.selectedLetters.slice(0, existingIndex + 1);
                this.updateDisplay();
            }
        } else if (this.selectedLetters.length === 0) {
            // If no existing selection, start fresh with this letter
            this.selectedLetters = [{ row, col, letter }];
            this.updateDisplay();
        } else {
            // Check if the clicked letter is adjacent to the last selected letter
            const lastLetter = this.selectedLetters[this.selectedLetters.length - 1];

            if (this.isAdjacent(lastLetter.row, lastLetter.col, row, col)) {
                // If adjacent, add it to the selection
                this.selectedLetters.push({ row, col, letter });
                this.updateDisplay();
            } else {
                // If not adjacent, start fresh with this letter
                this.selectedLetters = [{ row, col, letter }];
                this.updateDisplay();
            }
        }

        // Prevent default to avoid text selection during drag
        event.preventDefault();
    }

    handleMouseMove(event) {
        // Just prevent text selection during drag
        if (this.isDragging) {
            event.preventDefault();
        }
    }

    handleMouseUp(event) {
        // End dragging
        this.isDragging = false;
    }

    handleMouseEnter(event) {
        if (!this.isRunning || !this.isDragging || this.gameWon) return;

        const cell = event.target.closest('.letter-cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const letter = cell.dataset.letter;

        // Check if this letter is already part of a found word (off-limits)
        if (this.letterColors[row][col] !== null) {
            return; // Ignore drags over already found letters
        }

        // If no letters selected yet (safety check), add this one
        if (this.selectedLetters.length === 0) {
            this.selectedLetters.push({ row, col, letter });
            this.updateDisplay();
            return;
        }

        // Check if this cell is the second-to-last in our selection (backtracking)
        if (this.selectedLetters.length >= 2) {
            const secondToLastLetter = this.selectedLetters[this.selectedLetters.length - 2];
            if (row === secondToLastLetter.row && col === secondToLastLetter.col) {
                // Backtracking: Remove the last letter
                this.selectedLetters.pop();
                this.updateDisplay();
                return;
            }
        }

        // Check if this letter is already in the selection
        const existingIndex = this.selectedLetters.findIndex(sel => sel.row === row && sel.col === col);
        if (existingIndex !== -1) {
            // If it's already in the path (but not the second-to-last letter),
            // truncate the selection to this point if it's not at the end
            if (existingIndex < this.selectedLetters.length - 1) {
                this.selectedLetters = this.selectedLetters.slice(0, existingIndex + 1);
                this.updateDisplay();
            }
            return;
        }

        // Check adjacency to the last selected letter
        const lastLetter = this.selectedLetters[this.selectedLetters.length - 1];
        if (!this.isAdjacent(lastLetter.row, lastLetter.col, row, col)) {
            return; // Not adjacent, ignore selection
        }

        // Add new letter to selection
        this.selectedLetters.push({ row, col, letter });
        this.updateDisplay();
    }

    getDefaultPuzzle() {
        // Get puzzle based on current difficulty
        const puzzles = this.getPuzzleData();
        return puzzles[this.currentDifficulty] || puzzles.easy;
    }
}