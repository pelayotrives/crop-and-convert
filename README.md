# Crop & Convert (Chrome MV3)

Lightweight image-prep extension for Chrome. Crop images to common social-media sizes or a fully custom size, then export them as **WEBP**, **JPG**, or **PNG** directly from the popup.

## What it does

- Choose ready-made presets for `Instagram`, `Facebook`, `LinkedIn`, `X`, `TikTok`, `Pinterest`, `YouTube`, `Bluesky`, and `Snapchat`
- Use a **Custom** mode with manual width and height inputs
- Crop a single image with live preview
- Convert images to `WEBP`, `JPG`, or `PNG`
- Batch-process multiple files at once
- Download processed files individually or as a single ZIP
- Remember the last selected platform, preset, format, crop toggle, and custom dimensions

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

- `storage`: used only to remember the user's last selected platform, preset, export format, crop toggle state, and custom size values.

> All image processing runs locally in the browser. No accounts, uploads, or external services are required.
