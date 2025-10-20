README

for Halloween game 2025

john calls folder halloween2025

tristan is on board.




# 🎃 Halloween Minigames 🎃

A collection of spooky Halloween-themed minigames built with vanilla HTML, CSS, and JavaScript.

## Project Goals

- Maintain a 1280x720 centered game area with responsive design
- Showcase 5 different minigames in a unified interface

## Games Included

TBD

## 🚀 Development Setup

### Local Development

1. **Clone or download** the project files to your local machine

2. **Navigate to the project directory**:

   ```bash
   cd halloween
   ```

3. **Start a local web server**:

   ```bash
   python3 -m http.server 8000
   ```

4. **Open your browser** and visit:

   ```
   http://localhost:8000
   ```

5. **Start developing!** Edit files and refresh the browser to see changes.

## 🔍 Word Haunt Puzzle Validation

The Word Haunt game includes a validation tool to ensure puzzle integrity. Each word in the puzzle should appear exactly once in the grid.

### Running the Validator

```bash
# Validate the easy puzzle (default)
npm run validate-word-haunt easy

# Validate the medium puzzle
npm run validate-word-haunt medium

# Validate the hard puzzle
npm run validate-word-haunt hard
```

### Validation Results

- ✅ **GOOD** - All words found exactly once
- ⚠️ **NEEDS REVIEW** - One or more words found 0 or multiple times

The validator shows:
- How many times each word appears in the grid
- Summary of validation results
- Grid dimensions and word count

### Example Output

```
=== WORD HAUNT PUZZLE VALIDATION ===
Puzzle: Spotted on Halloween night...
Grid size: 5x8
Target words: 6

=== INDIVIDUAL WORD VALIDATION ===
word BUZZ found 1 time(s)
word ELSA found 3 time(s)
word FIREFIGHTER found 1 time(s)
...

Validation result: NEEDS REVIEW ⚠️
```

## GitHub Pages Deployment

This project is designed to work seamlessly with GitHub Pages:

1. **Push to GitHub**: Upload all files to a GitHub repository
2. **Enable Pages**: Go to repository Settings → Pages
3. **Select source**: Choose "Deploy from a branch" and select your main branch
4. **Access your site**: GitHub will provide a URL like `https://username.github.io/repository-name`

## License

This project is open source and available under the MIT License. Feel free to fork, modify, and create your own spooky games!
