#!/bin/bash

# Check if all filenames in JSON match actual files
echo "Checking for missing or mismatched files..."

# Extract all filenames from JSON (just the basenames)
grep '"filename":' json/witchesImages.json | cut -d'"' -f4 | while read basename; do
    # Check in 124sized folder
    file124="assets/124sized/${basename}_124.png"
    if [ ! -f "$file124" ]; then
        echo "MISSING: $file124"
    fi
done

echo "Check complete!"
