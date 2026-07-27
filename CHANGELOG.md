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
- **Custom size mode** with manual width and height inputs.
- **Remember last selections** via local extension storage for platform, preset, export format, crop toggle, and custom dimensions.
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
- In `Custom` mode, the preset chips are removed so only the manual size inputs remain visible.
- Custom width and height can now go as low as `1px`.
- The crop alert for missing/invalid selection now appears inside the **Crop preset** section instead of the processing section.
- `Download all` now creates a single ZIP instead of triggering many individual downloads.
- Standardized chips, alerts, spacing, hover states, and download actions across the popup.
- Project structure was flattened so `lib/`, `popup.*`, and `icons/` live at the extension root.
- README was rewritten in English with installation instructions and permission notes.

### Fixed

- Prevented no-op exports when the target format matches the original file format and crop is not enabled.
- Improved disabled/enabled states for crop controls, social-platform chips, and preset chips depending on the current selection and crop toggle state.
- Standardized processing errors so they use the same alert style as crop warnings.
- Reduced empty layout gaps in the process/download area when no status or results are present.
- Cropper is properly destroyed and reinitialized on ratio changes, platform changes, and file resets.
- Reset now correctly turns the crop toggle back to `OFF` before disabling it.
- Custom-size inputs can be cleared and rewritten without fighting the live validation.
- In `Custom` mode, width and height now sync live with the crop box when you resize it in the preview.
- Fixed SonarQube issues in the ZIP generation helpers.
