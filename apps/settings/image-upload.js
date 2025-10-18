// 图片上传管理
export class ImageUploadManager {
    constructor(storage) {
        this.storage = storage;
        this.storageKey = 'phone_images';
    }
    
    // 加载所有图片
    loadImages() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('加载图片失败:', e);
        }
        return {
            wallpaper: null,  // 壁纸
            appIcons: {},     // APP图标 {appId: base64}
            avatars: {}       // 角色头像 {characterId: base64}
        };
    }
    
    // 保存图片
    saveImages(images) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(images));
            console.log('✅ 图片已保存');
        } catch (e) {
            console.error('❌ 图片保存失败:', e);
            if (e.name === 'QuotaExceededError') {
                alert('存储空间已满！请删除一些图片。');
            }
        }
    }
    
    // 上传壁纸
    async uploadWallpaper(file) {
        return this.processImage(file, (base64) => {
            const images = this.loadImages();
            images.wallpaper = base64;
            this.saveImages(images);
            return base64;
        });
    }
    
    // 上传APP图标
    async uploadAppIcon(appId, file) {
        return this.processImage(file, (base64) => {
            const images = this.loadImages();
            images.appIcons[appId] = base64;
            this.saveImages(images);
            return base64;
        });
    }
    
    // 上传角色头像
    async uploadAvatar(characterId, file) {
        return this.processImage(file, (base64) => {
            const images = this.loadImages();
            images.avatars[characterId] = base64;
            this.saveImages(images);
            return base64;
        });
    }
    
    // 处理图片
    async processImage(file, callback) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('请选择图片文件'));
                return;
            }
            
            // 限制文件大小为2MB
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error('图片大小不能超过2MB'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 压缩图片
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // 最大尺寸限制
                    const maxSize = 800;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(callback(base64));
                };
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('图片读取失败'));
            reader.readAsDataURL(file);
        });
    }
    
    // 删除壁纸
    deleteWallpaper() {
        const images = this.loadImages();
        images.wallpaper = null;
        this.saveImages(images);
    }
    
    // 删除APP图标
    deleteAppIcon(appId) {
        const images = this.loadImages();
        delete images.appIcons[appId];
        this.saveImages(images);
    }
    
    // 删除头像
    deleteAvatar(characterId) {
        const images = this.loadImages();
        delete images.avatars[characterId];
        this.saveImages(images);
    }
    
    // 获取壁纸
    getWallpaper() {
        const images = this.loadImages();
        return images.wallpaper;
    }
    
    // 获取APP图标
    getAppIcon(appId) {
        const images = this.loadImages();
        return images.appIcons[appId];
    }
    
    // 获取头像
    getAvatar(characterId) {
        const images = this.loadImages();
        return images.avatars[characterId];
    }
}
