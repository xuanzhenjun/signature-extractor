// 全局变量
let originalImage = null;
let currentThreshold = 128;

// DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const processingArea = document.getElementById('processingArea');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');
const thresholdSlider = document.getElementById('threshold');
const thresholdValue = document.getElementById('thresholdValue');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// 点击上传
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// 拖拽上传
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-purple-500', 'bg-purple-50');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-purple-500', 'bg-purple-50');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-purple-500', 'bg-purple-50');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    } else {
        alert('请上传图片文件！');
    }
});

// 文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
});

// 加载图片
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            displayOriginal();
            processImage();
            processingArea.classList.remove('hidden');
            processingArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 显示原图
function displayOriginal() {
    const ctx = originalCanvas.getContext('2d');
    const maxWidth = 600;
    const scale = Math.min(1, maxWidth / originalImage.width);
    originalCanvas.width = originalImage.width * scale;
    originalCanvas.height = originalImage.height * scale;
    ctx.drawImage(originalImage, 0, 0, originalCanvas.width, originalCanvas.height);
}

// 处理图片
function processImage() {
    const ctx = processedCanvas.getContext('2d');
    const maxWidth = 600;
    const scale = Math.min(1, maxWidth / originalImage.width);
    processedCanvas.width = originalImage.width * scale;
    processedCanvas.height = originalImage.height * scale;
    ctx.drawImage(originalImage, 0, 0, processedCanvas.width, processedCanvas.height);
    
    const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > currentThreshold) {
            data[i + 3] = 0;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

// 阈值调整
thresholdSlider.addEventListener('input', (e) => {
    currentThreshold = parseInt(e.target.value);
    thresholdValue.textContent = currentThreshold;
    processImage();
});

// 下载
downloadBtn.addEventListener('click', () => {
    processedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signature-transparent.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
});

// 重置
resetBtn.addEventListener('click', () => {
    processingArea.classList.add('hidden');
    fileInput.value = '';
    originalImage = null;
    currentThreshold = 128;
    thresholdSlider.value = 128;
    thresholdValue.textContent = 128;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
