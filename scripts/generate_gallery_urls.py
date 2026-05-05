#!/usr/bin/env python3
"""
Generate gallery URLs from image_list.js for the new gallery.html
"""

import json
import re

# Base URL for Cloudflare R2
BASE_URL = "https://pub-b6d85dc4453b487d879f35b1669c3da2.r2.dev/images/"

# Read the image list from image_list.js
with open('image_list.js', 'r') as f:
    content = f.read()

# Extract the array content using regex
array_match = re.search(r'const ACTUAL_IMAGES = \[(.*?)\];', content, re.DOTALL)
if array_match:
    array_content = array_match.group(1)
    # Parse the JavaScript array
    images = []
    for line in array_content.split('\n'):
        line = line.strip()
        if line.startswith("'") and line.endswith("',"):
            image_name = line[1:-2]  # Remove quotes and comma
            images.append(image_name)
        elif line.startswith("'") and line.endswith("'"):
            image_name = line[1:-1]  # Remove quotes
            images.append(image_name)

# Remove duplicates while preserving order
unique_images = []
seen = set()
for img in images:
    if img not in seen:
        unique_images.append(img)
        seen.add(img)

# Categorize images for better organization
categories = {
    'Members & Group Photos': [],
    'Head Temple & Premises': [],
    'Mount Fuji Views': [],
    'Hotels & Accommodation': [],
    'Travel & Journey': [],
    'Temple Activities': [],
    'Local Places & Food': [],
    'Ceremony & Special Events': []
}

for img in unique_images:
    img_lower = img.lower()
    
    if any(keyword in img_lower for keyword in ['members-', 'member-']):
        if 'ceremony' in img_lower:
            categories['Ceremony & Special Events'].append(img)
        else:
            categories['Members & Group Photos'].append(img)
    elif any(keyword in img_lower for keyword in ['headtemple-', 'head-temple-', 'temple-premises-', 'temple-', 'tokohibo-', 'seikado-', 'treasury-hall-', 'salmon-gate-', 'pagoda-']):
        categories['Head Temple & Premises'].append(img)
    elif 'mount-fuji' in img_lower or 'fuji-' in img_lower:
        categories['Mount Fuji Views'].append(img)
    elif any(keyword in img_lower for keyword in ['hotel-', 'fujiyen-']):
        categories['Hotels & Accommodation'].append(img)
    elif any(keyword in img_lower for keyword in ['hongkong-', 'narita-', 'cathay-', 'cx-', 'airport']):
        categories['Travel & Journey'].append(img)
    elif any(keyword in img_lower for keyword in ['gokai-', 'map-', 'butsugu-']):
        categories['Temple Activities'].append(img)
    elif any(keyword in img_lower for keyword in ['ceremony-day-']):
        categories['Ceremony & Special Events'].append(img)
    else:
        categories['Local Places & Food'].append(img)

# Generate HTML for each category
html_sections = []

for category, images in categories.items():
    if not images:
        continue
        
    html_sections.append(f'''
    <!-- {category} -->
    <div class="gallery-category" id="{category.lower().replace(' ', '-').replace('&', 'and')}">
      <h3 class="category-title">
        <i class="bi bi-collection"></i> {category}
        <span class="photo-count">({len(images)} photos)</span>
      </h3>
      <div class="gallery-grid">''')
    
    for img in images:
        # Create a nice alt text from filename
        alt_text = img.replace('-', ' ').replace('.jpg', '').replace('.PNG', '').title()
        
        html_sections.append(f'''        <div class="gallery-item">
          <a href="{BASE_URL}{img}" class="glightbox" data-gallery="{category.lower().replace(' ', '-')}">
            <img src="{BASE_URL}{img}" alt="{alt_text}" loading="lazy" />
            <div class="gallery-overlay">
              <i class="bi bi-zoom-in"></i>
            </div>
          </a>
        </div>''')
    
    html_sections.append('''      </div>
    </div>''')

# Write the HTML sections to a file
with open('gallery_sections.html', 'w') as f:
    f.write('\n'.join(html_sections))

print(f"Generated gallery HTML for {len(unique_images)} unique images across {len([c for c in categories.values() if c])} categories")
print("Output saved to gallery_sections.html")

# Also create a summary
print("\nCategory Summary:")
for category, images in categories.items():
    if images:
        print(f"  {category}: {len(images)} photos")