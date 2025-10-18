// 存储管理系统 - 处理数据的保存和加载

export class PhoneStorage {
    constructor() {
        this.storageKey = 'virtual_phone';
        this.currentCharacterId = null;
        this.currentChatId = null;
    }
    
    // 获取当前上下文
    getContext() {
        try {
            const context = (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
                ? SillyTavern.getContext() 
                : null;
            
            if (context) {
                // 角色ID
                this.currentCharacterId = context.characterId || context.name2 || 'default';
                // 聊天ID
                this.currentChatId = context.chatMetadata?.file_name || context.chatId || 'default_chat';
            }
            
            return context;
        } catch (e) {
            console.warn('获取上下文失败:', e);
            return null;
        }
    }
    
    // 生成存储键名（每个角色独立）
    getStorageKey(dataType = 'apps') {
        this.getContext();
        // 格式：virtual_phone_{角色ID}_{聊天ID}_{数据类型}
        return `${this.storageKey}_${this.currentCharacterId}_${this.currentChatId}_${dataType}`;
    }
    
    // 保存APP数据
    saveApps(apps) {
        try {
            const key = this.getStorageKey('apps');
            localStorage.setItem(key, JSON.stringify(apps));
            console.log(`💾 已保存手机数据 [${this.currentCharacterId}]`);
        } catch (e) {
            console.error('保存失败:', e);
        }
    }
    
    // 加载APP数据
    loadApps(defaultApps) {
        try {
            const key = this.getStorageKey('apps');
            const saved = localStorage.getItem(key);
            
            if (saved) {
                const data = JSON.parse(saved);
                console.log(`📂 已加载手机数据 [${this.currentCharacterId}]`);
                return data;
            }
        } catch (e) {
            console.warn('加载失败，使用默认数据:', e);
        }
        return defaultApps;
    }
    
    // 保存设置
    saveSettings(settings) {
        try {
            // 设置是全局的，不分角色
            const key = `${this.storageKey}_global_settings`;
            localStorage.setItem(key, JSON.stringify(settings));
        } catch (e) {
            console.error('保存设置失败:', e);
        }
    }
    
    // 加载设置
    loadSettings() {
        try {
            const key = `${this.storageKey}_global_settings`;
            const saved = localStorage.getItem(key);
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
    clearCurrentData() {
        try {
            const key = this.getStorageKey('apps');
            localStorage.removeItem(key);
            console.log(`🗑️ 已清空 [${this.currentCharacterId}] 的手机数据`);
        } catch (e) {
            console.error('清空失败:', e);
        }
    }
    
    // 清空所有数据
    clearAllData() {
        try {
            const keys = Object.keys(localStorage);
            const phoneKeys = keys.filter(k => k.startsWith(this.storageKey));
            phoneKeys.forEach(k => localStorage.removeItem(k));
            console.log(`🗑️ 已清空所有手机数据 (${phoneKeys.length}条)`);
        } catch (e) {
            console.error('清空所有数据失败:', e);
        }
    }
}
