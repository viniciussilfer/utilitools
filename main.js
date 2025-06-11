// Alterna entre seções
function showTool(id) {
  document.querySelectorAll('.tool-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// COMPRESSOR DE IMAGEM
const upload = document.getElementById('upload');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('preview-container');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');

let compressedBlob;

upload?.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  preview.src = URL.createObjectURL(file);
  originalSize.textContent = (file.size / 1024).toFixed(2) + ' KB';

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 1.0,
    alwaysKeepResolution: true
  };

  try {
    const compressedFile = await imageCompression(file, options);
    compressedBlob = compressedFile;

    compressedSize.textContent = (compressedFile.size / 1024).toFixed(2) + ' KB';
    previewContainer.style.display = 'block';

  } catch (e) {
    alert("Erro ao comprimir a imagem: " + e.message);
  }
});

downloadBtn?.addEventListener('click', () => {
  if (!compressedBlob) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(compressedBlob);
  link.download = 'imagem-comprimida.' + compressedBlob.type.split('/')[1];
  link.click();
});

// CONVERSOR DE FORMATO
const imgInput = document.getElementById('imgInput');
const formatSelect = document.getElementById('formatSelect');
const convertedImage = document.getElementById('convertedImage');
const convertedPreview = document.getElementById('convertedPreview');
const downloadConvertedBtn = document.getElementById('downloadConvertedBtn');

let convertedBlob = null;

imgInput?.addEventListener('change', () => {
  const file = imgInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const format = formatSelect.value;
      canvas.toBlob((blob) => {
        convertedBlob = blob;
        convertedImage.src = URL.createObjectURL(blob);
        convertedPreview.style.display = 'block';
      }, format, 0.92);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

downloadConvertedBtn?.addEventListener('click', () => {
  if (!convertedBlob) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(convertedBlob);
  link.download = 'imagem_convertida.' + formatSelect.value.split('/')[1];
  link.click();
});

// GERADOR DE PALETA DE CORES
function gerarPaletaAleatoria() {
  const baseHue = Math.floor(Math.random() * 360);
  const cores = [];
  for (let i = 0; i < 6; i++) {
    const hue = (baseHue + i * 30) % 360;
    cores.push(hslToHex(hue, 70, 60));
  }
  renderizarPaleta(cores);
}

function gerarPaletaBaseada() {
  const cor = document.getElementById('corBase').value;
  if (!/^#([0-9a-fA-F]{6})$/.test(cor)) {
    alert("Digite uma cor hexadecimal válida (ex: #1abc9c)");
    return;
  }
  const rgb = hexToRgb(cor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  let baseHue = Math.round(hsl.h * 360 + (Math.random() * 20 - 10)) % 360;
  if (baseHue < 0) baseHue += 360;

  const cores = [];
  for (let i = 0; i < 6; i++) {
    const hue = (baseHue + i * 30) % 360;
    cores.push(hslToHex(hue, 70, 60));
  }
  renderizarPaleta(cores);
}

function renderizarPaleta(cores) {
  const container = document.getElementById('paletaCores');
  container.innerHTML = '';
  cores.forEach(cor => {
    const div = document.createElement('div');
    div.className = 'col-4 col-md-2 mb-3';
    div.innerHTML = `
      <div class="color-box mb-1" style="background:${cor}" onclick="copiarCor('${cor}')" title="Clique para copiar"></div>
      <div class="hex-code text-center">${cor}</div>
    `;
    container.appendChild(div);
  });
}

function copiarCor(cor) {
  navigator.clipboard.writeText(cor);
  alert(`Cor ${cor} copiada!`);
}

// Funções auxiliares de cor
function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

// VALIDADOR DE CPF
function validarCPF() {
  const input = document.getElementById('cpfInput').value.replace(/[^\d]+/g, '');
  const resultado = document.getElementById('resultadoCPF');

  if (input.length !== 11 || /^(\d)\1+$/.test(input)) {
    resultado.textContent = "CPF inválido";
    resultado.style.color = 'red';
    return;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(input.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(input.charAt(9))) {
    resultado.textContent = "CPF inválido";
    resultado.style.color = 'red';
    return;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(input.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(input.charAt(10))) {
    resultado.textContent = "CPF inválido";
    resultado.style.color = 'red';
    return;
  }

  resultado.textContent = "CPF válido!";
  resultado.style.color = 'green';
}

// CONVERSOR DE LINK DO GOOGLE DRIVE
function converterDriveLink() {
  const input = document.getElementById('inputDriveLink').value.trim();
  const output = document.getElementById('outputDriveLink');
  const copiarBtn = document.getElementById('copiarBtn');

  const match = input.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  const id = match ? match[1] : null;

  if (id) {
    const directLink = `https://drive.google.com/uc?export=view&id=${id}`;
    output.value = directLink;
    output.style.display = 'block';
    copiarBtn.style.display = 'inline-block';
  } else {
    alert("Link inválido. Certifique-se de colar um link no formato correto do Google Drive.");
    output.style.display = 'none';
    copiarBtn.style.display = 'none';
  }
}

function copiarLink() {
  const output = document.getElementById('outputDriveLink');
  output.select();
  document.execCommand("copy");
  alert("Link copiado para a área de transferência!");
}