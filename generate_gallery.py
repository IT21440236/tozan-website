#!/usr/bin/env python3
"""
Gallery HTML Generator
======================
Automatically generates gallery HTML from converted images.
"""

from pathlib import Path

# Image categories based on filename patterns
CATEGORIES = {
    'members': {
        'name': 'Group Members',
        'icon': 'people-fill',
        'patterns': ['members-', 'member-']
    },
    'temple': {
        'name': 'Temple & Premises',
        'icon': 'building',
        'patterns': ['temple-', 'head-temple-', 'salmon-gate-']
    },
    'fuji': {
        'name': 'Mount Fuji',
        'icon': 'mountain',
        'patterns': ['mount-fuji-', 'fuji-']
    },
    'travel': {
        'name': 'Journey & Travel',
        'icon': 'airplane',
        'patterns': ['cathay-', 'hongkong-', 'narita-', 'airport', 'CX-', 'wagon-']
    },
    'accommodation': {
        'name': 'Hotel & Dining',
        'icon': 'house-heart',
        'patterns': ['fujiyen-hotel', 'dinner-', 'meal-', 'food']
    },
    'local': {
        'name': 'Local Sights',
        'icon': 'geo-alt',
        'patterns': ['fujinomiya-', 'waterfall', 'vending', 'streets']
    },
    'misc': {
        'name': 'Other Moments',
        'icon': 'camera',
        'patterns': []  # Catch-all
    }
}

def categorize_image(filename):
    """Determine category based on filename."""
    filename_lower = filename.lower()
    
    for cat_id, cat_info in CATEGORIES.items():
        if cat_id == 'misc':
            continue
        for pattern in cat_info['patterns']:
            if pattern in filename_lower:
                return cat_id
    
    return 'misc'

def generate_gallery_html():
    """Generate gallery HTML from converted images."""
    
    converted_dir = Path('assets/images/gallery/converted')
    
    if not converted_dir.exists():
        print("❌ Converted directory not found!")
        return
    
    # Get all JPG files
    images = sorted(converted_dir.glob('*.jpg'))
    
    if not images:
        print("❌ No images found!")
        return
    
    print(f"📸 Found {len(images)} images")
    
    # Categorize images
    categorized = {cat: [] for cat in CATEGORIES.keys()}
    
    for img in images:
        category = categorize_image(img.name)
        categorized[category].append(img)
    
    # Generate HTML
    html_parts = []
    
    # Add filter buttons
    html_parts.append('''      <div class="gallery-filters mb-4 text-center">
        <button class="btn btn-outline-primary active" data-filter="all">
          <i class="bi bi-grid-3x3"></i> All ({})
        </button>'''.format(len(images)))
    
    for cat_id, cat_info in CATEGORIES.items():
        count = len(categorized[cat_id])
        if count > 0:
            html_parts.append('''        <button class="btn btn-outline-primary" data-filter="{}">
          <i class="bi bi-{}"></i> {} ({})
        </button>'''.format(cat_id, cat_info['icon'], cat_info['name'], count))
    
    html_parts.append('      </div>\n')
    
    # Add gallery grid
    html_parts.append('      <div class="gallery-grid">\n')
    
    # Add images
    for cat_id in CATEGORIES.keys():
        for img in categorized[cat_id]:
            # Create nice alt text from filename
            alt_text = img.stem.replace('-', ' ').replace('_', ' ').title()
            
            html_parts.append('''        <div class="gallery-item" data-category="{}">
          <a href="{}" class="glightbox" data-gallery="tozan-gallery">
            <img src="{}" alt="{}" loading="lazy" />
            <div class="gallery-overlay">
              <i class="bi bi-zoom-in"></i>
            </div>
          </a>
        </div>\n'''.format(cat_id, img.as_posix(), img.as_posix(), alt_text))
    
    html_parts.append('      </div>')
    
    # Write to file
    output_file = 'gallery_generated.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(html_parts))
    
    print(f"\n✅ Gallery HTML generated: {output_file}")
    print(f"\n📊 Category breakdown:")
    for cat_id, cat_info in CATEGORIES.items():
        count = len(categorized[cat_id])
        if count > 0:
            print(f"   {cat_info['name']}: {count} images")

if __name__ == '__main__':
    generate_gallery_html()
