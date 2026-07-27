const custom_group_id = "custom";
const custom_preset_id = "custom-size";
const preferences_storage_key = "crop_convert_preferences";
const default_custom_size = { width: 1080, height: 1080 };

const social_preset_groups = [
  {
    id: "instagram",
    label: "Instagram",
    presets: [
      { id: "ig-post-square", label: "Feed square", meta: "Post", width: 1080, height: 1080 },
      { id: "ig-post-portrait", label: "Feed portrait", meta: "Post", width: 1080, height: 1350 },
      { id: "ig-story-reel", label: "Story / Reel", meta: "Vertical", width: 1080, height: 1920 },
      { id: "ig-reel-cover", label: "Reel cover", meta: "Cover", width: 420, height: 654 }
    ]
  },
  {
    id: "facebook",
    label: "Facebook",
    presets: [
      { id: "fb-feed-post", label: "Feed post", meta: "Shared image", width: 1200, height: 630 },
      { id: "fb-page-cover", label: "Page cover", meta: "Cover", width: 851, height: 315 },
      { id: "fb-page-profile", label: "Page profile", meta: "Profile photo", width: 320, height: 320 }
    ]
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    presets: [
      { id: "li-feed-post", label: "Feed post", meta: "Landscape", width: 1200, height: 627 },
      { id: "li-profile-cover", label: "Profile cover", meta: "Header", width: 1584, height: 396 },
      { id: "li-profile-photo", label: "Profile photo", meta: "Avatar", width: 400, height: 400 }
    ]
  },
  {
    id: "x",
    label: "X",
    presets: [
      { id: "x-post-wide", label: "Post wide", meta: "Single image", width: 1600, height: 900 },
      { id: "x-post-tall", label: "Post tall", meta: "Single image", width: 1200, height: 1500 },
      { id: "x-header", label: "Header", meta: "Banner", width: 1500, height: 500 },
      { id: "x-profile", label: "Profile photo", meta: "Avatar", width: 400, height: 400 }
    ]
  },
  {
    id: "tiktok",
    label: "TikTok",
    presets: [
      { id: "tt-post-vertical", label: "Photo post", meta: "Vertical", width: 1080, height: 1920 },
      { id: "tt-square-cover", label: "Carousel cover", meta: "Square", width: 1080, height: 1080 },
      { id: "tt-profile-photo", label: "Profile photo", meta: "Avatar", width: 400, height: 400 }
    ]
  },
  {
    id: "pinterest",
    label: "Pinterest",
    presets: [
      { id: "pin-image", label: "Image Pin", meta: "Standard", width: 1000, height: 1500 },
      { id: "pin-cover", label: "Profile cover", meta: "Header", width: 800, height: 450 },
      { id: "pin-profile", label: "Profile photo", meta: "Avatar", width: 400, height: 400 }
    ]
  },
  {
    id: "youtube",
    label: "YouTube",
    presets: [
      { id: "yt-thumbnail", label: "Thumbnail", meta: "Video preview", width: 3840, height: 2160 },
      { id: "yt-banner", label: "Channel banner", meta: "Header", width: 2560, height: 1440 },
      { id: "yt-profile", label: "Profile photo", meta: "Avatar", width: 800, height: 800 }
    ]
  },
  {
    id: "bluesky",
    label: "Bluesky",
    presets: [
      { id: "bsky-post-square", label: "Post square", meta: "Single image", width: 1080, height: 1080 },
      { id: "bsky-post-portrait", label: "Post portrait", meta: "Single image", width: 1000, height: 1250 },
      { id: "bsky-banner", label: "Profile banner", meta: "Banner", width: 1500, height: 500 },
      { id: "bsky-profile", label: "Profile photo", meta: "Avatar", width: 400, height: 400 }
    ]
  },
  {
    id: "snapchat",
    label: "Snapchat",
    presets: [
      { id: "snap-story", label: "Story / Spotlight", meta: "Vertical", width: 1080, height: 1920 },
      { id: "snap-cover", label: "Public profile cover", meta: "Cover", width: 1080, height: 1920 },
      { id: "snap-profile", label: "Public profile photo", meta: "Avatar", width: 400, height: 400 }
    ]
  },
  {
    id: custom_group_id,
    label: "Custom",
    presets: [
      { id: custom_preset_id, label: "Custom size", meta: "Manual", width: default_custom_size.width, height: default_custom_size.height }
    ]
  }
];

const format_opts = [
  { id: "webp", label: "WEBP", mime: "image/webp", ext: "webp", quality: 0.82 },
  { id: "jpg", label: "JPG", mime: "image/jpeg", ext: "jpg", quality: 0.9 },
  { id: "png", label: "PNG", mime: "image/png", ext: "png" }
];

const refs = {
  fileInput: document.getElementById("fileInput"),
  selectFilesButton: document.getElementById("selectFilesButton"),
  resetButton: document.getElementById("resetButton"),
  fileSummary: document.getElementById("fileSummary"),
  cropOption: document.getElementById("cropOption"),
  cropHint: document.getElementById("cropHint"),
  cropStatusMessage: document.getElementById("cropStatusMessage"),
  socialGrid: document.getElementById("socialGrid"),
  ratioGrid: document.getElementById("ratioGrid"),
  customSizePanel: document.getElementById("customSizePanel"),
  customWidthInput: document.getElementById("customWidthInput"),
  customHeightInput: document.getElementById("customHeightInput"),
  formatGrid: document.getElementById("formatGrid"),
  supportHint: document.getElementById("supportHint"),
  processButton: document.getElementById("processButton"),
  statusMessage: document.getElementById("statusMessage"),
  progressContainer: document.getElementById("progressContainer"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  resultsContainer: document.getElementById("resultsContainer"),
  downloadAllButton: document.getElementById("downloadAllButton"),
  imageContainer: document.getElementById("imageContainer"),
  image: document.getElementById("image")
};

let cropper = null;
let selectedFiles = [];
let selectedPlatformId = social_preset_groups[0].id;
let selectedPresetId = social_preset_groups[0].presets[0].id;
let selectedFormatId = "webp";
let customSize = { ...default_custom_size };
let previewUrl = "";
let processedDownloads = [];
let isSyncingFromCropper = false;

void initializeApp();

async function initializeApp() {
  wireEvents();
  await loadPreferences();
  renderPlatformGrid();
  renderPresetGrid();
  renderFormatGrid();
  updateCustomSizeInputs();
  updateUiState();
  updateDownloadAllVisibility();
}

function wireEvents() {
  refs.selectFilesButton.addEventListener("click", () => refs.fileInput.click());
  refs.fileInput.addEventListener("change", () => handleFiles(refs.fileInput.files));
  refs.resetButton.addEventListener("click", resetSelection);
  refs.cropOption.addEventListener("change", handleCropToggle);
  refs.cropOption.closest(".toggle")?.addEventListener("click", handleCropToggleAttempt);
  refs.customWidthInput.addEventListener("input", handleCustomSizeInput);
  refs.customHeightInput.addEventListener("input", handleCustomSizeInput);
  refs.customWidthInput.addEventListener("blur", commitCustomSizeInputs);
  refs.customHeightInput.addEventListener("blur", commitCustomSizeInputs);
  refs.customWidthInput.addEventListener("change", commitCustomSizeInputs);
  refs.customHeightInput.addEventListener("change", commitCustomSizeInputs);
  refs.processButton.addEventListener("click", () => {
    processSelection().catch((error) => {
      console.error(error);
      showStatus(error instanceof Error ? error.message : "Unexpected processing error.", true);
      setProgressVisibility(false);
      resetDownloadAllButton();
    });
  });
  refs.downloadAllButton.addEventListener("click", () => {
    downloadAllResults().catch((error) => {
      console.error(error);
      showStatus(error instanceof Error ? error.message : "Could not prepare the ZIP file.", true);
      resetDownloadAllButton();
    });
  });
}

function renderPlatformGrid() {
  refs.socialGrid.innerHTML = "";

  for (const platform of social_preset_groups) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip platform-chip ${platform.id === selectedPlatformId ? "active" : ""}`.trim();
    button.dataset.platformId = platform.id;
    button.innerHTML = `<span class="chip-title">${platform.label}</span>`;
    button.addEventListener("click", () => {
      selectedPlatformId = platform.id;
      selectedPresetId = platform.presets[0].id;
      renderPlatformGrid();
      renderPresetGrid();
      updateCustomSizeInputs();
      updateUiState();
      if (cropper) {
        cropper.setAspectRatio(getCropAspectRatio());
      }
      void savePreferences();
    });
    refs.socialGrid.append(button);
  }
}

function renderPresetGrid() {
  refs.ratioGrid.innerHTML = "";
  const platform = getSelectedPlatform();

  if (platform.id === custom_group_id) {
    return;
  }

  for (const preset of platform.presets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${preset.id === selectedPresetId ? "active" : ""}`.trim();
    button.dataset.presetId = preset.id;
    button.innerHTML = `
      <span class="chip-title">${preset.label}</span>
      <span class="chip-meta">${preset.meta}</span>
      <span class="chip-size">${preset.width} x ${preset.height}</span>
    `;
    button.addEventListener("click", () => {
      if (!canCrop()) return;
      selectedPresetId = preset.id;
      renderPresetGrid();
      if (cropper) {
        cropper.setAspectRatio(getCropAspectRatio());
      }
      void savePreferences();
    });
    refs.ratioGrid.append(button);
  }
}

function renderFormatGrid() {
  refs.formatGrid.innerHTML = "";

  for (const format of format_opts) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip format-chip ${format.id === selectedFormatId ? "active" : ""}`.trim();
    button.dataset.formatId = format.id;
    button.innerHTML = `<span class="chip-title">${format.label}</span>`;
    button.addEventListener("click", () => {
      selectedFormatId = format.id;
      renderFormatGrid();
      updateSupportHint();
      void savePreferences();
    });
    refs.formatGrid.append(button);
  }

  updateSupportHint();
}

function handleFiles(fileList) {
  selectedFiles = Array.from(fileList || []);
  refs.resultsContainer.innerHTML = "";
  processedDownloads = [];
  showStatus("");
  showCropStatus("");
  updateDownloadAllVisibility();

  if (!selectedFiles.length) {
    resetSelection();
    return;
  }

  refs.resetButton.classList.remove("hidden");
  refs.fileSummary.innerHTML = buildFileSummary(selectedFiles);

  if (!canCrop()) {
    refs.cropOption.checked = false;
  }

  updateUiState();
}

function handleCropToggle() {
  if (refs.cropOption.checked && !canCrop()) {
    refs.cropOption.checked = false;
    showCropStatus("Crop is available only when you select a single image.");
  }

  if (canCrop()) {
    showCropStatus("");
  }

  updateUiState();
  void savePreferences();
}

function handleCropToggleAttempt(event) {
  if (!refs.cropOption.disabled) return;

  event.preventDefault();

  if (!selectedFiles.length) {
    showCropStatus("Select an image first to enable crop.");
    return;
  }

  if (selectedFiles.length > 1) {
    showCropStatus("Crop is available only when you select a single image.");
  }
}

function handleCustomSizeInput() {
  if (isSyncingFromCropper) {
    return;
  }

  const width = tryParseCustomDimension(refs.customWidthInput.value);
  const height = tryParseCustomDimension(refs.customHeightInput.value);

  if (!width || !height) {
    return;
  }

  customSize = { width, height };
  updateCustomPreset();
  renderPresetGrid();
  if (cropper && isCustomPlatformSelected()) {
    cropper.setAspectRatio(getCropAspectRatio());
  }
  void savePreferences();
}

function commitCustomSizeInputs() {
  if (isSyncingFromCropper) {
    return;
  }

  const width = normalizeCustomDimension(refs.customWidthInput.value, customSize.width);
  const height = normalizeCustomDimension(refs.customHeightInput.value, customSize.height);
  customSize = { width, height };
  updateCustomPreset();
  updateCustomSizeInputs();
  renderPresetGrid();
  if (cropper && isCustomPlatformSelected()) {
    cropper.setAspectRatio(getCropAspectRatio());
  }
  void savePreferences();
}

function buildFileSummary(files) {
  if (files.length === 1) {
    return `<strong>${escapeHtml(files[0].name)}</strong> selected.`;
  }

  const listItems = files
    .slice(0, 4)
    .map((file) => `<li>${escapeHtml(file.name)}</li>`)
    .join("");

  const extra = files.length > 4 ? `<li>+${files.length - 4} more</li>` : "";
  return `<strong>${files.length} files</strong> selected:<ul class="file-summary-list">${listItems}${extra}</ul>`;
}

function resetSelection() {
  selectedFiles = [];
  processedDownloads = [];
  refs.fileInput.value = "";
  refs.fileSummary.textContent = "No files selected yet.";
  refs.resetButton.classList.add("hidden");
  refs.resultsContainer.innerHTML = "";
  refs.cropOption.checked = false;
  destroyCropper();
  clearPreviewUrl();
  refs.image.removeAttribute("src");
  refs.imageContainer.classList.add("hidden");
  setProgressVisibility(false);
  showStatus("");
  showCropStatus("");
  resetDownloadAllButton();
  updateDownloadAllVisibility();
  updateUiState();
}

function updateUiState() {
  const cropAllowed = canCrop();
  refs.cropOption.disabled = !cropAllowed;
  const toggleLabel = refs.cropOption.closest(".toggle");
  if (toggleLabel) {
    toggleLabel.classList.toggle("disabled", !cropAllowed);
  }
  refs.cropHint.classList.toggle("hidden", cropAllowed || selectedFiles.length <= 1);
  refs.customSizePanel.classList.toggle("hidden", !isCustomPlatformSelected());
  refs.ratioGrid.classList.toggle("hidden", isCustomPlatformSelected());

  const shouldPreview = cropAllowed && refs.cropOption.checked;
  refs.imageContainer.classList.toggle("hidden", !shouldPreview);

  if (shouldPreview) {
    loadPreview(selectedFiles[0]).catch((error) => {
      console.error(error);
      destroyCropper();
      refs.imageContainer.classList.add("hidden");
      showStatus(error instanceof Error ? error.message : "Preview unavailable for this file.", true);
    });
  } else {
    destroyCropper();
    clearPreviewUrl();
    refs.image.removeAttribute("src");
  }

  const cropControlsEnabled = cropAllowed && refs.cropOption.checked;

  const platformButtons = refs.socialGrid.querySelectorAll(".chip");
  platformButtons.forEach((button) => {
    button.classList.toggle("disabled", !cropControlsEnabled);
    button.disabled = !cropControlsEnabled;
  });

  const presetButtons = refs.ratioGrid.querySelectorAll(".chip");
  presetButtons.forEach((button) => {
    button.classList.toggle("disabled", !cropControlsEnabled);
    button.disabled = !cropControlsEnabled;
  });

  updateSupportHint();
}

function canCrop() {
  return selectedFiles.length === 1;
}

function updateSupportHint() {
  refs.supportHint.textContent = "";
}

function updateCustomPreset() {
  const customGroup = social_preset_groups.find((group) => group.id === custom_group_id);
  if (!customGroup) return;
  customGroup.presets[0] = {
    id: custom_preset_id,
    label: "Custom size",
    meta: "Manual",
    width: customSize.width,
    height: customSize.height
  };
}

function updateCustomSizeInputs() {
  refs.customWidthInput.value = String(customSize.width);
  refs.customHeightInput.value = String(customSize.height);
}

async function loadPreview(file) {
  clearPreviewUrl();
  destroyCropper();

  const objectUrl = URL.createObjectURL(file);
  previewUrl = objectUrl;

  await new Promise((resolve, reject) => {
    refs.image.onload = () => resolve();
    refs.image.onerror = () => reject(new Error(`This browser could not preview "${file.name}".`));
    refs.image.src = objectUrl;
  });

  initializeCropper();
}

function initializeCropper() {
  destroyCropper();
  cropper = new Cropper(refs.image, {
    aspectRatio: getCropAspectRatio(),
    viewMode: 1,
    background: false,
    autoCropArea: 1,
    crop(event) {
      if (!isCustomPlatformSelected()) {
        return;
      }

      const width = Math.max(1, Math.round(event.detail.width));
      const height = Math.max(1, Math.round(event.detail.height));

      if (width === customSize.width && height === customSize.height) {
        return;
      }

      isSyncingFromCropper = true;
      customSize = { width, height };
      updateCustomPreset();
      refs.customWidthInput.value = String(width);
      refs.customHeightInput.value = String(height);
      isSyncingFromCropper = false;
      void savePreferences();
    }
  });
}

function destroyCropper() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function clearPreviewUrl() {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = "";
  }
}

async function processSelection() {
  showStatus("");

  if (!selectedFiles.length) {
    showStatus("Select at least one image first.", true);
    return;
  }

  const format = getSelectedFormat();
  if (!format) {
    showStatus("Choose a valid export format.", true);
    return;
  }

  validateNoOpConversion(format);

  refs.resultsContainer.innerHTML = "";
  processedDownloads = [];
  resetDownloadAllButton();
  updateDownloadAllVisibility();
  setProgressVisibility(true);
  updateProgress(0);

  for (let index = 0; index < selectedFiles.length; index += 1) {
    const file = selectedFiles[index];
    const canvas = await buildCanvasForFile(file, index === 0 && canCrop() && refs.cropOption.checked);
    const blob = await exportCanvas(canvas, format);
    const fileName = buildOutputName(file.name, format.ext);
    processedDownloads.push({ blob, fileName });
    appendDownloadLink(blob, fileName, index + 1);
    updateProgress(Math.round(((index + 1) / selectedFiles.length) * 100));
  }

  updateDownloadAllVisibility();
  showStatus(selectedFiles.length === 1 ? "1 image processed." : `${selectedFiles.length} images processed.`);
}

function validateNoOpConversion(format) {
  if (refs.cropOption.checked && canCrop()) return;

  const offenders = selectedFiles.filter((file) => normalizeFileExtension(file) === format.ext);
  if (!offenders.length) return;

  if (selectedFiles.length === 1) {
    throw new Error(`"${selectedFiles[0].name}" is already a ${format.label}. Pick another format or enable crop.`);
  }

  throw new Error(`Some selected files are already ${format.label}. Remove them or choose another target format.`);
}

async function buildCanvasForFile(file, useCropperCanvas) {
  if (useCropperCanvas) {
    if (!cropper) {
      throw new Error("Crop preview is not ready yet.");
    }

    const preset = getSelectedPreset();
    return cropper.getCroppedCanvas({
      width: preset.width,
      height: preset.height,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high"
    });
  }

  const image = await loadImageForProcessing(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return canvas;
}

async function loadImageForProcessing(file) {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`This browser could not decode "${file.name}".`));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function exportCanvas(canvas, format) {
  return new Promise((resolve, reject) => {
    const quality = typeof format.quality === "number" ? format.quality : undefined;
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(`Could not export ${format.label}.`));
        return;
      }

      if (format.mime !== "image/png" && blob.type !== format.mime) {
        reject(new Error(`${format.label} export is not supported by this browser.`));
        return;
      }

      resolve(blob);
    }, format.mime, quality);
  });
}

function appendDownloadLink(blob, fileName, index) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.className = "result-link";
  link.href = objectUrl;
  link.download = fileName;
  link.textContent = selectedFiles.length === 1 ? `Download ${fileName}` : `Download file ${index}: ${fileName}`;
  link.addEventListener("click", () => {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }, { once: true });
  refs.resultsContainer.append(link);
}

function updateDownloadAllVisibility() {
  refs.downloadAllButton.classList.toggle("hidden", processedDownloads.length <= 1);
}

async function downloadAllResults() {
  if (processedDownloads.length <= 1) return;

  refs.downloadAllButton.disabled = true;
  refs.downloadAllButton.textContent = "Preparing ZIP...";

  const zipBlob = await buildZipBlob(processedDownloads);
  const zipName = buildZipName(new Date());
  triggerBlobDownload(zipBlob, zipName);
  resetDownloadAllButton();
}

function resetDownloadAllButton() {
  refs.downloadAllButton.disabled = false;
  refs.downloadAllButton.textContent = "Download all";
}

function buildOutputName(originalName, extension) {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  return `${baseName}.${extension}`;
}

function getSelectedPlatform() {
  return social_preset_groups.find((item) => item.id === selectedPlatformId) || social_preset_groups[0];
}

function getSelectedPreset() {
  const platform = getSelectedPlatform();
  return platform.presets.find((item) => item.id === selectedPresetId) || platform.presets[0];
}

function getCropAspectRatio() {
  if (isCustomPlatformSelected()) {
    return Number.NaN;
  }

  const preset = getSelectedPreset();
  return preset.width / preset.height;
}

function getSelectedFormat() {
  return format_opts.find((item) => item.id === selectedFormatId) || null;
}

function isCustomPlatformSelected() {
  return selectedPlatformId === custom_group_id;
}

function normalizeFileExtension(file) {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".jpeg") || fileName.endsWith(".jpg")) return "jpg";
  if (fileName.endsWith(".png")) return "png";
  if (fileName.endsWith(".webp")) return "webp";

  const type = file.type.toLowerCase();
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";

  return "";
}

function tryParseCustomDimension(value) {
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

function normalizeCustomDimension(value, fallback) {
  return tryParseCustomDimension(value) ?? fallback;
}

function updateProgress(percent) {
  refs.progressBar.value = percent;
  refs.progressText.textContent = `${percent}%`;
}

function setProgressVisibility(isVisible) {
  refs.progressContainer.classList.toggle("hidden", !isVisible);
  refs.progressContainer.setAttribute("aria-hidden", isVisible ? "false" : "true");
  if (!isVisible) {
    updateProgress(0);
  }
}

function showStatus(message, isError = false) {
  refs.statusMessage.textContent = message;
  refs.statusMessage.classList.toggle("error", isError);
}

function showCropStatus(message) {
  refs.cropStatusMessage.textContent = message;
  refs.cropStatusMessage.classList.toggle("hidden", !message);
}

async function loadPreferences() {
  const storage = globalThis.chrome?.storage?.local;
  if (!storage) return;

  try {
    const result = await storage.get(preferences_storage_key);
    const saved = result?.[preferences_storage_key];
    if (!saved || typeof saved !== "object") return;

    if (typeof saved.customWidth === "number" && saved.customWidth >= 1) {
      customSize.width = saved.customWidth;
    }
    if (typeof saved.customHeight === "number" && saved.customHeight >= 1) {
      customSize.height = saved.customHeight;
    }
    updateCustomPreset();

    if (typeof saved.platformId === "string" && social_preset_groups.some((group) => group.id === saved.platformId)) {
      selectedPlatformId = saved.platformId;
    }

    const platform = getSelectedPlatform();
    if (typeof saved.presetId === "string" && platform.presets.some((preset) => preset.id === saved.presetId)) {
      selectedPresetId = saved.presetId;
    } else {
      selectedPresetId = platform.presets[0].id;
    }

    if (typeof saved.formatId === "string" && format_opts.some((format) => format.id === saved.formatId)) {
      selectedFormatId = saved.formatId;
    }

    if (typeof saved.cropEnabled === "boolean") {
      refs.cropOption.checked = saved.cropEnabled;
    }
  } catch (error) {
    console.warn("Could not load preferences.", error);
  }
}

async function savePreferences() {
  const storage = globalThis.chrome?.storage?.local;
  if (!storage) return;

  try {
    await storage.set({
      [preferences_storage_key]: {
        platformId: selectedPlatformId,
        presetId: selectedPresetId,
        formatId: selectedFormatId,
        cropEnabled: refs.cropOption.checked,
        customWidth: customSize.width,
        customHeight: customSize.height
      }
    });
  } catch (error) {
    console.warn("Could not save preferences.", error);
  }
}

async function buildZipBlob(entries) {
  const fileEntries = await Promise.all(entries.map(async ({ fileName, blob }) => {
    const data = new Uint8Array(await blob.arrayBuffer());
    const fileNameBytes = new TextEncoder().encode(fileName);
    const crc = crc32(data);
    const timestamp = new Date();
    const { dosTime, dosDate } = toDosDateTime(timestamp);

    return {
      fileName,
      fileNameBytes,
      data,
      crc,
      dosTime,
      dosDate
    };
  }));

  let offset = 0;
  const localParts = [];
  const centralParts = [];

  for (const entry of fileEntries) {
    const localHeader = createLocalFileHeader(entry);
    localParts.push(localHeader, entry.fileNameBytes, entry.data);

    const centralHeader = createCentralDirectoryHeader(entry, offset);
    centralParts.push(centralHeader, entry.fileNameBytes);

    offset += localHeader.length + entry.fileNameBytes.length + entry.data.length;
  }

  const centralDirectorySize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = createEndOfCentralDirectoryRecord(fileEntries.length, centralDirectorySize, offset);

  return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
}

function createLocalFileHeader(entry) {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, entry.dosTime, true);
  view.setUint16(12, entry.dosDate, true);
  view.setUint32(14, entry.crc, true);
  view.setUint32(18, entry.data.length, true);
  view.setUint32(22, entry.data.length, true);
  view.setUint16(26, entry.fileNameBytes.length, true);
  view.setUint16(28, 0, true);
  return header;
}

function createCentralDirectoryHeader(entry, localHeaderOffset) {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, entry.dosTime, true);
  view.setUint16(14, entry.dosDate, true);
  view.setUint32(16, entry.crc, true);
  view.setUint32(20, entry.data.length, true);
  view.setUint32(24, entry.data.length, true);
  view.setUint16(28, entry.fileNameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localHeaderOffset, true);
  return header;
}

function createEndOfCentralDirectoryRecord(entryCount, centralDirectorySize, centralDirectoryOffset) {
  const footer = new Uint8Array(22);
  const view = new DataView(footer.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);
  return footer;
}

function buildZipName(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `crop_and_convert_${year}_${month}_${day}_${hours}_${minutes}.zip`;
}

function triggerBlobDownload(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

function toDosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
