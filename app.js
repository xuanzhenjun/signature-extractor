// 处理图片 - 去除背景
function processImage() {
    const ctx = processedCanvas.getContext('2d');
    processedCanvas.width = originalImage.width;
    processedCanvas.height = originalImage.height;
    
    // 绘制原图
    ctx.drawImage(originalImage, 0, 0);
    
    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;
    
    // 遍历每个像素
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 计算亮度（浅色背景检测）
        const brightness = (r + g + b) / 3;
        
        // 如果是浅色（接近白色），设为透明
        if (brightness > currentThreshold) {
            data[i + 3] = 0; // 设置 alpha 为 0（透明）
        }
    }
    
    // 更新画布
    ctx.putImageData(imageData, 0, 0);
}

// 阈值调整
thresholdSlider.addEventListener('input', (e) => {
    currentThreshold = parseInt(e.target.value);
    thresholdValue.textContent = currentThreshold;
    processImage();
});

// 下载图片
downloadBtn.addEventListener('click', () => {
    processedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signature-transparent.png';
        a.click();
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
});
