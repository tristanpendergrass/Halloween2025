#!/usr/bin/env python3
"""
Resize Witch Images Script

This script resizes all PNG images from the witches folder into three standard sizes:
- 166x166 pixels (saved to 166sized folder with _166 suffix)
- 124x124 pixels (saved to 124sized folder with _124 suffix)
- 99x99 pixels (saved to 99sized folder with _99 suffix)

The images will be stretched/squashed to fit the square dimensions.
"""

from PIL import Image
import os
from pathlib import Path


def resize_images():
    """
    Main function to resize all witch images to all three target sizes.
    """
    # Define folder paths (relative to python subfolder)
    source_folder = Path("../assets")
    folder_166 = Path("../assets/166sized")
    folder_124 = Path("../assets/124sized")
    folder_99 = Path("../assets/99sized")

    # Get all PNG files from source folder
    png_files = list(source_folder.glob("*.png"))
    total_files = len(png_files)

    print(f"Found {total_files} PNG files to process")
    print("-" * 50)

    # Counter for successful conversions
    success_count = 0

    # Process each image
    for index, png_file in enumerate(png_files, 1):
        try:
            # Open the original image
            img = Image.open(png_file)

            # Get the base filename without extension
            base_name = png_file.stem  # e.g., "Elphaba(Broadway_Oz)01"

            # Create 166x166 version
            img_166 = img.resize((166, 166), Image.Resampling.LANCZOS)
            output_166 = folder_166 / f"{base_name}_166.png"
            img_166.save(output_166, "PNG")

            # Create 124x124 version
            img_124 = img.resize((124, 124), Image.Resampling.LANCZOS)
            output_124 = folder_124 / f"{base_name}_124.png"
            img_124.save(output_124, "PNG")

            # Create 99x99 version
            img_99 = img.resize((99, 99), Image.Resampling.LANCZOS)
            output_99 = folder_99 / f"{base_name}_99.png"
            img_99.save(output_99, "PNG")

            # Print progress
            print(f"[{index}/{total_files}] Processed: {png_file.name}")

            success_count += 1

        except Exception as e:
            print(f"[{index}/{total_files}] ERROR processing {png_file.name}: {e}")

    # Summary
    print("-" * 50)
    print(f"Completed: {success_count}/{total_files} images successfully resized")
    print(f"Output: {success_count} images in 166sized folder")
    print(f"Output: {success_count} images in 124sized folder")
    print(f"Output: {success_count} images in 99sized folder")


if __name__ == "__main__":
    print("=" * 50)
    print("Witch Image Resizer")
    print("=" * 50)
    resize_images()
    print("\nDone!")
