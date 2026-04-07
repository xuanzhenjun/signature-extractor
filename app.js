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
const chooseBtn = document.getElementById('chooseBtn');

// 点击整个 dropZone 或 chooseBtn 都打开文件选择框（同一个 click，不重复触发）
function openFilePicker(e) {
    e.stopPropagation();
    fileInput.click();
}
dropZone.addEventListener('click', openFilePicker);

// 拖拽上传
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#6c47ff';
    dropZone.style.background = '#f9f7ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#d4d4d4';
    dropZone.style.background = 'transparent';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#d4d4d4';
    dropZone.style.background = 'transparent';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    } else {
        alert('Please upload an image file!');
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
            // 隐藏上传区域，显示处理区域
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('processingArea').style.display = 'block';
            document.getElementById('processingArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        img.onerror = () => {
            console.error('Image failed to load from FileReader result');
        };
        img.src = e.target.result;
    };
    reader.onerror = (e) => {
        console.error('FileReader error:', e);
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
if (thresholdSlider) {
    thresholdSlider.addEventListener('input', (e) => {
        currentThreshold = parseInt(e.target.value);
        if (thresholdValue) thresholdValue.textContent = currentThreshold;
        processImage();
    });
}

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
    document.getElementById('processingArea').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    fileInput.value = '';
    originalImage = null;
    currentThreshold = 128;
    thresholdSlider.value = 128;
    thresholdValue.textContent = 128;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
