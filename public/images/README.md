# Images Directory

This directory is for static images used in the site.

## To add your personal photos:

1. **Profile photo**: Add `profile.jpg` (recommended size: 256x256px or larger, square aspect ratio)
2. **Background images**: Add `bg-1.jpg`, `bg-2.jpg`, etc. (recommended size: 1920x1080px or larger)
3. **Default avatar**: Add `default-avatar.png` as a fallback

## Usage:

- Profile photo is displayed as a circular avatar on the home page
- Background images are randomly selected for the home page background
- Update the `useBackgroundGallery.ts` composable to include your background image paths

## Format recommendations:

- **Profile**: JPG/PNG, square, 256x256px minimum
- **Backgrounds**: JPG, landscape, 1920x1080px minimum
- **Default avatar**: PNG with transparency support