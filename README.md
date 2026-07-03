# Crop & Convert (Chrome MV3)

Lightweight image processing tool. Crop images to 1:1 or 16:9 and convert JPG/PNG to **WEBP**, individually or in batch.

## What it does

- Crop images to two different formats: 1:1 (square) and 16:9 (landscape)
- Convert JPG and PNG files to WEBP format to optimize size and quality
- Batch processing: handle multiple images at once
- Independent workflows: crop and convert without requiring both steps

## Structure

- `manifest.json`
- `popup.html`
- `popup.css`
- `popup.js`
- `lib/`
  - `cropper.min.css`
  - `cropper.min.js`
- `icons/`

## Local Installation

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `crop-and-convert` folder
5. The Crop & Convert icon will appear in the toolbar

## Permissions Used

- None. The extension works fully client-side with no special permissions required.

> This extension is under development and is not yet available in the Chrome Web Store.
