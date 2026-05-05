#!/usr/bin/env python3
"""
Generate Image List for Gallery
===============================
Creates a JavaScript array of all images from the converted folder
"""

from pathlib import Path
import json

def generate_image_list():
    converted_dir = Path('assets/images/gallery/converted')
    
    if not converted_dir.exists():
        print("❌ Converted directory not found!")
        return
    
    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    images = []
    
    for ext in image_extensions:
        images.extend(converted_dir.glob(f'*{ext}'))
        images.extend(converted_dir.glob(f'*{ext.upper()}'))
    
    # Extract just the filenames
    image_names = [img.name for img in sorted(images)]
    
    print(f"📸 Found {len(image_names)} images")
    
    # Generate JavaScript array
    js_array = "const ACTUAL_IMAGES = [\n"
    for img in image_names:
        js_array += f"  '{img}',\n"
    js_array += "];"
    
    # Write to file
    with open('image_list.js', 'w', encoding='utf-8') as f:
        f.write(js_array)
    
    print(f"✅ Generated image_list.js with {len(image_names)} images")
    
    # Also print first few for verification
    print("\n📋 First 10 images:")
    for img in image_names[:10]:
        print(f"   {img}")

if __name__ == '__main__':
    generate_image_list()