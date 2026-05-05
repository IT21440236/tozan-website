#!/usr/bin/env python3
"""
HEIC to JPG Converter
=====================
This script converts all HEIC images in a directory to JPG format.

Usage:
    python convert_heic_to_jpg.py

Requirements:
    pip install pillow pillow-heif
"""

import os
import sys
from pathlib import Path
from PIL import Image
import pillow_heif

def convert_heic_to_jpg(input_dir, output_dir, quality=95):
    """
    Convert all HEIC images in input_dir to JPG format in output_dir.
    
    Args:
        input_dir (str): Directory containing HEIC images
        output_dir (str): Directory to save converted JPG images
        quality (int): JPG quality (1-100, default 95)
    """
    # Register HEIF opener with Pillow
    pillow_heif.register_heif_opener()
    
    # Create input and output paths
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Check if input directory exists
    if not input_path.exists():
        print(f"❌ Error: Input directory '{input_dir}' does not exist!")
        return
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {output_path.absolute()}")
    
    # Find all HEIC files (case-insensitive)
    heic_files = []
    for ext in ['*.heic', '*.HEIC', '*.heif', '*.HEIF']:
        heic_files.extend(input_path.glob(ext))
    
    if not heic_files:
        print(f"⚠️  No HEIC files found in '{input_dir}'")
        return
    
    print(f"\n🔍 Found {len(heic_files)} HEIC file(s) to convert\n")
    
    # Convert each HEIC file
    converted_count = 0
    failed_count = 0
    
    for heic_file in heic_files:
        try:
            # Generate output filename
            output_filename = heic_file.stem + '.jpg'
            output_file = output_path / output_filename
            
            print(f"🔄 Converting: {heic_file.name} → {output_filename}")
            
            # Open HEIC image
            image = Image.open(heic_file)
            
            # Convert to RGB if necessary (HEIC can have different color modes)
            if image.mode not in ('RGB', 'L'):
                image = image.convert('RGB')
            
            # Save as JPG
            image.save(output_file, 'JPEG', quality=quality, optimize=True)
            
            # Get file sizes for comparison
            input_size = heic_file.stat().st_size / 1024  # KB
            output_size = output_file.stat().st_size / 1024  # KB
            
            print(f"   ✅ Success! ({input_size:.1f} KB → {output_size:.1f} KB)")
            converted_count += 1
            
        except Exception as e:
            print(f"   ❌ Failed: {str(e)}")
            failed_count += 1
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 Conversion Summary:")
    print(f"   ✅ Successfully converted: {converted_count}")
    if failed_count > 0:
        print(f"   ❌ Failed: {failed_count}")
    print(f"   📁 Output location: {output_path.absolute()}")
    print(f"{'='*60}\n")


def main():
    """Main function to run the converter."""
    print("\n" + "="*60)
    print("🖼️  HEIC to JPG Converter")
    print("="*60 + "\n")
    
    # Fixed directories - no user input needed
    input_dir = "assets/images/gallery"
    output_dir = "assets/images/gallery/converted"
    quality = 95
    
    print(f"📂 Input directory: {input_dir}")
    print(f"📁 Output directory: {output_dir}")
    print(f"🎨 Quality: {quality}")
    print()
    
    # Run conversion
    convert_heic_to_jpg(input_dir, output_dir, quality)
    
    print("✨ Conversion complete!")
    print("\nPress Enter to exit...")
    input()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Conversion cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)
