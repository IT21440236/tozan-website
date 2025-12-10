#!/usr/bin/env python3
import sys
sys.path.insert(0, '.')

# Import and run the generate function
from generate_gallery import generate_gallery_html

print("Starting gallery generation...")
generate_gallery_html()
print("Done!")
