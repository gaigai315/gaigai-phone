// APP配置文件
export const APPS = [
    {
        id: 'wechat',
        name: '微信',
        icon: '💬',
        color: '#07c160',
        badge: 0,  // 未读消息数
        data: {
            contacts: [],
            messages: [],
            moments: []
        }// 设置APP
export class SettingsApp {
    constructor(phoneShell, storage, settings) {
        this.phoneShell = phoneShell;
        this.storage = storage;
        this.settings = settings;
    }
    
    render() {
        const context = this.storage.getContext();
        const charName = context?.name2 || context?.characterId || '未知';
        
        const html = `
            <div class="settings-app">
                <div class="app-header">
                    <button class="app-back-btn" id="settings-back">← 返回</button>
                    <h2>⚙️ 设置</h2>
                </div>
                
                <div class="app-body">
                    <div class="setting-section">
                        <div class="setting-section-title">📱 当前角色</div>
                        <div class="setting-item">
                            <div class="setting-label">角色名称</div>
                            <div class="setting-value">${charName}</div>
                        </div>
                    </div>
                    
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
        document.getElementById('settings-back')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('phone:goHome'));
        });
        
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
        
        document.getElementById('clear-current-data')?.addEventListener('click', () => {
            if (confirm('确定清空当前角色的所有手机数据？\n\n此操作不可恢复！')) {
                window.dispatchEvent(new CustomEvent('phone:clearCurrentData'));
                alert('✅ 数据已清空！');
            }
        });
        
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
    },
    {
        id: 'browser',
        name: '浏览器',
        icon: '🌐',
        color: '#1890ff',
        data: {
            bookmarks: [],
            history: [],
            currentUrl: 'about:blank'
        }
    },
    {
        id: 'photos',
        name: '相册',
        icon: '📷',
        color: '#ff4d4f',
        data: {
            albums: [],
            photos: []
        }
    },
    {
        id: 'games',
        name: '游戏',
        icon: '🎮',
        color: '#722ed1',
        data: {
            installed: ['2048', '贪吃蛇', '俄罗斯方块']
        }
    },
    {
        id: 'music',
        name: '音乐',
        icon: '🎵',
        color: '#eb2f96',
        data: {
            playlists: [],
            nowPlaying: null
        }
    },
    {
        id: 'notes',
        name: '备忘录',
        icon: '📝',
        color: '#faad14',
        data: {
            notes: []
        }
    },
    {
        id: 'calendar',
        name: '日历',
        icon: '📅',
        color: '#52c41a',
        data: {
            events: []
        }
    },
    {
        id: 'settings',
        name: '设置',
        icon: '⚙️',
        color: '#8c8c8c',
        data: {}
    }
];

// 手机配置
export const PHONE_CONFIG = {
    brand: 'iPhone',  // 或 'Android'
    model: 'iPhone 14 Pro',
    theme: 'light',   // 'light' 或 'dark'
    wallpaper: 'default',
    position: 'right', // 'left' 或 'right'（手机显示在聊天窗口左边还是右边）
    size: 'medium'     // 'small', 'medium', 'large'（手机大小）
};
