# Changelog

All notable changes to Crop & Convert to WEBP are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0]

### Added

- **Batch processing**: handle multiple image files at once, with per-image download links and progress tracking.
- **Drag and drop support**: drag images directly onto the drop area instead of using the file picker.
- **Visual progress bar** with percentage indicator during processing.
- **Reset button** to clear the current selection and pick different files without reloading the popup.
- **Active drop-zone highlight** on dragover (green border + background tint).

### Changed

- Flattened project structure (moved `lib/`, `popup.*`, `icons/` to the extension root).
- README rewritten in English with installation instructions and permission notes.
- UI refinements: grey background panel for options, dashed border for results container, placeholder text when empty.

### Fixed

- Cropper properly destroyed and reinitialized on aspect ratio changes and file resets.
- Crop option automatically disabled and preview hidden when multiple files are selected.

---

## [1.0.0]

### Added

- **Initial release** of Crop & Convert to WEBP (Chrome MV3).
- **Crop images** to two aspect ratios: 1:1 (square) and 16:9 (landscape) via Cropper.js.
- **Convert JPG/PNG to WEBP** with configurable quality (0.55).
- **Independent workflows**: crop and convert can be used separately or together.
- **Single-file preview** with interactive cropper when crop is enabled.
- **Download links** generated client-side — no server needed.
- **Zero permissions required** — fully client-side processing via Canvas API.
- **Cropper.js** bundled locally (`lib/cropper.min.js`, `lib/cropper.min.css`).
- Icons in 4 sizes (16, 32, 48, 128).
