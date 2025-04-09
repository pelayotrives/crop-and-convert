let cropper = null;
let selectedFiles = [];
const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('drop-area');
const imageElement = document.getElementById('image');
const imageContainer = document.getElementById('imageContainer');
const aspectRatioSelect = document.getElementById('aspectRatio');
const cropOption = document.getElementById('cropOption');
const convertOption = document.getElementById('convertOption');
const processButton = document.getElementById('processButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const resultsContainer = document.getElementById('resultsContainer');

// Maneja la selección de archivos
function handleFiles(files) {
  selectedFiles = Array.from(files);
  resultsContainer.innerHTML = ""; // Limpiar resultados previos

  // Si se seleccionan varias imágenes se deshabilita el recorte.
  if (selectedFiles.length > 1) {
    cropOption.checked = false;
    cropOption.disabled = true;
    aspectRatioSelect.disabled = true;
    imageContainer.style.display = 'none';
  } else if (selectedFiles.length === 1) {
    cropOption.disabled = false;
    aspectRatioSelect.disabled = false;
    // Muestra la vista previa solo si se ha marcado la opción de recorte
    if (cropOption.checked) {
      imageContainer.style.display = 'block';
    } else {
      imageContainer.style.display = 'none';
    }
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      imageElement.src = event.target.result;
      // Si ya está marcado recortar, inicializa el Cropper
      if (cropOption.checked) {
        imageElement.onload = initializeCropper;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Inicializa Cropper con la relación seleccionada
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

// Actualiza la relación en Cropper (si está activo)
aspectRatioSelect.addEventListener('change', () => {
  if (cropper) {
    cropper.setAspectRatio(parseFloat(aspectRatioSelect.value));
  }
});

// Listener para mostrar u ocultar la vista previa según el checkbox de recorte
cropOption.addEventListener('change', () => {
  if (cropOption.checked) {
    // Si hay un solo archivo, mostrar la vista previa e inicializar Cropper
    if (selectedFiles.length === 1) {
      imageContainer.style.display = 'block';
      // Forzar inicialización si aún no existe
      if (!cropper && imageElement.src) {
        initializeCropper();
      }
    }
  } else {
    imageContainer.style.display = 'none';
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  }
});

// Eventos de drag & drop
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
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

// Función para simular el progreso y luego ejecutar el callback
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

// Obtiene el formato (MIME y extensión) del archivo original
function getOriginalFormat(fileType) {
  if (fileType === "image/jpeg") {
    return { mime: "image/jpeg", ext: "jpg" };
  } else if (fileType === "image/png") {
    return { mime: "image/png", ext: "png" };
  }
  return { mime: "image/png", ext: "png" };
}

// Procesa un único archivo (con recorte si está marcado)
function processSingleFileWithCropAndConvert() {
  // Si se ha marcado recortar pero no hay Cropper aún, se fuerza su inicialización y se reintenta luego
  if (cropOption.checked && !cropper) {
    initializeCropper();
    setTimeout(processSingleFileWithCropAndConvert, 300);
    return;
  }

  simulateProgress(() => {
    let canvas;
    if (cropOption.checked && cropper) {
      canvas = cropper.getCroppedCanvas();
    } else {
      canvas = document.createElement('canvas');
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageElement, 0, 0);
    }
    
    let outputData;
    let fileFormat;
    if (convertOption.checked) {
      outputData = canvas.toDataURL("image/webp", 0.25);
      fileFormat = { ext: "webp" };
    } else {
      const orig = getOriginalFormat(selectedFiles[0].type);
      outputData = canvas.toDataURL(orig.mime);
      fileFormat = orig;
    }
    
    const link = document.createElement('a');
    link.href = outputData;
    link.download = "imagen." + fileFormat.ext;
    link.textContent = "Descargar resultado";
    resultsContainer.appendChild(link);
    
    progressBar.value = 100;
    progressText.textContent = "100%";
  }, 1000);
}

// Procesa múltiples archivos (solo conversión, ya que recorte está deshabilitado)
function processMultipleFiles() {
  let processedCount = 0;
  const total = selectedFiles.length;
  
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        let outputData;
        let fileFormat;
        if (convertOption.checked) {
          outputData = canvas.toDataURL("image/webp", 0.6);
          fileFormat = { ext: "webp" };
        } else {
          const orig = getOriginalFormat(file.type);
          outputData = canvas.toDataURL(orig.mime);
          fileFormat = orig;
        }
        
        const link = document.createElement('a');
        link.href = outputData;
        link.download = "imagen_" + (index + 1) + "." + fileFormat.ext;
        link.textContent = "Descargar imagen " + (index + 1);
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

// Evento principal: Procesar imágenes
processButton.addEventListener('click', () => {
  if (!cropOption.checked && !convertOption.checked) {
    alert("Por favor, selecciona al menos una función (recortar o convertir).");
    return;
  }
  
  progressContainer.style.display = 'block';
  progressBar.value = 0;
  progressText.textContent = "0%";
  resultsContainer.innerHTML = "";
  
  if (selectedFiles.length === 1 && cropOption.checked) {
    processSingleFileWithCropAndConvert();
  } else {
    processMultipleFiles();
  }
});