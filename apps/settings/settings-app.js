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
                            <div class="app-icon-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;">
                                ${this.renderAppIconUpload()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 互动模式 -->
                    <div class="setting-section">
                        <div class="setting-section-title">📡 互动模式</div>
                        
                        <div class="setting-item setting-toggle">
                            <div>
                                <div class="setting-label">在线模式</div>
                                <div class="setting-desc">启用后可通过手机与AI互动（需要设置提示词）</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-online-mode" ${this.settings.onlineMode ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <button class="setting-btn" id="open-prompt-editor" style="background: #667eea; color: #fff; width: 100%;">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                                编辑提示词模板
                            </button>
                        </div>
                        
                        <div class="setting-info">
                            <strong>使用说明：</strong><br>
                            1. 点击"编辑提示词"，将模板添加到角色卡<br>
                            2. 开启"在线模式"<br>
                            3. 在手机APP中发送消息，AI会自动回复到手机界面<br>
                            4. 古代背景建议关闭"手机功能"
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
        const apps = window.VirtualPhone?.home?.apps || [];
        return apps.map(app => {
            const customIcon = this.imageManager.getAppIcon(app.id);
            return `
                <div class="upload-app-icon-item" data-app="${app.id}" style="text-align: center;">
                    <label for="upload-icon-${app.id}" style="cursor: pointer;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: ${app.color}; 
                                    display: flex; align-items: center; justify-content: center; margin: 0 auto;
                                    background-image: url('${customIcon || ''}'); 
                                    background-size: cover; background-position: center;">
                            ${customIcon ? '' : app.icon}
                        </div>
                        <div style="font-size: 10px; margin-top: 4px;">${app.name}</div>
                    </label>
                    <input type="file" id="upload-icon-${app.id}" accept="image/*" style="display: none;" class="app-icon-upload">
                </div>
            `;
        }).join('');
    }
    
    // 获取默认提示词模板
    getDefaultPrompt() {
        return this.settings.promptTemplate || `# 虚拟手机互动系统

当{{user}}使用手机发送消息时（消息以 [📱手机] 开头），你需要用以下格式回复：

<Phone>
{
  "app": "wechat",
  "action": "receiveMessage",
  "data": {
    "from": "{{char}}",
    "message": "你的回复内容（正常对话即可）",
    "avatar": "😊",
    "timestamp": "刚刚"
  }
}
</Phone>

## 示例

用户发送：[📱手机] 在吗？
你的回复：
<Phone>
{
  "app": "wechat",
  "action": "receiveMessage",
  "data": {
    "from": "{{char}}",
    "message": "在呢！有什么事吗？",
    "avatar": "😊",
    "timestamp": "刚刚"
  }
}
</Phone>

## 注意
- 只在消息有 [📱手机] 前缀时使用此格式
- 消息内容用自然语气，符合角色性格
- 可以发送表情、贴图等`;
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
        
        // 打开提示词编辑器
        document.getElementById('open-prompt-editor')?.addEventListener('click', () => {
            document.getElementById('prompt-editor-modal').style.display = 'block';
        });
        
        // 关闭编辑器
        document.getElementById('close-prompt-editor')?.addEventListener('click', () => {
            document.getElementById('prompt-editor-modal').style.display = 'none';
        });
        
        // 复制提示词
        document.getElementById('copy-prompt')?.addEventListener('click', () => {
            const textarea = document.getElementById('prompt-template');
            textarea.select();
            document.execCommand('copy');
            alert('✅ 已复制到剪贴板！\n\n请粘贴到角色卡的"角色描述"或"场景"中');
        });
        
        // 保存提示词模板
        document.getElementById('save-prompt')?.addEventListener('click', () => {
            const content = document.getElementById('prompt-template').value;
            this.settings.promptTemplate = content;
            this.storage.saveSettings(this.settings);
            alert('✅ 模板已保存！');
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
