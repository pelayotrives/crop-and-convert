let cropper = null;
let selectedFiles = [];
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

/**
 * Processes the provided files for cropping or preview.
 *
 * If multiple files are provided, disables cropping options and hides the image preview.
 * If a single file is provided, enables cropping options, displays the image container,
 * and loads the file into the image element using a FileReader. Once the image is loaded,
 * the initializeCropper function is called.
 *
 * @param {(File[]|FileList)} files - A collection of File objects obtained from a file input.
 */
function handleFiles(files) {
  selectedFiles = Array.from(files);
  resultsContainer.innerHTML = "";
  if (selectedFiles.length > 1) {
    cropOption.checked = false;
    cropOption.disabled = true;
    aspectRatioSelect.disabled = true;
    imageContainer.style.display = "none";
  } else if (selectedFiles.length === 1) {
    cropOption.disabled = false;
    aspectRatioSelect.disabled = false;
    imageContainer.style.display = "block";
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      imageElement.src = event.target.result;
      imageElement.onload = initializeCropper;
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Initializes the Cropper instance for image cropping.
 *
 * If a Cropper instance already exists, it is destroyed before creating a new one.
 * This function reads the selected aspect ratio from `aspectRatioSelect`, converts it
 * to a float, and initializes a new Cropper on `imageElement` with the specified
 * aspect ratio and a view mode set to 1.
 *
 * @function initializeCropper
 * @returns {void}
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

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("active");
});
dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("active");
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener("change", () => {
  handleFiles(fileInput.files);
});

aspectRatioSelect.addEventListener("change", () => {
  if (cropper) {
    cropper.setAspectRatio(parseFloat(aspectRatioSelect.value));
  }
});

processButton.addEventListener("click", () => {
  if (!cropOption.checked && !convertOption.checked) {
    alert("Por favor, selecciona al menos una función (recortar o convertir).");
    return;
  }

  progressContainer.style.display = "block";
  progressBar.value = 0;
  progressText.textContent = "0%";
  resultsContainer.innerHTML = "";

  if (selectedFiles.length === 1 && cropOption.checked) {
    processSingleFileWithCropAndConvert();
  } else {
    processMultipleFiles();
  }
});

/**
 * Processes a single file by optionally cropping and converting its image.
 *
 * If cropping is enabled (when cropOption is checked and a cropper instance is available),
 * the function extracts a cropped region of the image using the cropper and creates a canvas from it.
 * Otherwise, a new canvas is created and the full image is drawn on it.
 *
 * After cropping (or drawing), the function checks if a conversion is requested (when convertOption is checked).
 * The canvas is then converted to either a WebP image (with quality 0.92) or a PNG image, based on the checkbox status.
 *
 * The generated image data URL is used to create a download link, which is appended to the resultsContainer.
 * Finally, the progressBar and progressText are updated to reflect that the operation is complete.
 *
 * Note: This function relies on the following global variables:
 *   - cropOption: Checkbox element to determine whether cropping is enabled.
 *   - cropper: Cropper instance to handle the cropping operation.
 *   - imageElement: Image element representing the file to be processed.
 *   - convertOption: Checkbox element to determine whether to convert the image to WebP.
 *   - resultsContainer: Container element where the download link is appended.
 *   - progressBar: Element representing the progress bar of the operation.
 *   - progressText: Element representing the textual progress indicator.
 */
function processSingleFileWithCropAndConvert() {
  let canvas;

  if (cropOption.checked && cropper) {
    canvas = cropper.getCroppedCanvas();
  } else {
    canvas = document.createElement("canvas");
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0);
  }

  let outputData;

  if (convertOption.checked) {
    outputData = canvas.toDataURL("image/webp", 0.92);
  } else {
    outputData = canvas.toDataURL("image/png");
  }

  const link = document.createElement("a");
  link.href = outputData;
  link.download = convertOption.checked ? "imagen.webp" : "imagen.png";
  link.textContent = "Descargar resultado";
  resultsContainer.appendChild(link);

  progressBar.value = 100;
  progressText.textContent = "100%";
}

/**
 * Processes multiple files by reading each file as a Data URL, rendering it on a canvas,
 * optionally converting the image to WebP format (if the convert option is selected), or
 * keeping it as PNG, and then creating a downloadable link for each processed image.
 *
 * The function updates a progress bar and text to reflect the number of files processed.
 *
 * Pre-requisites:
 * - A global array "selectedFiles" containing the File objects to be processed.
 * - A global checkbox element "convertOption" to determine the image conversion option.
 * - A global container element "resultsContainer" where download links are appended.
 * - A global progress element "progressBar" to display processing progress.
 * - A global element "progressText" to display percentage progress as text.
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
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        let outputData;
        if (convertOption.checked) {
          outputData = canvas.toDataURL("image/webp", 0.92);
        } else {
          outputData = canvas.toDataURL("image/png");
        }

        const link = document.createElement("a");
        link.href = outputData;
        link.download = convertOption.checked
          ? `imagen_${index + 1}.webp`
          : `imagen_${index + 1}.png`;
        link.textContent = `Descargar imagen ${index + 1}`;
        resultsContainer.appendChild(link);

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