// Global variables
let cropper = null;
let selectedFiles = [];

// DOM Elements
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("drop-area");
const imageElement = document.getElementById("image");
const imageContainer = document.getElementById("imageContainer");
const aspectRatioSelect = document.getElementById("aspectRatio");
const cropOption = document.getElementById("cropOption");
const convertOption = document.getElementById("convertOption");
const processButton = document.getElementById("processButton");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resultsContainer = document.getElementById("resultsContainer");

// !File handling

/**
 * Handles the selection of files and updates the user interface accordingly.
 *
 * This function converts the provided file list into an array and performs the following:
 * - Clears any previous results displayed in the results container.
 * - Updates the drop area with file details, displaying either a short or full list of file names.
 * - Adds a reset button to allow selection of different files.
 * - Adjusts UI elements based on the number of files:
 *   - For multiple files, disables the cropping feature and hides the image container.
 *   - For a single file, enables the cropping feature and conditionally displays the preview.
 * - Loads and displays an image preview for single file selections, initializing the cropper if cropping is enabled.
 *
 * @param {FileList|Array<File>} files - The list or array of file objects selected by the user.
 */
function handleFiles(files) {
  selectedFiles = Array.from(files);
  resultsContainer.innerHTML = "";

  // Update drop area with file information
  if (selectedFiles.length > 0) {
    let fileNamesHtml = "<p><strong>Archivos seleccionados:</strong></p>";
    if (selectedFiles.length <= 3) {
      fileNamesHtml += '<ul style="text-align: left; margin-top: 5px;">';
      selectedFiles.forEach((file) => {
        fileNamesHtml += `<li>${file.name}</li>`;
      });
      fileNamesHtml += "</ul>";
    } else {
      fileNamesHtml += `<p>${selectedFiles.length} files selected</p>`;
    }

    // Replace drop area content
    dropArea.innerHTML = fileNamesHtml;

    // Add reset button
    const resetButton = document.createElement("button");
    resetButton.textContent = "Seleccionar archivos diferentes";
    resetButton.style.marginTop = "10px";
    resetButton.onclick = resetDropArea;
    dropArea.appendChild(resetButton);
  }

  // Handle UI based on number of files selected
  if (selectedFiles.length > 1) {
    // Multiple files - disable crop feature
    cropOption.checked = false;
    cropOption.disabled = true;
    aspectRatioSelect.disabled = true;
    imageContainer.style.display = "none";
  } else if (selectedFiles.length === 1) {
    // Single file - enable crop feature
    cropOption.disabled = false;
    aspectRatioSelect.disabled = false;

    // Show preview only if crop is enabled
    if (cropOption.checked) {
      imageContainer.style.display = "block";
    } else {
      imageContainer.style.display = "none";
    }

    // Load image preview
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      imageElement.src = event.target.result;
      if (cropOption.checked) {
        imageElement.onload = initializeCropper;
      }
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Resets the UI drop area and associated state for image handling.
 *
 * This function clears the current content of the drop area, replacing it with a default template
 * that includes a drag and drop prompt and a file input element configured to accept JPEG and PNG files.
 * It then attaches a change event listener to the new file input, which triggers the file handling logic.
 * Additionally, it clears the list of selected files, hides the image container, and destroys any existing cropper instance.
 */
function resetDropArea() {
  dropArea.innerHTML = `
    <p>Drag and drop your image(s) here or</p>
    <input type="file" id="fileInput" accept="image/jpeg,image/png" multiple>
  `;
  // Re-attach event listener to new file input
  document.getElementById("fileInput").addEventListener("change", () => {
    handleFiles(fileInput.files);
  });

  // Reset state
  selectedFiles = [];
  imageContainer.style.display = "none";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

// !Cropper functionality

/**
 * Initializes the cropper instance for the image element.
 *
 * This function first checks if there is an existing cropper instance and destroys it if present.
 * It then parses the selected aspect ratio from the aspectRatioSelect input, and creates a new Cropper
 * instance on the imageElement using the parsed ratio and a fixed view mode of 1.
 *
 * @function initializeCropper
 */
function initializeCropper() {
  if (cropper) {
    cropper.destroy();
  }
  const ratio = parseFloat(aspectRatioSelect.value);
  cropper = new Cropper(imageElement, {
    aspectRatio: ratio,
    viewMode: 1,
  });
}

// !Image processing

/**
 * Simulates a progress bar update by incrementing its value over a specified duration.
 *
 * The progress is increased in steps until it reaches 90%, at which point it stalls,
 * and once the total duration elapses, the provided callback is executed.
 *
 * @param {Function} callback - Function to be called after the progress simulation completes.
 * @param {number} [duration=1000] - Total duration of the progress simulation in milliseconds.
 */
function simulateProgress(callback, duration = 1000) {
  let progress = 0;
  progressBar.value = progress;
  progressText.textContent = progress + "%";

  const interval = setInterval(() => {
    progress += 10;
    if (progress > 90) progress = 90;
    progressBar.value = progress;
    progressText.textContent = progress + "%";
  }, duration / 10);

  setTimeout(() => {
    clearInterval(interval);
    callback();
  }, duration);
}

/**
 * Returns the original format information for a given image file type.
 *
 * @param {string} fileType - The MIME type of the image (e.g., "image/jpeg" or "image/png").
 * @returns {{ mime: string, ext: string }} An object containing the MIME type and file extension.
 */
function getOriginalFormat(fileType) {
  if (fileType === "image/jpeg") {
    return { mime: "image/jpeg", ext: "jpg" };
  } else if (fileType === "image/png") {
    return { mime: "image/png", ext: "png" };
  }
  return { mime: "image/png", ext: "png" }; // Default to PNG
}

/**
 * Processes the given canvas by converting its content into an image data URL.
 *
 * Depending on whether the convertOption checkbox is checked, this function either converts the canvas image to WEBP format with a quality of 0.25 or retains the original image format. It then creates a download link for the resulting image and updates the UI by appending the link to the results container and updating the progress bar and progress text.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element containing the image to be processed.
 */
function processCanvasResult(canvas) {
  let outputData;
  let fileFormat;

  if (convertOption.checked) {
    // Convert to WEBP with quality set to 0.25
    outputData = canvas.toDataURL("image/webp", 0.25);
    fileFormat = { ext: "webp" };
  } else {
    // Keep original format
    const orig = getOriginalFormat(selectedFiles[0].type);
    outputData = canvas.toDataURL(orig.mime);
    fileFormat = orig;
  }

  // Create download link
  const link = document.createElement("a");
  link.href = outputData;
  link.download = "image." + fileFormat.ext;
  link.textContent = "Descargar resultado";
  resultsContainer.appendChild(link);

  // Complete progress
  progressBar.value = 100;
  progressText.textContent = "100%";
}

/**
 * Processes a single file by either cropping and converting it or simply converting it based on user selection.
 *
 * When cropping is enabled (checked via the `cropOption`), the function initializes the cropper, waits for it to be ready,
 * simulates a progress indicator, extracts the cropped portion of the image from the cropper as a canvas, and then processes
 * the resulting canvas.
 *
 * If cropping is disabled, the function creates a new canvas element with dimensions matching the natural dimensions of
 * the image (`imageElement`), draws the full image onto the canvas, simulates a progress indicator, and processes the resulting canvas.
 *
 * @function processSingleFileWithCropAndConvert
 */
function processSingleFileWithCropAndConvert() {
  if (cropOption.checked) {
    // Initialize cropper each time we process
    initializeCropper();

    // Wait for cropper to be ready
    setTimeout(() => {
      simulateProgress(() => {
        const canvas = cropper.getCroppedCanvas();
        processCanvasResult(canvas);
      }, 1000);
    }, 300);
  } else {
    // Just convert without cropping
    simulateProgress(() => {
      const canvas = document.createElement("canvas");
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageElement, 0, 0);
      processCanvasResult(canvas);
    }, 1000);
  }
}

/**
 * Processes multiple image files by reading, optionally converting, and generating download links for each image.
 *
 * The function iterates through each file in the global `selectedFiles` array using FileReader to load each file as a data URL.
 * For every loaded file, an HTMLImageElement is created and, once it loads, it is drawn onto an HTMLCanvasElement.
 * Depending on the state of the global `convertOption` checkbox, the image is converted to a WebP format with low quality or kept in its original format (by using the `getOriginalFormat` function).
 * A download link is then created for the processed image, appended to the global `resultsContainer`, and the progress is updated using the global `progressBar` and `progressText`.
 *
 * Note: This function depends on several globals:
 *   - selectedFiles: Array of File objects to be processed.
 *   - convertOption: Checkbox input element to control image conversion.
 *   - getOriginalFormat: Function that returns an object containing the image mime type and extension for the original file.
 *   - resultsContainer: DOM element where download links will be appended.
 *   - progressBar: Progress bar DOM element to indicate processing progress.
 *   - progressText: DOM element displaying the numeric progress percentage.
 *
 * @function processMultipleFiles
 */
function processMultipleFiles() {
  let processedCount = 0;
  const total = selectedFiles.length;

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        // Create canvas and process image
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Apply conversion if selected
        let outputData;
        let fileFormat;
        if (convertOption.checked) {
          outputData = canvas.toDataURL("image/webp", 0.25);
          fileFormat = { ext: "webp" };
        } else {
          const orig = getOriginalFormat(file.type);
          outputData = canvas.toDataURL(orig.mime);
          fileFormat = orig;
        }

        // Create download link
        const link = document.createElement("a");
        link.href = outputData;
        link.download = "image_" + (index + 1) + "." + fileFormat.ext;
        link.textContent = "Descargar imagen " + (index + 1);
        resultsContainer.appendChild(link);

        // Update progress
        processedCount++;
        let percent = Math.round((processedCount / total) * 100);
        progressBar.value = percent;
        progressText.textContent = percent + "%";
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// !Event listeners

/**
 * Event listeners for aspect ratio changes
 */
aspectRatioSelect.addEventListener("change", () => {
  if (cropper) {
    cropper.setAspectRatio(parseFloat(aspectRatioSelect.value));
  }
});

/**
 * Event listeners for crop option changes
 */
cropOption.addEventListener("change", () => {
  if (cropOption.checked) {
    if (selectedFiles.length === 1) {
      imageContainer.style.display = "block";
      // Initialize cropper if image is already loaded
      if (imageElement.src && !cropper) {
        initializeCropper();
      }
    }
  } else {
    imageContainer.style.display = "none";
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  }
});

/**
 * Event listeners for drag and drop functionality
 */
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("active");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove("active");
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
});

/**
 * Event listener for file selection
 */
fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
});

/**
 * Event listener for process button click
 */
processButton.addEventListener("click", () => {
  // Validate options
  if (!cropOption.checked && !convertOption.checked) {
    alert("Please select at least one function (crop or convert).");
    return;
  }

  // Show progress and reset results
  progressContainer.style.display = "block";
  progressBar.value = 0;
  progressText.textContent = "0%";
  resultsContainer.innerHTML = "";

  // Process based on selected options
  if (selectedFiles.length === 1 && cropOption.checked) {
    processSingleFileWithCropAndConvert();
  } else {
    processMultipleFiles();
  }
});
