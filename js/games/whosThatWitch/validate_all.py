#!/usr/bin/env python3
"""
Validate all image entries in witchesImages.json against actual files
"""

import json
import os
from pathlib import Path

# Paths
JSON_FILE = "json/witchesImages.json"
ASSETS_DIR = "assets"

# Load JSON
with open(JSON_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

witch_images = data['witchImages']

print("=" * 70)
print("VALIDATING IMAGE PATHS")
print("=" * 70)

total_entries = 0
missing_files = []
found_files = 0

# Check each character
for character_name, images_array in witch_images.items():
    print(f"\nCharacter: {character_name} ({len(images_array)} images)")

    for img_data in images_array:
        total_entries += 1
        filename = img_data['filename']
        group = img_data['group']

        # Check all three sizes
        sizes = [
            ('99sized', 99),
            ('124sized', 124),
            ('166sized', 166)
        ]

        all_exist = True
        for folder, size in sizes:
            expected_path = f"{ASSETS_DIR}/{folder}/{filename}_{size}.png"

            if os.path.exists(expected_path):
                found_files += 1
            else:
                all_exist = False
                missing_files.append({
                    'character': character_name,
                    'filename': filename,
                    'group': group,
                    'missing_path': expected_path
                })
                print(f"  ✗ MISSING: {expected_path}")

        if all_exist:
            print(f"  ✓ {filename} (group {group})")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Total JSON entries: {total_entries}")
print(f"Expected files (3 sizes each): {total_entries * 3}")
print(f"Found files: {found_files}")
print(f"Missing files: {len(missing_files)}")

if missing_files:
    print("\n" + "=" * 70)
    print("MISSING FILES DETAIL")
    print("=" * 70)
    for item in missing_files:
        print(f"\nCharacter: {item['character']}")
        print(f"  Filename: {item['filename']}")
        print(f"  Group: {item['group']}")
        print(f"  Missing: {item['missing_path']}")

# Check for extra files in asset folders
print("\n" + "=" * 70)
print("CHECKING FOR UNLISTED FILES IN ASSET FOLDERS")
print("=" * 70)

# Get all filenames from JSON
json_filenames = set()
for character_name, images_array in witch_images.items():
    for img_data in images_array:
        filename = img_data['filename']
        for size in [99, 124, 166]:
            json_filenames.add(f"{filename}_{size}.png")

# Add bomb tiles as expected
json_filenames.add("_bombTile_99.png")
json_filenames.add("_bombTile_124.png")
json_filenames.add("_bombTile_166.png")

# Check each folder
for folder in ['99sized', '124sized', '166sized']:
    folder_path = f"{ASSETS_DIR}/{folder}"
    if os.path.exists(folder_path):
        actual_files = set(os.listdir(folder_path))
        extra_files = actual_files - json_filenames

        if extra_files:
            print(f"\nExtra files in {folder}:")
            for f in sorted(extra_files):
                print(f"  - {f}")
        else:
            print(f"\n{folder}: All files accounted for ✓")

print("\n" + "=" * 70)
print("VALIDATION COMPLETE")
print("=" * 70)
