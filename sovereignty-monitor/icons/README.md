# Icons Directory

This directory contains the extension icons.

## Icon Files Needed

The extension requires three icon sizes:
- `icon16.png` - 16x16 pixels (toolbar)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Generating Icons from SVG

You can generate the required PNG icons from the provided `icon.svg` file.

### Using ImageMagick (Linux/Mac/Windows)

```bash
# Install ImageMagick if needed
# Ubuntu/Debian: sudo apt-get install imagemagick
# Mac: brew install imagemagick
# Windows: Download from https://imagemagick.org/

# Generate icons
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Using Inkscape (Linux/Mac/Windows)

```bash
inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

### Using Online Tools

1. Open https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set output size to 16x16, convert, and download as `icon16.png`
4. Repeat for 48x48 and 128x128

### Quick Setup Script

Run the provided `generate-icons.sh` script:

```bash
cd icons
chmod +x generate-icons.sh
./generate-icons.sh
```

## Placeholder Icons

For testing purposes, you can create simple colored square placeholders:

```bash
# Red placeholders (requires ImageMagick)
convert -size 16x16 xc:#dc2626 icon16.png
convert -size 48x48 xc:#dc2626 icon48.png
convert -size 128x128 xc:#dc2626 icon128.png
```

## Design Notes

The shield icon represents:
- Digital sovereignty and protection
- Privacy monitoring
- Blocking unwanted requests
- User control and security

Colors:
- Primary: `#667eea` (blue/purple) - Security
- Accent: `#dc2626` (red) - Blocking/Alert
- Background: `#1e1e1e` (dark) - Modern UI
