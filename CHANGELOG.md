# Changelog

All notable changes to Crop & Convert are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1]

### Added

- **Export format picker** for `WEBP`, `JPG`, and `PNG`.
- **Platform-first crop flow** with a social-network selector before choosing the exact preset.
- **Preset libraries** for `Instagram`, `Facebook`, `LinkedIn`, `X`, `TikTok`, `Pinterest`, `YouTube`, `Bluesky`, and `Snapchat`.
- **Exact asset presets** for common post, story, banner, cover, thumbnail, and profile-photo sizes.
- **Batch processing** with per-image download links and progress tracking.
- **Download all as ZIP** for multi-file exports, with a generated archive name like `crop_and_convert_YYYY_MM_DD_HH_MM.zip`.
- **Single-image crop preview** powered by Cropper.js.
- **Structured file summary list** when multiple images are selected.
- **Reset button** to clear the current selection without reloading the popup.
- Icons in 4 sizes (`16`, `32`, `48`, `128`).

### Changed

- Redesigned the popup into a tighter single-flow interface with a unified **Process and download** section.
- Simplified source import to **file selection only**; drag and drop was removed.
- Replaced the old flat preset list with a **platform-first selection model** that narrows presets by network.
- Crop output now respects the **exact selected preset dimensions**, not just the aspect ratio.
- Standardized chips, alerts, spacing, hover states, and download actions across the popup.
- `Download all` now creates a single ZIP instead of triggering many individual downloads.
- Project structure was flattened so `lib/`, `popup.*`, and `icons/` live at the extension root.
- README was rewritten in English with installation instructions and permission notes.

### Fixed

- Prevented no-op exports when the target format matches the original file format and crop is not enabled.
- Improved disabled/enabled states for crop controls and ratio chips depending on the current selection.
- Standardized processing errors so they use the same alert style as crop warnings.
- Reduced empty layout gaps in the process/download area when no status or results are present.
- Cropper is properly destroyed and reinitialized on ratio changes and file resets.
- Fixed SonarQube issues in the ZIP generation helpers.
