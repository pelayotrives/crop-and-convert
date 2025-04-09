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

  if (selectedFiles.length > 1) {
    // Si hay múltiples archivos, deshabilitamos recortar y ocultamos la vista previa.
    cropOption.checked = false;
    cropOption.disabled = true;
    aspectRatioSelect.disabled = true;
    imageContainer.style.display = 'none';
  } else if (selectedFiles.length === 1) {
    cropOption.disabled = false;
    aspectRatioSelect.disabled = false;
    // Si la opción de recorte está marcada, mostramos la vista previa.
    if (cropOption.checked) {
      imageContainer.style.display = 'block';
    } else {
      imageContainer.style.display = 'none';
    }
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      imageElement.src = event.target.result;
      // Si se quiere recortar, iniciar Cropper después de cargar la imagen
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

// Evento para actualizar la relación (solo afecta si Cropper está activo)
aspectRatioSelect.addEventListener('change', () => {
  if (cropper) {
    cropper.setAspectRatio(parseFloat(aspectRatioSelect.value));
  }
});

// Evento para mostrar u ocultar la vista previa según la opción de recorte
cropOption.addEventListener('change', () => {
  if (cropOption.checked) {
    // Si hay un solo archivo, mostrar la vista previa e inicializar Cropper si la imagen está cargada
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

// Evento principal: Procesar imágenes
processButton.addEventListener('click', () => {
  // Verificar que se haya seleccionado al menos una función
  if (!cropOption.checked && !convertOption.checked) {
    alert("Por favor, selecciona al menos una función (recortar o convertir).");
    return;
  }
  
  // Mostrar el contenedor de progreso y reiniciar
  progressContainer.style.display = 'block';
  progressBar.value = 0;
  progressText.textContent = "0%";
  resultsContainer.innerHTML = "";
  
  // Si hay un solo archivo y se ha seleccionado la opción de recorte, se procesa en modo único
  if (selectedFiles.length === 1 && cropOption.checked) {
    processSingleFileWithCropAndConvert();
  } else {
    // Caso de múltiples archivos o cuando no se ha seleccionado recorte
    processMultipleFiles();
  }
});

// Función que simula el progreso y procesa un único archivo (con recorte si está seleccionado)
function processSingleFileWithCropAndConvert() {
  let progress = 0;
  progressBar.value = progress;
  progressText.textContent = progress + "%";
  
  // Simulamos progreso en intervalos
  const interval = setInterval(() => {
    progress += 10;
    if (progress > 90) progress = 90;
    progressBar.value = progress;
    progressText.textContent = progress + "%";
  }, 100);
  
  // Simulamos procesamiento que tarda 1 segundo
  setTimeout(() => {
    clearInterval(interval);
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
    if (convertOption.checked) {
      outputData = canvas.toDataURL("image/webp", 0.92);
    } else {
      outputData = canvas.toDataURL("image/png");
    }
    
    const link = document.createElement('a');
    link.href = outputData;
    link.download = convertOption.checked ? "imagen.webp" : "imagen.png";
    link.textContent = "Descargar resultado";
    resultsContainer.appendChild(link);
    
    progressBar.value = 100;
    progressText.textContent = "100%";
  }, 1000);
}

// Función para procesar múltiples archivos (solo conversión, ya que recorte no está habilitado)
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
        if (convertOption.checked) {
          outputData = canvas.toDataURL("image/webp", 0.92);
        } else {
          outputData = canvas.toDataURL("image/png");
        }
        
        const link = document.createElement('a');
        link.href = outputData;
        link.download = convertOption.checked ? `imagen_${index+1}.webp` : `imagen_${index+1}.png`;
        link.textContent = `Descargar imagen ${index+1}`;
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