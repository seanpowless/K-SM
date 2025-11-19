#!/usr/bin/env python3
"""
Generate placeholder PNG icons for Sovereignty Monitor extension
Creates simple colored squares that can be replaced with proper icons later
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple shield-style icon"""
    # Create image with dark background
    img = Image.new('RGB', (size, size), color='#1e1e1e')
    draw = ImageDraw.Draw(img)

    # Draw shield outline
    padding = size // 8
    shield_points = [
        (size // 2, padding),                    # Top center
        (size - padding, padding * 2),           # Top right
        (size - padding, size // 2),             # Middle right
        (size // 2, size - padding),             # Bottom center
        (padding, size // 2),                    # Middle left
        (padding, padding * 2),                  # Top left
    ]

    # Draw shield fill
    draw.polygon(shield_points, fill='#667eea', outline='#667eea')

    # Draw block symbol (red slash)
    line_width = max(2, size // 16)
    draw.line(
        [(padding * 2, size - padding * 2), (size - padding * 2, padding * 2)],
        fill='#dc2626',
        width=line_width
    )

    # Save
    img.save(filename, 'PNG')
    print(f'✓ Created {filename} ({size}x{size})')

def main():
    """Generate all required icon sizes"""
    print("Generating Sovereignty Monitor icons...")
    print("")

    try:
        create_icon(16, 'icon16.png')
        create_icon(48, 'icon48.png')
        create_icon(128, 'icon128.png')
        print("")
        print("✓ All icons generated successfully!")
        print("")
        print("Note: These are simple placeholder icons.")
        print("For production, consider using the SVG to create higher quality icons.")
    except ImportError:
        print("Error: PIL/Pillow is not installed.")
        print("Install it with: pip install Pillow")
        print("")
        print("Alternatively, use the SVG file with an online converter.")
        return 1

    return 0

if __name__ == '__main__':
    exit(main())
