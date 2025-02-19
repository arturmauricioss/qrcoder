document.getElementById("qrForm").addEventListener("submit", function (event) {
  event.preventDefault();
  generateQRCode(); // Gera QR Code quando o formulário é enviado
});

// Função para gerar QR Code
function generateQRCode() {
  const link = document.getElementById("link").value;
  const iconFile = document.getElementById("icon").files[0];
  const qrCodeContainer = document.getElementById("qrCodeContainer");
  const qrCanvas = document.getElementById("qrCanvas");
  const downloadButton = document.getElementById("downloadButton");
  const shareButton = document.getElementById("shareButton");

  // Remove previous event listeners to avoid multiple downloads
  downloadButton.removeEventListener("click", downloadQRCode);

  QRCode.toCanvas(qrCanvas, link, { width: 200, margin: 1 }, function (error) {
    if (error) console.error(error);

    if (iconFile) {
      const ctx = qrCanvas.getContext("2d");
      const img = new Image();

      img.onload = function () {
        const iconSize = qrCanvas.width / 5;
        const iconX = (qrCanvas.width - iconSize) / 2;
        const iconY = (qrCanvas.height - iconSize) / 2;
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      };

      img.src = URL.createObjectURL(iconFile);
    }

    qrCodeContainer.classList.remove("hidden");
    downloadButton.classList.remove("hidden");
    shareButton.classList.remove("hidden");

    // Add new event listener for the download button
    downloadButton.addEventListener("click", downloadQRCode);

    shareButton.addEventListener("click", function () {
      qrCanvas.toBlob(function (blob) {
        const url = window.URL.createObjectURL(blob);
        if (navigator.share) {
          navigator
            .share({
              title: "QR Code",
              text: "Aqui está o QR Code gerado!",
              files: [new File([blob], "qrcode.png", { type: blob.type })],
            })
            .catch(console.error);
        } else {
          alert("Compartilhamento não suportado neste navegador.");
        }
        window.URL.revokeObjectURL(url);
      });
    });
  });
}

// Atualiza QR Code em tempo real enquanto o usuário digita
document.getElementById("link").addEventListener("input", generateQRCode);

document.getElementById("icon").addEventListener("change", function () {
  const fileLabel = document.querySelector(".file-label");
  const file = this.files[0];

  if (file) {
    const formattedName = formatFileName(file.name);
    fileLabel.textContent = formattedName;
  } else {
    fileLabel.textContent = "Escolher ícone";
  }
});

function formatFileName(fileName) {
  const maxLength = 20; // Número máximo de caracteres visíveis
  if (fileName.length > maxLength) {
    const start = fileName.substring(0, 7);
    const end = fileName.substring(fileName.length - 4);
    return `${start}..${end}`;
  }
  return fileName;
}

document.getElementById("testButton").addEventListener("click", function () {
  document.getElementById("uploadFile").click();
});

document
  .getElementById("uploadFile")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch("https://api.qrserver.com/v1/read-qr-code/", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (
            data &&
            data[0] &&
            data[0].symbol &&
            data[0].symbol[0] &&
            data[0].symbol[0].data
          ) {
            const qrCodeData = data[0].symbol[0].data;
            window.open(qrCodeData, "_blank"); // Abre o link em uma nova guia
          } else {
            alert("Nenhum QR Code detectado na imagem.");
          }
        })
        .catch((error) => {
          console.error("Erro ao ler o QR Code:", error);
          alert("Erro ao tentar ler o QR Code.");
        });
    }
  });

function downloadQRCode() {
  const qrCanvas = document.getElementById("qrCanvas");
  const link = document
    .getElementById("link")
    .value.replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  const fileName = `avallonqrcode_${link}.png`;

  qrCanvas.toBlob(function (blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  });
}
