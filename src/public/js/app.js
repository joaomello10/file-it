const dropArea = document.getElementById("drop-area");
const fileElem = document.getElementById("fileElem");

// Impede a propagação do evento de arrastar e soltar
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Destaca a área de drop quando um arquivo é arrastado
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

// Processa os arquivos arrastados
dropArea.addEventListener("drop", handleDrop, false);

// Funcionalidade de clique para seleção de arquivos
fileElem.addEventListener("change", () => handleFiles(fileElem.files), false);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add("border-blue-500");
}

function unhighlight() {
  dropArea.classList.remove("border-blue-500");
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleFiles(files) {
  const fileArray = Array.from(files);
  fileArray.forEach((file) => {
    // Enviar arquivo ao servidor
    uploadFile(file);
  });
}

function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload", {
    // Substitua '/upload' pela sua URL de endpoint do servidor
    method: "POST",
    body: formData,
  }).then(() => {
    document.querySelector("#sc").style.opacity = 1;
    setTimeout(() => {
      location.reload();
    }, 1000);
  });
}
