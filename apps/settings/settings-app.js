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
    
    // 加载壁纸和颜色设置
const wallpaper = this.imageManager.getWallpaper();
const timeColor = this.storage.get('phone-time-color', true) || '#ffffff';
const appNameColor = this.storage.get('phone-app-name-color', true) || '#ffffff';
    
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
                    
                    <!-- 壁纸设置 -->
                    <div class="setting-item">
                        <div class="setting-label">手机壁纸</div>
                        <div class="setting-desc">支持jpg/png，最大2MB</div>
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <label for="upload-wallpaper" class="setting-btn" style="flex: 1; background: #667eea; cursor: pointer; color: #fff;">
                                <i class="fa-solid fa-upload"></i> 选择壁纸
                            </label>
                            <input type="file" id="upload-wallpaper" accept="image/*" style="display: none;">
                            <button id="delete-wallpaper" class="setting-btn" style="flex: 1; background: #f44336; color: #fff;">
                                <i class="fa-solid fa-trash"></i> 删除
                            </button>
                        </div>
                        <div id="wallpaper-preview" style="margin-top: 10px; max-height: 100px; overflow: hidden; border-radius: 8px; ${wallpaper ? '' : 'display: none;'}">
                            <img src="${wallpaper || ''}" style="width: 100%; height: auto; display: ${wallpaper ? 'block' : 'none'};">
                        </div>
                    </div>
                    
                    <!-- APP图标设置 -->
                    <div class="setting-item">
                        <div class="setting-label">自定义APP图标</div>
                        <div class="setting-desc">点击APP选择图片替换图标</div>
                        <div class="app-icon-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                            ${this.renderAppIconUpload()}
                        </div>
                    </div>
                </div>
                
                <!-- 🎨 新增：文字颜色设置 -->
                <div class="setting-section">
                    <div class="setting-section-title">🎨 文字颜色</div>
                    
                    <!-- 时间颜色 -->
                    <div class="setting-item">
                        <div class="setting-toggle">
                            <div>
                                <div class="setting-label">时间颜色</div>
                                <div class="setting-desc">设置主屏幕时间显示的颜色</div>
                            </div>
                            <input type="color" 
                                   id="time-color-picker" 
                                   value="${timeColor}" 
                                   class="color-picker-input">
                        </div>
                    </div>
                    
                    <!-- 图标文字颜色 -->
                    <div class="setting-item">
                        <div class="setting-toggle">
                            <div>
                                <div class="setting-label">图标文字颜色</div>
                                <div class="setting-desc">设置APP图标下方文字的颜色</div>
                            </div>
                            <input type="color" 
                                   id="app-name-color-picker" 
                                   value="${appNameColor}" 
                                   class="color-picker-input">
                        </div>
                    </div>
                    
                    <!-- 快速预设 -->
                    <div class="setting-item">
                        <div class="setting-label" style="margin-bottom: 10px;">🎯 快速预设</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="preset-color-btn" data-preset="dark">
                                深色壁纸（白色文字）
                            </button>
                            <button class="preset-color-btn" data-preset="light">
                                浅色壁纸（深色文字）
                            </button>
                            <button class="preset-color-btn" data-preset="reset">
                                🔄 恢复默认
                            </button>
                        </div>
                    </div>
                    
                    <div class="setting-info">
                        💡 如果壁纸是浅色，建议使用深色文字；如果壁纸是深色，建议使用白色文字
                    </div>
                </div>
                
                <!-- 互动模式 -->
<div class="setting-section">
    <div class="setting-section-title">📡 互动模式</div>
    
    <div class="setting-item setting-toggle">
        <div>
            <div class="setting-label">在线模式</div>
            <div class="setting-desc">启用后可通过手机与AI互动</div>
        </div>
        <label class="toggle-switch">
            <input type="checkbox" id="setting-online-mode" ${this.settings.onlineMode ? 'checked' : ''}>
            <span class="toggle-slider"></span>
        </label>
    </div>
    
    <div class="setting-info">
        <strong>使用说明：</strong><br>
        1. 开启"在线模式"<br>
        2. 在微信设置中配置各功能提示词<br>
        3. 在手机APP中发送消息，AI会自动回复
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
            
            <!-- 提示词编辑器弹窗 -->
            <div id="prompt-editor-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                 background: rgba(0,0,0,0.8); z-index: 10000; overflow-y: auto;">
                <div style="max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0;">📝 手机互动提示词模板</h3>
                        <button id="close-prompt-editor" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">提示词内容：</label>
                        <textarea id="prompt-template" style="width: 100%; height: 300px; padding: 10px; 
                                 border: 1px solid #ddd; border-radius: 8px; font-family: monospace; font-size: 12px;">${this.getDefaultPrompt()}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button id="copy-prompt" class="setting-btn" style="flex: 1; background: #667eea; color: #fff;">
                            <i class="fa-solid fa-copy"></i> 复制到剪贴板
                        </button>
                        <button id="save-prompt" class="setting-btn" style="flex: 1; background: #52c41a; color: #fff;">
                            <i class="fa-solid fa-save"></i> 保存模板
                        </button>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 10px; background: #f0f9ff; border-radius: 6px; font-size: 12px;">
                        <strong>📌 使用步骤：</strong><br>
                        1. 点击"复制到剪贴板"<br>
                        2. 打开角色卡编辑器<br>
                        3. 粘贴到"角色描述"或"场景"中<br>
                        4. 保存角色卡
                    </div>
                </div>
            </div>
        `;
        
        this.phoneShell.setContent(html);
        this.bindEvents();
    }
    
   // 渲染APP图标上传
renderAppIconUpload() {
    // 从APPS配置中获取，而不是从window.VirtualPhone
    const APPS = [
        { id: 'wechat', name: '微信', icon: '💬', color: '#07c160' },
        { id: 'browser', name: '浏览器', icon: '🌐', color: '#1890ff' },
        { id: 'photos', name: '相册', icon: '📷', color: '#ff4d4f' },
        { id: 'games', name: '游戏', icon: '🎮', color: '#722ed1' },
        { id: 'music', name: '音乐', icon: '🎵', color: '#eb2f96' },
        { id: 'notes', name: '备忘录', icon: '📝', color: '#faad14' },
        { id: 'calendar', name: '日历', icon: '📅', color: '#52c41a' },
        { id: 'settings', name: '设置', icon: '⚙️', color: '#8c8c8c' }
    ];
    
    return APPS.map(app => {
        const customIcon = this.imageManager.getAppIcon(app.id);
        return `
            <div class="upload-app-icon-item" data-app="${app.id}" style="text-align: center;">
                <label for="upload-icon-${app.id}" style="cursor: pointer; display: block;">
                    <div style="width: 50px; height: 50px; border-radius: 12px; background: ${app.color}; 
                                display: flex; align-items: center; justify-content: center; margin: 0 auto;
                                ${customIcon ? `background-image: url('${customIcon}'); background-size: cover; background-position: center;` : ''}
                                font-size: 26px;">
                        ${customIcon ? '' : app.icon}
                    </div>
                    <div style="font-size: 10px; margin-top: 4px; color: #666;">${app.name}</div>
                </label>
                <input type="file" id="upload-icon-${app.id}" accept="image/*" style="display: none;" class="app-icon-upload" data-app-id="${app.id}">
            </div>
        `;
    }).join('');
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
        document.getElementById('delete-wallpaper')?.addEventListener('click', async () => {  // ← 加 async
        if (!confirm('确定删除壁纸吗？')) return;
    
        await this.imageManager.deleteWallpaper();  // ← 加 await
            
            const preview = document.getElementById('wallpaper-preview');
            preview.style.display = 'none';
            preview.querySelector('img').style.display = 'none';
            
            // 通知主屏幕更新
            window.dispatchEvent(new CustomEvent('phone:updateWallpaper', { 
                detail: { wallpaper: null } 
            }));
            
            alert('✅ 壁纸已删除！');
        });
        
        // APP图标上传
        document.querySelectorAll('.app-icon-upload').forEach(input => {
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const appId = e.target.id.replace('upload-icon-', '');
                
                try {
                    await this.imageManager.uploadAppIcon(appId, file);
                    alert('✅ 图标上传成功！');
                    this.render(); // 重新渲染设置页面
                    
                    // 通知主屏幕更新
                    if (window.VirtualPhone?.home) {
                        window.VirtualPhone.home.render();
                    }
                } catch (err) {
                    alert('❌ 上传失败：' + err.message);
                }
                
                e.target.value = '';
            });
        });
        
        // 在线模式切换
        document.getElementById('setting-online-mode')?.addEventListener('change', (e) => {
            this.settings.onlineMode = e.target.checked;
            this.storage.saveSettings(this.settings);
            console.log('✅ 在线模式:', this.settings.onlineMode ? '已开启' : '已关闭');
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

        // 🎨 颜色设置事件
        
        /// 时间颜色选择器
document.getElementById('time-color-picker')?.addEventListener('input', async (e) => {
    const color = e.target.value;
    await this.storage.set('phone-time-color', color, true);  // ← 确保是 true
    this.applyColors();
});

// 图标文字颜色选择器
document.getElementById('app-name-color-picker')?.addEventListener('input', async (e) => {
    const color = e.target.value;
    await this.storage.set('phone-app-name-color', color, true);  // ← 确保是 true
    this.applyColors();
});
        
        // 预设按钮
        document.querySelectorAll('.preset-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                
                let timeColor, appNameColor;
                
                if (preset === 'dark') {
                    timeColor = '#ffffff';
                    appNameColor = '#ffffff';
                } else if (preset === 'light') {
                    timeColor = '#000000';
                    appNameColor = '#000000';
                } else if (preset === 'reset') {
                    timeColor = '#ffffff';
                    appNameColor = '#ffffff';
                }
                
                if (timeColor && appNameColor) {
                    this.storage.set('phone-time-color', timeColor);
                    this.storage.set('phone-app-name-color', appNameColor);
                    
                    const timePicker = document.getElementById('time-color-picker');
                    const appNamePicker = document.getElementById('app-name-color-picker');
                    if (timePicker) timePicker.value = timeColor;
                    if (appNamePicker) appNamePicker.value = appNameColor;
                    
                    this.applyColors();
                }
            });
        });
    }

    // 🎨 应用颜色到页面的方法
    applyColors() {
        const timeColor = this.storage.get('phone-time-color') || '#ffffff';
        const appNameColor = this.storage.get('phone-app-name-color') || '#ffffff';
        
        document.documentElement.style.setProperty('--phone-time-color', timeColor);
        document.documentElement.style.setProperty('--phone-app-name-color', appNameColor);
        
        const timeShadow = this.isLightColor(timeColor) 
            ? '0 2px 8px rgba(255, 255, 255, 0.4), 0 1px 4px rgba(255, 255, 255, 0.2)' 
            : '0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)';
        
        const appNameShadow = this.isLightColor(appNameColor) 
            ? '0 1px 4px rgba(255, 255, 255, 0.4)' 
            : '0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5)';
        
        document.documentElement.style.setProperty('--phone-time-shadow', timeShadow);
        document.documentElement.style.setProperty('--phone-app-name-shadow', appNameShadow);
        
        console.log('✅ 颜色已应用:', { timeColor, appNameColor });
    }

    // 🎨 判断颜色是否为浅色
    isLightColor(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
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
