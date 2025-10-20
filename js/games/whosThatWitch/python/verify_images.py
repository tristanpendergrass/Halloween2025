#!/usr/bin/env python3
"""
Image Verification Script

This script verifies that all images listed in witchesImages.json:
1. Actually exist in the correct folders
2. Have the correct dimensions (99x99, 124x124, or 166x166)

It reports any missing files or incorrectly sized images.
"""

import json
from pathlib import Path
from PIL import Image


def verify_images():
    """
    Main verification function that checks all images in the database.
    """
    # Load the JSON file
    json_path = Path("../json/witchesImages.json")

    print("=" * 70)
    print("WITCH IMAGE VERIFICATION")
    print("=" * 70)
    print()

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Could not find {json_path}")
        return
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON format: {e}")
        return

    witch_images = data.get('witchImages', {})

    # Counters
    total_entries = 0
    total_files_checked = 0
    missing_files = []
    wrong_size_files = []
    correct_files = 0

    # Expected sizes for each path type
    size_map = {
        '99sized': (99, 99),
        '124sized': (124, 124),
        '166sized': (166, 166)
    }

    suffix_map = {
        '99sized': '_99.png',
        '124sized': '_124.png',
        '166sized': '_166.png'
    }

    # Iterate through all characters
    for character_name, images in witch_images.items():
        print(f"Checking: {character_name}")

        for image_entry in images:
            total_entries += 1
            filename_base = image_entry['filename']

            # Check each of the three sizes (easy, medium, hard)
            for path_key in ['easy_path', 'medium_path', 'hard_path']:
                folder_name = image_entry[path_key]
                expected_size = size_map.get(folder_name)
                suffix = suffix_map.get(folder_name)

                if not expected_size or not suffix:
                    print(f"  WARNING: Unknown folder '{folder_name}' for {filename_base}")
                    continue

                # Build the full file path
                file_path = Path(f"../assets/{folder_name}/{filename_base}{suffix}")
                total_files_checked += 1

                # Check if file exists
                if not file_path.exists():
                    missing_files.append({
                        'character': character_name,
                        'file': str(file_path),
                        'size': folder_name
                    })
                    print(f"  ❌ MISSING: {file_path}")
                    continue

                # Check image dimensions
                try:
                    with Image.open(file_path) as img:
                        actual_size = img.size  # (width, height)

                        if actual_size == expected_size:
                            correct_files += 1
                            print(f"  ✓ OK: {folder_name}/{filename_base}{suffix} = {actual_size}")
                        else:
                            wrong_size_files.append({
                                'character': character_name,
                                'file': str(file_path),
                                'expected': expected_size,
                                'actual': actual_size
                            })
                            print(f"  ❌ WRONG SIZE: {file_path}")
                            print(f"     Expected: {expected_size}, Got: {actual_size}")

                except Exception as e:
                    print(f"  ❌ ERROR reading {file_path}: {e}")

        print()  # Blank line between characters

    # Summary Report
    print("=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    print(f"Total character entries:    {total_entries}")
    print(f"Total files checked:        {total_files_checked}")
    print(f"✓ Correct files:            {correct_files}")
    print(f"❌ Missing files:            {len(missing_files)}")
    print(f"❌ Wrong size files:         {len(wrong_size_files)}")
    print()

    # Detailed error reports
    if missing_files:
        print("MISSING FILES DETAILS:")
        print("-" * 70)
        for item in missing_files:
            print(f"  Character: {item['character']}")
            print(f"  File:      {item['file']}")
            print(f"  Size:      {item['size']}")
            print()

    if wrong_size_files:
        print("WRONG SIZE FILES DETAILS:")
        print("-" * 70)
        for item in wrong_size_files:
            print(f"  Character: {item['character']}")
            print(f"  File:      {item['file']}")
            print(f"  Expected:  {item['expected']}")
            print(f"  Actual:    {item['actual']}")
            print()

    # Final verdict
    if len(missing_files) == 0 and len(wrong_size_files) == 0:
        print("=" * 70)
        print("✓✓✓ ALL IMAGES VERIFIED SUCCESSFULLY! ✓✓✓")
        print("=" * 70)
    else:
        print("=" * 70)
        print("❌ VERIFICATION FAILED - ERRORS FOUND ❌")
        print("=" * 70)


if __name__ == "__main__":
    verify_images()
