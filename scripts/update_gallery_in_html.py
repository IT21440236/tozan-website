#!/usr/bin/env python3
"""
Update Gallery in index.html
=============================
Replaces the gallery section in index.html with generated gallery.
"""

def update_gallery():
    # Read the generated gallery HTML
    with open('gallery_generated.html', 'r', encoding='utf-8') as f:
        gallery_html = f.read()
    
    # Read the current index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Find the gallery section markers
    start_marker = '<div class="gallery-filters mb-4'
    end_marker = '</div>\n    </div>\n  </section>\n\n  <!-- Visa Information Section -->'
    
    start_idx = html_content.find(start_marker)
    end_idx = html_content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        print("❌ Could not find gallery section markers!")
        return False
    
    # Replace the gallery content
    new_html = (
        html_content[:start_idx] +
        gallery_html +
        '\n      </div>\n    </div>\n  </section>\n\n  <!-- Visa Information Section -->' +
        html_content[end_idx + len(end_marker):]
    )
    
    # Write back to index.html
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    print("✅ Gallery section updated successfully!")
    print(f"📸 Added 134 images organized into 7 categories")
    return True

if __name__ == '__main__':
    try:
        if update_gallery():
            print("\n🎉 Gallery is now beautiful and immersive!")
            print("   Refresh your browser to see the changes!")
    except Exception as e:
        print(f"❌ Error: {e}")
