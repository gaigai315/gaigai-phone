// 设置APP
import { ImageUploadManager } from './image-upload.js';

export class SettingsApp {
    constructor(phoneShell, storage, settings) {
        this.phoneShell = phoneShell;
        this.storage = storage;
        this.settings = settings;
        this.imageManager = new ImageUploadManager(storage);
    }
    
    render() {
        const context = this.storage.getContext();
        const charName = context?.name2 || context?.characterId || '未知';
        
        // 加载壁纸
        const wallpaper = this.imageManager.getWallpaper();
        
        const html = `
            <div class="settings-app">
                <div class="app-header">
                    <button class="app-back-btn" id="settings-back">← 返回</button>
                    <h2>⚙️ 设置</h2>
                </div>
                
                <div class="app-body">
                    <!-- 当前角色信息 -->
                    <div class="setting-section">
                        <div class="setting-section-title">📱 当前角色</div>
                        <div class="setting-item">
                            <div class="setting-label">角色名称</div>
                            <div class="setting-value">${charName}</div>
                        </div>
                    </div>
                    
                    <!-- 个性化设置 -->
                    <div class="setting-section">
                        <div class="setting-section-title">🎨 个性化</div>
                        
                        <div class="setting-item">
                            <div class="setting-label">手机壁纸</div>
                            <div class="setting-desc">支持jpg/png，最大2MB</div>
                            <div style="margin-top: 10px; display: flex; gap: 10px;">
                                <label for="upload-wallpaper" class="setting-btn" style="flex: 1; background: #667eea; cursor: pointer;">
                                    <i class="fa-solid fa-upload"></i> 选择壁纸
                                </label>
                                <input type="file" id="upload-wallpaper" accept="image/*" style="display: none;">
                                <button id="delete-wallpaper" class="setting-btn" style="flex: 1; background: #f44336;">
                                    <i class="fa-solid fa-trash"></i> 删除
                                </button>
                            </div>
                            <div id="wallpaper-preview" style="margin-top: 10px; max-height: 100px; overflow: hidden; border-radius: 8px; ${wallpaper ? '' : 'display: none;'}">
                                <img src="${wallpaper || ''}" style="width: 100%; height: auto; display: ${wallpaper ? 'block' : 'none'};">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 功能设置 -->
                    <div class="setting-section">
                        <div class="setting-section-title">🔧 功能设置</div>
                        
                        <div class="setting-item setting-toggle">
                            <div>
                                <div class="setting-label">手机功能</div>
                                <div class="setting-desc">关闭后不接收手机消息（古代背景）</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-enabled" ${this.settings.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item setting-toggle">
                            <div>
                                <div class="setting-label">提示音</div>
                                <div class="setting-desc">收到消息时播放提示音</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-sound" ${this.settings.soundEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item setting-toggle">
                            <div>
                                <div class="setting-label">震动效果</div>
                                <div class="setting-desc">收到消息时手机震动</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-vibration" ${this.settings.vibrationEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- 数据管理 -->
                    <div class="setting-section">
                        <div class="setting-section-title">💾 数据管理</div>
                        
                        <div class="setting-item setting-button">
                            <button class="setting-btn setting-btn-warning" id="clear-current-data">
                                <i class="fa-solid fa-trash"></i>
                                清空当前角色数据
                            </button>
                        </div>
                        
                        <div class="setting-item setting-button">
                            <button class="setting-btn setting-btn-danger" id="clear-all-data">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                清空所有角色数据
                            </button>
                        </div>
                    </div>
                    
                    <!-- 关于 -->
                    <div class="setting-section">
                        <div class="setting-section-title">ℹ️ 关于</div>
                        <div class="setting-item">
                            <div class="setting-label">版本</div>
                            <div class="setting-value">v1.0.0</div>
                        </div>
                        <div class="setting-info">
                            每个角色的手机数据独立存储<br>
                            切换角色时自动加载对应的数据
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.phoneShell.setContent(html);
        this.bindEvents();
    }
    
    bindEvents() {
        // 返回按钮
        document.getElementById('settings-back')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('phone:goHome'));
        });
        
        // 上传壁纸
        document.getElementById('upload-wallpaper')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const base64 = await this.imageManager.uploadWallpaper(file);
                
                // 更新预览
                const preview = document.getElementById('wallpaper-preview');
                const img = preview.querySelector('img');
                preview.style.display = 'block';
                img.style.display = 'block';
                img.src = base64;
                
                // 通知主屏幕更新
                window.dispatchEvent(new CustomEvent('phone:updateWallpaper', { 
                    detail: { wallpaper: base64 } 
                }));
                
                alert('✅ 壁纸上传成功！');
            } catch (err) {
                alert('❌ 上传失败：' + err.message);
            }
            
            // 清空input，允许重复选择同一文件
            e.target.value = '';
        });
        
        // 删除壁纸
        document.getElementById('delete-wallpaper')?.addEventListener('click', () => {
            if (!confirm('确定删除壁纸吗？')) return;
            
            this.imageManager.deleteWallpaper();
            
            const preview = document.getElementById('wallpaper-preview');
            preview.style.display = 'none';
            preview.querySelector('img').style.display = 'none';
            
            // 通知主屏幕更新
            window.dispatchEvent(new CustomEvent('phone:updateWallpaper', { 
                detail: { wallpaper: null } 
            }));
            
            alert('✅ 壁纸已删除！');
        });
        
        // 功能开关（自动保存）
        ['setting-enabled', 'setting-sound', 'setting-vibration'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                if (id === 'setting-enabled') this.settings.enabled = e.target.checked;
                if (id === 'setting-sound') this.settings.soundEnabled = e.target.checked;
                if (id === 'setting-vibration') this.settings.vibrationEnabled = e.target.checked;
                
                this.storage.saveSettings(this.settings);
                console.log('✅ 设置已自动保存');
                
                if (id === 'setting-enabled') {
                    this.updatePhoneIcon();
                }
            });
        });
        
        // 清空当前角色数据
        document.getElementById('clear-current-data')?.addEventListener('click', () => {
            if (confirm('确定清空当前角色的所有手机数据？\n\n此操作不可恢复！')) {
                window.dispatchEvent(new CustomEvent('phone:clearCurrentData'));
                alert('✅ 数据已清空！');
            }
        });
        
        // 清空所有数据
        document.getElementById('clear-all-data')?.addEventListener('click', () => {
            if (confirm('⚠️ 警告！\n\n确定清空所有角色的手机数据？\n此操作将删除所有聊天记录、消息、联系人等！\n\n此操作不可恢复！')) {
                if (confirm('再次确认：真的要删除所有数据吗？')) {
                    window.dispatchEvent(new CustomEvent('phone:clearAllData'));
                    alert('✅ 所有数据已清空！');
                }
            }
        });
    }
    
    updatePhoneIcon() {
        const icon = document.getElementById('phoneDrawerIcon');
        if (icon) {
            if (this.settings.enabled) {
                icon.style.opacity = '1';
                icon.style.filter = 'none';
                icon.title = '虚拟手机 (已启用)';
            } else {
                icon.style.opacity = '0.4';
                icon.style.filter = 'grayscale(1)';
                icon.title = '虚拟手机 (已禁用)';
            }
        }
    }
}
