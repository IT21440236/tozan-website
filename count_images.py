from pathlib import Path

converted_dir = Path('assets/images/gallery/converted')

if not converted_dir.exists():
    print(f"Directory does not exist: {converted_dir}")
    exit(1)

jpg_files = sorted(converted_dir.glob('*.jpg'))
png_files = sorted(list(converted_dir.glob('*.png')) + list(converted_dir.glob('*.PNG')))

print(f"\n=== Image Count ===")
print(f"JPG files: {len(jpg_files)}")
print(f"PNG files: {len(png_files)}")
print(f"Total: {len(jpg_files) + len(png_files)}")

if png_files:
    print(f"\n=== PNG Files ===")
    for f in png_files:
        print(f"  {f.name}")

# Show some new files
all_files = sorted(jpg_files + png_files)
print(f"\n=== Sample of all files (first 10) ===")
for f in all_files[:10]:
    print(f"  {f.name}")
