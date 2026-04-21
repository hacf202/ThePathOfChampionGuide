/**
 * Compresses and resizes an image to ensure it fits within storage limits.
 * @param {string} dataUrl - The original image data URL.
 * @param {number} maxWidth - Maximum width for the resized image.
 * @param {number} maxHeight - Maximum height for the resized image.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {Promise<string>} - A promise that resolves with the compressed data URL.
 */
export const compressImage = (dataUrl, maxWidth = 1920, maxHeight = 1080, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Use webp if supported, fallback to jpeg for compression
            const resultUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(resultUrl);
        };
        img.onerror = (err) => reject(err);
    });
};

/**
 * Calculates the approximate size of a Base64 string in MB.
 * @param {string} base64String 
 * @returns {number} 
 */
export const getBase64SizeMB = (base64String) => {
    if (!base64String) return 0;
    const stringLength = base64String.length - (base64String.indexOf(",") + 1);
    const sizeInBytes = (stringLength * 3) / 4;
    return sizeInBytes / (1024 * 1024);
};
