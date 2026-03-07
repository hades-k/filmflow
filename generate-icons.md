# How to Generate PWA Icons

You need to replace the placeholder icons with actual PNG images.

## Required Sizes

- `public/icon-192.png` - 192x192 pixels
- `public/icon-512.png` - 512x512 pixels

## Option 1: Use Online Tools

### PWA Asset Generator (Recommended)
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload a square image (at least 512x512)
3. Download the generated icons
4. Copy `icon-192.png` and `icon-512.png` to `public/` folder

### RealFaviconGenerator
1. Visit: https://realfavicongenerator.net/
2. Upload your logo/icon
3. Configure PWA settings
4. Download and extract
5. Copy the required icons to `public/` folder

## Option 2: Use ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# From a source image (e.g., logo.png)
convert logo.png -resize 192x192 public/icon-192.png
convert logo.png -resize 512x512 public/icon-512.png
```

## Option 3: Use Design Tools

### Figma
1. Create a 512x512 frame
2. Design your icon
3. Export as PNG at 1x (512x512) and save as `icon-512.png`
4. Export at 0.375x (192x192) and save as `icon-192.png`

### Photoshop/GIMP
1. Create a new 512x512 image
2. Design your icon
3. Save as `icon-512.png`
4. Resize to 192x192
5. Save as `icon-192.png`

## Icon Design Tips

- Use a simple, recognizable design
- Ensure good contrast
- Test on both light and dark backgrounds
- Avoid text (it becomes unreadable at small sizes)
- Use a square canvas with some padding
- Consider using the film reel or camera icon theme
- Make it memorable and unique

## Quick Placeholder

If you need a quick placeholder, you can use an emoji or simple shape:

1. Visit: https://favicon.io/emoji-favicons/
2. Choose a film-related emoji (🎬, 🎥, 🎞️)
3. Download and extract
4. Rename and copy to `public/` folder

## Verify Your Icons

After adding icons, verify they work:

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Manifest
4. Check that icons are loaded correctly
5. Test installation on mobile device
