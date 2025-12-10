#!/usr/bin/env python3
from pathlib import Path
import sys

# Force output
sys.stdout.reconfigure(line_buffering=True)

converted_dir = Path('assets/images/gallery/converted')

# Get all image files
jpg_files = list(converted_dir.glob('*.jpg'))
png_files = list(converted_dir.glob('*.png')) + list(converted_dir.glob('*.PNG'))
all_images = sorted(jpg_files + png_files)

print(f"Found {len(all_images)} total images", flush=True)
print(f"  - JPG: {len(jpg_files)}", flush=True)
print(f"  - PNG: {len(png_files)}", flush=True)

# Now run the actual generation
exec(open('generate_gallery.py').read())
