# Crop & Convert (Chrome MV3)

Lightweight image-prep extension for Chrome. Crop images to common social-media sizes or a fully custom size, then export them as **WEBP**, **JPG**, or **PNG** directly from the popup.

## What it does

- Choose ready-made presets for popular social, creator, and profile image formats
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

## Permissions Used

- `storage`: used only to remember the user's last selected platform, preset, export format, crop toggle state, and custom size values.

> All image processing runs locally in the browser. No accounts, uploads, or external services are required.

## Status

[Now available on Chrome Web Store](https://chromewebstore.google.com/detail/crop-convert/ikjkgiblokpgjfmkmogedlfdhkigicpb)