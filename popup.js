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

// Función para manejar la selección de archivos
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
    // Mostrar la vista previa SOLO si el checkbox de recorte está checked
    if (cropOption.checked) {
      imageContainer.style.display = 'block';
    } else {
      imageContainer.style.display = 'none';
    }
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      imageElement.src = event.target.result;
      // Inicializa Cropper solo si se ha marcado recorte
      if (cropOption.checked) {
        imageElement.onload = initializeCropper;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Inicializar Cropper con la relación seleccionada
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

// Actualizar la relación en Cropper (si está activo)
aspectRatioSelect.addEventListener('change', () => {
  if (cropper) {
    cropper.setAspectRatio(parseFloat(aspectRatioSelect.value));
  }
});

// Mostrar u ocultar la vista previa según el checkbox de recorte
cropOption.addEventListener('change', () => {
  if (cropOption.checked) {
    // Si hay un solo archivo, mostrar la vista previa e inicializar Cropper
    if (selectedFiles.length === 1) {
      imageContainer.style.display = 'block';
      if (imageElement.src) {
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

// Eventos para drag & drop
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

// Función para simular progreso (se actualiza gradualmente hasta cierto porcentaje)
function simulateProgress(callback, duration = 1000) {
  let progress = 0;
  progressBar.value = progress;
  progressText.textContent = progress + "%";
  const interval = setInterval(() => {
    progress += 10;
    // Llega hasta el 90% durante la simulación; al final se ajusta al 100%
    if (progress > 90) progress = 90;
    progressBar.value = progress;
    progressText.textContent = progress + "%";
  }, duration / 10);
  setTimeout(() => {
    clearInterval(interval);
    callback();
  }, duration);
}

// Función para obtener el MIME type y extensión del archivo original
function getOriginalFormat(fileType) {
  if (fileType === "image/jpeg") {
    return { mime: "image/jpeg", ext: "jpg" };
  } else if (fileType === "image/png") {
    return { mime: "image/png", ext: "png" };
  }
  // Por defecto, usar PNG
  return { mime: "image/png", ext: "png" };
}

// Procesar un único archivo (con recorte si está marcado)
function processSingleFileWithCropAndConvert() {
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
    // Si se ha marcado la opción de conversión a WEBP, usamos esa opción con calidad ajustada.
    if (convertOption.checked) {
      outputData = canvas.toDataURL("image/webp", 0.6);
      fileFormat = { ext: "webp" };
    } else {
      // En caso contrario, se mantiene el formato original del archivo
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

// Procesar múltiples archivos (solo conversión, ya que el recorte está deshabilitado)
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
  // Verificar que al menos una función esté seleccionada
  if (!cropOption.checked && !convertOption.checked) {
    alert("Por favor, selecciona al menos una función (recortar o convertir).");
    return;
  }
  
  // Mostrar el contenedor de progreso y reiniciar valores
  progressContainer.style.display = 'block';
  progressBar.value = 0;
  progressText.textContent = "0%";
  resultsContainer.innerHTML = "";
  
  // Modo único: si hay un solo archivo y se ha seleccionado el recorte, se procesa con recorte.
  // De lo contrario, se procesa en modo lote (conversión sin recorte)
  if (selectedFiles.length === 1 && cropOption.checked) {
    processSingleFileWithCropAndConvert();
  } else {
    processMultipleFiles();
  }
});