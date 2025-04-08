let cropper;

const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('drop-area');
const imageElement = document.getElementById('image');
const aspectRatioSelect = document.getElementById('aspectRatio');
const cropButton = document.getElementById('cropButton');
const downloadLink = document.getElementById('downloadLink');

// Initialize Cropper.js in the image element. Also sets the default aspect ratio.
function initializeCropper() {
  if (cropper) {
    cropper.destroy();
  }
  const ratio = parseFloat(aspectRatioSelect.value);
  cropper = new Cropper(imageElement, {
    aspectRatio: ratio,
    viewMode: 1
  });
}

// Handles the aspect ratio selection
aspectRatioSelect.addEventListener('change', () => {
  if (cropper) {
    cropper.setAspectRatio(parseFloat(aspectRatioSelect.value));
  }
});

// Function to load the file
function handleFiles(files) {
  if (files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    imageElement.src = event.target.result;
    // Wait for the image to load to initialize Cropper
    imageElement.onload = initializeCropper;
  };
  reader.readAsDataURL(file);
}

// Event listeners for drag and drop
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('active');
});
dropArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropArea.classList.remove('active');
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('active');
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
});

// Event listener for the file input
fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

// Function to convert the result to WEBP and generate a download link
cropButton.addEventListener('click', () => {
  if (!cropper) return;
  const webpDataURL = canvas.toDataURL("image/webp", 0.92);
  // Assigns the generated WEBP data URL to the download link and makes it visible
  downloadLink.href = webpDataURL;
  downloadLink.style.display = 'inline-block';
  downloadLink.textContent = 'Download WEBP';
});
