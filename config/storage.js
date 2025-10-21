// 存储管理系统 - 支持跨设备同步

export class PhoneStorage {
    constructor() {
        this.storageKey = 'virtual_phone';
        this.currentCharacterId = null;
        this.currentChatId = null;
        this.useServerStorage = true; // 使用服务器存储
    }
    
    // 获取扩展设置对象
    getExtensionSettings() {
        if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
            const context = SillyTavern.getContext();
            if (context.extensionSettings) {
                if (!context.extensionSettings.virtual_phone) {
                    context.extensionSettings.virtual_phone = {};
                }
                return context.extensionSettings.virtual_phone;
            }
        }
        return null;
    }
    
    // 获取当前上下文
    getContext() {
        try {
            const context = (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
                ? SillyTavern.getContext() 
                : null;
            
            if (context) {
                this.currentCharacterId = context.characterId || context.name2 || 'default';
                this.currentChatId = context.chatMetadata?.file_name || context.chatId || 'default_chat';
            }
            
            return context;
        } catch (e) {
            console.warn('获取上下文失败:', e);
            return null;
        }
    }
    
    // 生成存储键名
    getStorageKey(dataType = 'apps') {
        this.getContext();
        return `${this.currentCharacterId}_${this.currentChatId}_${dataType}`;
    }
    
    // 🎨 新增：通用的 get 方法（支持服务器存储）
    get(key, global = true) {
        try {
            // 优先使用服务器存储
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings) {
                    const storageKey = global ? `global_${key}` : this.getStorageKey(key);
                    return extSettings[storageKey] || null;
                }
            }
            
            // 降级到 localStorage
            const storageKey = global 
                ? `${this.storageKey}_global_${key}`
                : `${this.storageKey}_${this.getStorageKey(key)}`;
            return localStorage.getItem(storageKey);
        } catch (e) {
            console.warn(`读取 ${key} 失败:`, e);
            return null;
        }
    }
    
    // 🎨 新增：通用的 set 方法（支持服务器存储）
    async set(key, value, global = true) {
        try {
            // 优先使用服务器存储
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings) {
                    const storageKey = global ? `global_${key}` : this.getStorageKey(key);
                    extSettings[storageKey] = value;
                    await this.saveExtensionSettings();
                    return;
                }
            }
            
            // 降级到 localStorage
            const storageKey = global 
                ? `${this.storageKey}_global_${key}`
                : `${this.storageKey}_${this.getStorageKey(key)}`;
            localStorage.setItem(storageKey, value);
        } catch (e) {
            console.error(`保存 ${key} 失败:`, e);
        }
    }
    
    // 保存APP数据（支持服务器同步）
    async saveApps(apps) {
        try {
            const key = this.getStorageKey('apps');
            const data = JSON.stringify(apps);
            
            // 服务器存储
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings) {
                    extSettings[key] = data;
                    await this.saveExtensionSettings();
                    console.log(`💾 已保存手机数据到服务器 [${this.currentCharacterId}]`);
                    return;
                }
            }
            
            // 本地存储
            localStorage.setItem(`${this.storageKey}_${key}`, data);
            console.log(`💾 已保存手机数据到本地 [${this.currentCharacterId}]`);
        } catch (e) {
            console.error('保存失败:', e);
        }
    }
    
    // 加载APP数据
    loadApps(defaultApps) {
        try {
            const key = this.getStorageKey('apps');
            let saved = null;
            
            // 优先从服务器加载
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings && extSettings[key]) {
                    saved = extSettings[key];
                    console.log(`📂 已从服务器加载手机数据 [${this.currentCharacterId}]`);
                }
            }
            
            // 降级到本地
            if (!saved) {
                saved = localStorage.getItem(`${this.storageKey}_${key}`);
                if (saved) {
                    console.log(`📂 已从本地加载手机数据 [${this.currentCharacterId}]`);
                }
            }
            
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('加载失败，使用默认数据:', e);
        }
        return defaultApps;
    }
    
    // 🔥 保存扩展设置（会自动同步到服务器）- 完整版带CSRF Token
    async saveExtensionSettings() {
        try {
            // 获取上下文
            const context = SillyTavern.getContext();
            
            // 方案1：使用 saveSettingsDebounced（最优先）
            if (typeof saveSettingsDebounced === 'function') {
                await saveSettingsDebounced();
                console.log('💾 数据已保存到服务器（saveSettingsDebounced）');
                return;
            }
            
            // 方案2：使用 extension_settings.js 的保存函数
            if (typeof window.saveSettings === 'function') {
                await window.saveSettings();
                console.log('💾 数据已保存到服务器（saveSettings）');
                return;
            }
            
            console.warn('⚠️ 无法保存到服务器，请手动刷新页面');
            
        } catch (e) {
            console.error('❌ 保存扩展设置失败:', e);
            // 不抛出错误，避免中断用户操作
        }
    }
    
    // 保存设置
    async saveSettings(settings) {
        try {
            const data = JSON.stringify(settings);
            
            // 服务器存储
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings) {
                    extSettings['global_settings'] = data;
                    await this.saveExtensionSettings();
                    return;
                }
            }
            
            // 本地存储
            localStorage.setItem(`${this.storageKey}_global_settings`, data);
        } catch (e) {
            console.error('保存设置失败:', e);
        }
    }
    
    // 加载设置
    loadSettings() {
        try {
            let saved = null;
            
            // 服务器存储
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings && extSettings['global_settings']) {
                    saved = extSettings['global_settings'];
                }
            }
            
            // 本地存储
            if (!saved) {
                saved = localStorage.getItem(`${this.storageKey}_global_settings`);
            }
            
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('加载设置失败:', e);
        }
        return {
            enabled: true,
            soundEnabled: true,
            vibrationEnabled: true,
            onlineMode: false,
            promptTemplate: null
        };
    }
    
    // 清空当前角色的数据
    async clearCurrentData() {
        try {
            const key = this.getStorageKey('apps');
            
            // 服务器
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings) {
                    delete extSettings[key];
                    await this.saveExtensionSettings();
                }
            }
            
            // 本地
            localStorage.removeItem(`${this.storageKey}_${key}`);
            console.log(`🗑️ 已清空 [${this.currentCharacterId}] 的手机数据`);
        } catch (e) {
            console.error('清空失败:', e);
        }
    }
    
    // 清空所有数据
    async clearAllData() {
        try {
            // 服务器
            if (this.useServerStorage) {
                const extSettings = this.getExtensionSettings();
                if (extSettings) {
                    const keys = Object.keys(extSettings);
                    keys.forEach(k => delete extSettings[k]);
                    await this.saveExtensionSettings();
                }
            }
            
            // 本地
            const keys = Object.keys(localStorage);
            const phoneKeys = keys.filter(k => k.startsWith(this.storageKey));
            phoneKeys.forEach(k => localStorage.removeItem(k));
            
            console.log(`🗑️ 已清空所有手机数据`);
        } catch (e) {
            console.error('清空所有数据失败:', e);
        }
    }
}
