const social_presets = [
  { id: "square", ratio: 1, label: "1:1 Square", meta: "Instagram / Facebook", size: "1080 x 1080" },
  { id: "portrait", ratio: 4 / 5, label: "4:5 Portrait", meta: "Instagram / LinkedIn", size: "1080 x 1350" },
  { id: "story", ratio: 9 / 16, label: "9:16 Story", meta: "Stories / Reels / TikTok", size: "1080 x 1920" },
  { id: "landscape", ratio: 16 / 9, label: "16:9 Landscape", meta: "YouTube / X", size: "1280 x 720" },
  { id: "wide", ratio: 1.91, label: "1.91:1 Wide", meta: "Facebook / LinkedIn shares", size: "1200 x 628" },
  { id: "pin", ratio: 2 / 3, label: "2:3 Pin", meta: "Pinterest", size: "1000 x 1500" }
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
  ratioGrid: document.getElementById("ratioGrid"),
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
let selectedPresetId = "portrait";
let selectedFormatId = "webp";
let previewUrl = "";

wireEvents();
renderPresetGrid();
renderFormatGrid();
updateUiState();
updateDownloadAllVisibility();

function wireEvents() {
  refs.selectFilesButton.addEventListener("click", () => refs.fileInput.click());
  refs.fileInput.addEventListener("change", () => handleFiles(refs.fileInput.files));
  refs.resetButton.addEventListener("click", resetSelection);
  refs.cropOption.addEventListener("change", handleCropToggle);
  refs.processButton.addEventListener("click", () => {
    processSelection().catch((error) => {
      console.error(error);
      showStatus(error instanceof Error ? error.message : "Unexpected processing error.", true);
      setProgressVisibility(false);
    });
  });
  refs.downloadAllButton.addEventListener("click", downloadAllResults);
}

function renderPresetGrid() {
  refs.ratioGrid.innerHTML = "";

  for (const preset of social_presets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${preset.id === selectedPresetId ? "active" : ""}`.trim();
    button.dataset.presetId = preset.id;
    button.innerHTML = `
      <span class="chip-title">${preset.label}</span>
      <span class="chip-meta">${preset.meta}</span>
      <span class="chip-size">${preset.size}</span>
    `;
    button.addEventListener("click", () => {
      if (!canCrop()) return;
      selectedPresetId = preset.id;
      renderPresetGrid();
      if (cropper) {
        cropper.setAspectRatio(preset.ratio);
      }
    });
    refs.ratioGrid.append(button);
  }
}

function renderFormatGrid() {
  refs.formatGrid.innerHTML = "";

  for (const format of format_opts) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip ${format.id === selectedFormatId ? "active" : ""}`.trim();
    button.dataset.formatId = format.id;
    button.innerHTML = `<span class="chip-title">${format.label}</span>`;
    button.addEventListener("click", () => {
      selectedFormatId = format.id;
      renderFormatGrid();
      updateSupportHint();
    });
    refs.formatGrid.append(button);
  }

  updateSupportHint();
}

function handleFiles(fileList) {
  selectedFiles = Array.from(fileList || []);
  refs.resultsContainer.innerHTML = "";
  showStatus("");
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
    showStatus("Crop is available only when you select a single image.", true);
  }

  if (canCrop()) {
    showStatus("");
  }

  updateUiState();
}

function buildFileSummary(files) {
  if (files.length === 1) {
    return `<strong>${escapeHtml(files[0].name)}</strong> selected.`;
  }

  const list = files
    .slice(0, 4)
    .map((file) => `<span>${escapeHtml(file.name)}</span>`)
    .join(" · ");

  const extra = files.length > 4 ? ` · +${files.length - 4} more` : "";
  return `<strong>${files.length} files</strong> selected. ${list}${extra}`;
}

function resetSelection() {
  selectedFiles = [];
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

  const presetButtons = refs.ratioGrid.querySelectorAll(".chip");
  presetButtons.forEach((button) => {
    button.classList.toggle("disabled", !cropAllowed);
    button.disabled = !cropAllowed;
  });

  updateSupportHint();
}

function canCrop() {
  return selectedFiles.length === 1;
}

function updateSupportHint() {
  refs.supportHint.textContent = "";
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
  const preset = social_presets.find((item) => item.id === selectedPresetId) || social_presets[0];
  cropper = new Cropper(refs.image, {
    aspectRatio: preset.ratio,
    viewMode: 1,
    background: false,
    autoCropArea: 1
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
  updateDownloadAllVisibility();
  setProgressVisibility(true);
  updateProgress(0);

  for (let index = 0; index < selectedFiles.length; index += 1) {
    const file = selectedFiles[index];
    const canvas = await buildCanvasForFile(file, index === 0 && canCrop() && refs.cropOption.checked);
    const blob = await exportCanvas(canvas, format);
    appendDownloadLink(blob, buildOutputName(file.name, format.ext), index + 1);
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

    return cropper.getCroppedCanvas();
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
  const resultLinks = refs.resultsContainer.querySelectorAll(".result-link");
  refs.downloadAllButton.classList.toggle("hidden", resultLinks.length <= 1);
}

function downloadAllResults() {
  const resultLinks = Array.from(refs.resultsContainer.querySelectorAll(".result-link"));
  resultLinks.forEach((link, index) => {
    window.setTimeout(() => {
      link.click();
    }, index * 150);
  });
}

function buildOutputName(originalName, extension) {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  return `${baseName}.${extension}`;
}

function getSelectedFormat() {
  return format_opts.find((item) => item.id === selectedFormatId) || null;
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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
