#!/bin/bash

# Icon generation script for Sovereignty Monitor
# Requires ImageMagick or Inkscape

echo "Sovereignty Monitor - Icon Generator"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "icon.svg" ]; then
    echo "Error: icon.svg not found. Please run this script from the icons directory."
    exit 1
fi

# Function to generate with ImageMagick
generate_with_imagemagick() {
    echo "Using ImageMagick to generate icons..."
    convert icon.svg -resize 16x16 -background none icon16.png
    convert icon.svg -resize 48x48 -background none icon48.png
    convert icon.svg -resize 128x128 -background none icon128.png
    echo "✓ Icons generated successfully with ImageMagick"
}

# Function to generate with Inkscape
generate_with_inkscape() {
    echo "Using Inkscape to generate icons..."
    inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
    inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
    inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
    echo "✓ Icons generated successfully with Inkscape"
}

# Function to generate placeholders
generate_placeholders() {
    echo "Generating colored placeholder icons..."
    convert -size 16x16 xc:#667eea icon16.png
    convert -size 48x48 xc:#667eea icon48.png
    convert -size 128x128 xc:#667eea icon128.png
    echo "⚠ Generated placeholder icons (colored squares)"
    echo "  For better icons, install ImageMagick or Inkscape and run again."
}

# Try to find a suitable tool
if command -v convert &> /dev/null; then
    generate_with_imagemagick
elif command -v inkscape &> /dev/null; then
    generate_with_inkscape
elif command -v magick &> /dev/null; then
    # Windows ImageMagick uses 'magick' command
    echo "Using ImageMagick (Windows) to generate icons..."
    magick icon.svg -resize 16x16 -background none icon16.png
    magick icon.svg -resize 48x48 -background none icon48.png
    magick icon.svg -resize 128x128 -background none icon128.png
    echo "✓ Icons generated successfully with ImageMagick"
else
    echo "⚠ Neither ImageMagick nor Inkscape found."
    echo "  Attempting to generate simple placeholders..."
    if command -v convert &> /dev/null || command -v magick &> /dev/null; then
        generate_placeholders
    else
        echo ""
        echo "Unable to generate icons automatically."
        echo ""
        echo "Please install one of the following:"
        echo "  - ImageMagick: https://imagemagick.org/"
        echo "  - Inkscape: https://inkscape.org/"
        echo ""
        echo "Or manually convert icon.svg to PNG files using an online tool."
        exit 1
    fi
fi

echo ""
echo "Generated files:"
ls -lh icon*.png 2>/dev/null || echo "No PNG files found"
echo ""
echo "Done! Your extension icons are ready."
