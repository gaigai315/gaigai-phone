// ========================================
// 虚拟手机互动系统 v1.0.0
// SillyTavern 扩展插件
// ========================================

import { PhoneShell } from './phone/phone-shell.js';
import { HomeScreen } from './phone/home-screen.js';
import { APPS } from './config/apps.js';
import { PhoneStorage } from './config/storage.js';
import { SettingsApp } from './apps/settings/settings-app.js';
import { ImageUploadManager } from './apps/settings/image-upload.js';

(function() {
    'use strict';
    
    if (window.VirtualPhoneLoaded) {
        console.warn('⚠️ 虚拟手机已加载，跳过重复初始化');
        return;
    }
    window.VirtualPhoneLoaded = true;
    
    console.log('📱 虚拟手机系统 v1.0.0 启动');
    
    let phoneShell = null;
    let homeScreen = null;
    let currentApp = null;
    let totalNotifications = 0;
    let currentApps = JSON.parse(JSON.stringify(APPS));
    let storage = new PhoneStorage();
    let settings = storage.loadSettings();
    
    // 🔥 新版：统一的JSON格式手机标签
const PHONE_TAG_REGEX = /<phone>([\s\S]*?)<\/phone>/gi;

// 兼容旧版标签（逐步废弃）
const LEGACY_PHONE_TAG = /<Phone>([\s\S]*?)<\/Phone>/gi;
const LEGACY_WECHAT_TAG = /<wechat\s+chatId="([^"]+)"\s+from="([^"]+)">([\s\S]*?)<\/wechat>/gi;
    
    // 创建顶部面板按钮
    function createTopPanel() {
        const topSettingsHolder = document.getElementById('top-settings-holder');
        if (!topSettingsHolder) {
            console.error('❌ 找不到 top-settings-holder');
            return;
        }
        
        const oldPanel = document.getElementById('phone-panel-holder');
        if (oldPanel) oldPanel.remove();
        
        const iconStyle = settings.enabled ? '' : 'opacity: 0.4; filter: grayscale(1);';
        const statusText = settings.enabled ? '已启用' : '已禁用';
        
        const panelHTML = `
            <div id="phone-panel-holder" class="drawer">
                <div class="drawer-toggle drawer-header">
                    <div id="phoneDrawerIcon" class="drawer-icon fa-solid fa-mobile-screen-button fa-fw closedIcon interactable" 
                         title="虚拟手机 (${statusText})" 
                         style="${iconStyle}"
                         tabindex="0" 
                         role="button">
                        <span id="phone-badge" class="badge-notification" style="display:none;">0</span>
                    </div>
                </div>
                <div id="phone-panel" class="drawer-content fillRight closedDrawer">
                    <div id="phone-panel-header" class="fa-solid fa-grip drag-grabber"></div>
                    <div id="phone-panel-content">
                        ${!settings.enabled ? '<div style="text-align:center; padding:40px; color:#999;">手机功能已禁用<br><small>在手机"设置"APP中启用</small></div>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        topSettingsHolder.insertAdjacentHTML('afterbegin', panelHTML);
        
        const drawerIcon = document.getElementById('phoneDrawerIcon');
        const drawerPanel = document.getElementById('phone-panel');
        
        drawerIcon?.addEventListener('click', () => {
            toggleDrawer(drawerIcon, drawerPanel);
        });
        
        console.log('✅ 顶部面板已创建（默认收起）');
    }
    
    // 切换抽屉
    function toggleDrawer(icon, panel) {
        const isOpen = panel.classList.contains('openDrawer');
        
        if (isOpen) {
            // 关闭
            panel.classList.remove('openDrawer');
            panel.classList.add('closedDrawer');
            icon.classList.remove('openIcon');
            icon.classList.add('closedIcon');
        } else {
            // 打开
            panel.classList.add('openDrawer');
            panel.classList.remove('closedDrawer');
            icon.classList.add('openIcon');
            icon.classList.remove('closedIcon');
            
            // 只在第一次打开时创建手机界面
            if (settings.enabled) {
                const content = document.getElementById('phone-panel-content');
                if (content && !content.querySelector('.phone-in-panel')) {
                    createPhoneInPanel();
                }
            }
        }
    }
    
    // 在面板中创建手机
    function createPhoneInPanel() {
        const container = document.getElementById('phone-panel-content');
        if (!container || !settings.enabled) return;
        
        container.innerHTML = '';
        
        phoneShell = new PhoneShell();
        phoneShell.createInPanel(container);
        
        homeScreen = new HomeScreen(phoneShell, currentApps);
        homeScreen.render();
        
        console.log('✅ 手机界面已创建');
    }
    
    // 更新通知红点
    function updateNotificationBadge(count) {
        totalNotifications = count;
        const badge = document.getElementById('phone-badge');
        if (!badge) return;
        
        if (count > 0 && settings.enabled) {
            badge.style.display = 'block';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    }
    
        // 🔥 新增：解析微信消息标签
    function parseWechatMessages(text) {
        if (!text || !settings.enabled) return [];
        const messages = [];
        let match;
        WECHAT_TAG_REGEX.lastIndex = 0;
        
        while ((match = WECHAT_TAG_REGEX.exec(text)) !== null) {
            try {
                messages.push({
                    chatId: match[1],
                    from: match[2],
                    content: match[3].trim()
                });
                console.log('📱 解析到微信消息:', match[3].trim());
            } catch (e) {
                console.error('❌ 微信消息解析失败:', e);
            }
        }
        return messages;
    }

    // 🔥 新增：解析新版JSON格式手机标签
function parsePhoneTag(text) {
    if (!text || !settings.enabled) return null;
    
    let match;
    PHONE_TAG_REGEX.lastIndex = 0;
    
    while ((match = PHONE_TAG_REGEX.exec(text)) !== null) {
        try {
            const content = match[1].trim();
            
            // 空标签，不更新
            if (!content) {
                console.log('📱 收到空手机标签，保持现状');
                return null;
            }
            
            // 解析JSON
            const data = JSON.parse(content);
            console.log('📱 解析到手机标签:', data);
            return data;
            
        } catch (e) {
            console.error('❌ 手机标签JSON解析失败:', e, '原文:', match[1]);
        }
    }
    
    return null;
}

// 🔥 新增：处理手机标签数据
function handlePhoneTag(tagData) {
    if (!tagData || !tagData.type) return;
    
    switch (tagData.type) {
        case 'wechat_message':
            handleWechatTagData(tagData);
            break;
            
        case 'wechat_contacts':
            handleContactsUpdate(tagData);
            break;
            
        case 'notification':
            if (tagData.title && tagData.content) {
                phoneShell?.showNotification(tagData.title, tagData.content, tagData.icon || '📱');
            }
            break;
            
        default:
            console.warn('⚠️ 未知的手机标签类型:', tagData.type);
    }
}

// 🔥 处理微信消息标签数据
function handleWechatTagData(data) {
    if (!data.contact || !data.messages) {
        console.warn('⚠️ 微信消息数据不完整:', data);
        return;
    }
    
    // 传递给微信APP
    if (window.currentWechatApp) {
        data.messages.forEach((msg, index) => {
            setTimeout(() => {
                window.currentWechatApp.receiveMessage({
                    chatId: data.contact,
                    from: data.contact,
                    message: msg.content,
                    messageType: msg.type || 'text',
                    timestamp: msg.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    avatar: data.avatar
                });
            }, index * 800);
        });
        
        console.log(`📱 已同步 ${data.messages.length} 条微信消息`);
    }
    
    // 显示通知
    if (data.notification) {
        phoneShell?.showNotification('微信消息', data.notification, '💬');
        updateAppBadge('wechat', data.messages.length);
        totalNotifications += data.messages.length;
        updateNotificationBadge(totalNotifications);
    }
}

// 🔥 处理联系人更新
function handleContactsUpdate(data) {
    if (!data.contacts || !Array.isArray(data.contacts)) {
        console.warn('⚠️ 联系人数据格式错误:', data);
        return;
    }
    
    if (window.currentWechatApp && window.currentWechatApp.addContacts) {
        window.currentWechatApp.addContacts(data.contacts);
        console.log(`📱 已添加 ${data.contacts.length} 个联系人`, data.contacts);
    } else {
        // 暂存到存储，等微信APP加载后再添加
        const pending = storage.get('pending-contacts') || [];
        pending.push(...data.contacts);
        storage.set('pending-contacts', pending);
        console.log('📱 联系人已暂存，等待微信APP加载');
    }
}
    
    // 🔥 新增：隐藏微信标签
    function hideWechatTags() {
        $('.mes_text').each(function() {
            const $this = $(this);
            let html = $this.html();
            if (!html) return;
            
            // 替换为"已发送到手机"提示（可选）
            html = html.replace(WECHAT_TAG_REGEX, '<span style="color:#07c160;font-size:12px;">📱 已发送到微信</span>');
            
            // 或者完全隐藏（取消下面这行的注释）
            // html = html.replace(WECHAT_TAG_REGEX, '<span style="display:none!important;">$&</span>');
            
            $this.html(html);
        });
    }
    
    // 执行手机指令
    function executePhoneCommand(command) {
        if (!settings.enabled) {
            console.log('⚠️ 手机功能已禁用，忽略指令');
            return;
        }
        
        const { app, action, data } = command;
        console.log(`📱 执行指令: ${app}.${action}`, data);
        
        switch (app) {
            case 'wechat':
                handleWechatCommand(action, data);
                break;
            case 'browser':
                handleBrowserCommand(action, data);
                break;
            case 'notification':
                handleNotification(action, data);
                break;
            case 'system':
                handleSystemCommand(action, data);
                break;
        }
        
        saveData();
    }
    
    function handleWechatCommand(action, data) {
        if (action === 'receiveMessage') {
            // 支持单条消息
            if (data.message) {
                phoneShell?.showNotification(
                    data.from || '新消息', 
                    data.message, 
                    '💬'
                );
                updateAppBadge('wechat', 1);
                totalNotifications++;
                updateNotificationBadge(totalNotifications);
            }
            
            // 支持多条消息
            if (data.messages && Array.isArray(data.messages)) {
                data.messages.forEach((msg, index) => {
                    setTimeout(() => {
                        phoneShell?.showNotification(
                            data.from || '新消息', 
                            msg.text || msg.message, 
                            '💬'
                        );
                    }, index * 1500);
                });
                
                updateAppBadge('wechat', data.messages.length);
                totalNotifications += data.messages.length;
                updateNotificationBadge(totalNotifications);
            }
            
            console.log('📱 收到微信消息:', data);
            
            // ✅ 自动传递给微信APP
            handleWechatMessage(data);
        }
        
        // 兼容旧的 newMessage action
        if (action === 'newMessage') {
            phoneShell?.showNotification(data.from || '新消息', data.message || '', '💬');
            updateAppBadge('wechat', 1);
            totalNotifications++;
            updateNotificationBadge(totalNotifications);
            
            // ✅ 自动传递给微信APP
            handleWechatMessage(data);
        }
    }
    
    // ✅ 处理微信消息（支持新的微信APP）
    function handleWechatMessage(data) {
        // 如果微信APP正在运行，直接发送到APP
        if (window.currentWechatApp) {
            window.currentWechatApp.receiveMessage(data);
        }
    }
    
    function handleBrowserCommand(action, data) {
        if (action === 'open') {
            phoneShell?.showNotification('浏览器', `访问: ${data.url}`, '🌐');
        }
    }
    
    function handleNotification(action, data) {
        if (action === 'show') {
            phoneShell?.showNotification(data.title || '通知', data.message || '', data.icon || '📱');
        }
    }
    
    function handleSystemCommand(action, data) {
        if (action === 'vibrate' && settings.vibrationEnabled) {
            if (phoneShell?.container) {
                phoneShell.container.style.animation = 'shake 0.5s';
                setTimeout(() => { phoneShell.container.style.animation = ''; }, 500);
            }
        }
    }
    
    function updateAppBadge(appId, increment = 1) {
        const app = currentApps.find(a => a.id === appId);
        if (app) {
            app.badge = (app.badge || 0) + increment;
            if (homeScreen && currentApp === null) {
                homeScreen.apps = currentApps;
                homeScreen.render();
            }
        }
    }
    
    function saveData() {
        storage.saveApps(currentApps);
    }
    
    function loadData() {
        currentApps = storage.loadApps(JSON.parse(JSON.stringify(APPS)));
        totalNotifications = currentApps.reduce((sum, app) => sum + (app.badge || 0), 0);
        updateNotificationBadge(totalNotifications);
    }
    
    function onMessageReceived(messageId) {
    if (!settings.enabled) return;
    
    try {
        const context = getContext();
        if (!context || !context.chat) return;
        
        const index = typeof messageId === 'number' ? messageId : context.chat.length - 1;
        const message = context.chat[index];
        
        if (!message || message.is_user) return;
        
        const text = message.mes || message.swipes?.[message.swipe_id || 0] || '';
        
        // 🔥 优先解析新版JSON标签
        const phoneTagData = parsePhoneTag(text);
        if (phoneTagData) {
            handlePhoneTag(phoneTagData);
            setTimeout(() => hidePhoneTags(text), 100);
            return; // 新版标签优先，跳过旧版解析
        }
        
        // 🔥 兼容旧版 <Phone> 标签
        const commands = parsePhoneCommands(text);
        commands.forEach(cmd => executePhoneCommand(cmd));
        
        // 🔥 兼容旧版 <wechat> 标签
        const wechatMessages = parseWechatMessages(text);
        if (wechatMessages.length > 0) {
            wechatMessages.forEach(msg => {
                if (window.currentWechatApp) {
                    window.currentWechatApp.receiveMessage({
                        chatId: msg.chatId,
                        from: msg.from,
                        message: msg.content,
                        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                    });
                }
            });
        }
        
        // 隐藏所有标签
        if (commands.length > 0 || wechatMessages.length > 0) {
            setTimeout(() => hidePhoneTags(text), 150);
        }
        
        // 隐藏用户消息中的手机模式标记
        setTimeout(() => {
            $('.mes_text').each(function() {
                const $this = $(this);
                let html = $this.html();
                if (html && html.includes('((PHONE_CHAT_MODE))')) {
                    html = html.replace(/KATEX_INLINE_OPENKATEX_INLINE_OPENPHONE_CHAT_MODEKATEX_INLINE_CLOSEKATEX_INLINE_CLOSE/g, '');
                    $this.html(html);
                }
            });
        }, 150);
        
    } catch (e) {
        console.error('❌ 消息处理失败:', e);
    }
}
    
    function onChatChanged() {
        console.log('🔄 聊天已切换，重新加载数据...');
        loadData();
        
        if (homeScreen) {
            homeScreen.apps = currentApps;
            homeScreen.render();
        }
    }
    
    function hidePhoneTags() {
        $('.mes_text').each(function() {
            const $this = $(this);
            let html = $this.html();
            if (!html) return;
            
            html = html.replace(PHONE_TAG_REGEX, '<span style="display:none!important;">$&</span>');
            html = html.replace(/KATEX_INLINE_OPENKATEX_INLINE_OPENPHONE_CHAT_MODEKATEX_INLINE_CLOSEKATEX_INLINE_CLOSE/g, '<span style="display:none!important;"></span>');
            
            $this.html(html);
        });
    }
    
    function getContext() {
        return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
            ? SillyTavern.getContext() 
            : null;
    }

    // 🎨 初始化颜色设置
function initColors() {
    const timeColor = storage.get('phone-time-color') || '#ffffff';
    const appNameColor = storage.get('phone-app-name-color') || '#ffffff';
    
    document.documentElement.style.setProperty('--phone-time-color', timeColor);
    document.documentElement.style.setProperty('--phone-app-name-color', appNameColor);
    
    // 根据颜色亮度自动调整阴影
    const isLight = (color) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 155;
    };
    
    const timeShadow = isLight(timeColor) 
        ? '0 2px 8px rgba(255, 255, 255, 0.4), 0 1px 4px rgba(255, 255, 255, 0.2)' 
        : '0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)';
    
    const appNameShadow = isLight(appNameColor) 
        ? '0 1px 4px rgba(255, 255, 255, 0.4)' 
        : '0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5)';
    
    document.documentElement.style.setProperty('--phone-time-shadow', timeShadow);
    document.documentElement.style.setProperty('--phone-app-name-shadow', appNameShadow);
    
    console.log('🎨 颜色设置已加载:', { timeColor, appNameColor });
}
    
    // 初始化
function init() {
    if (typeof $ === 'undefined') {
        console.log('⏳ 等待 jQuery 加载...');
        setTimeout(init, 500);
        return;
    }
    
    if (typeof SillyTavern === 'undefined') {
        console.log('⏳ 等待 SillyTavern 加载...');
        setTimeout(init, 500);
        return;
    }
    
    console.log('✅ 依赖加载完成，开始初始化');
    
    try {
        loadData();
        initColors();
        createTopPanel();
        
        // 监听返回主页
        window.addEventListener('phone:goHome', () => {
            currentApp = null;
            window.currentWechatApp = null;
            if (homeScreen) homeScreen.render();
        });
        
        // 监听打开APP
        window.addEventListener('phone:openApp', (e) => {
            const { appId } = e.detail;
            console.log('📱 打开APP:', appId);
            
            const app = currentApps.find(a => a.id === appId);
            if (app) {
                app.badge = 0;
                totalNotifications = currentApps.reduce((sum, a) => sum + (a.badge || 0), 0);
                updateNotificationBadge(totalNotifications);
                saveData();
            }
            
            // 打开对应的APP
            if (appId === 'settings') {
                const settingsApp = new SettingsApp(phoneShell, storage, settings);
                settingsApp.render();
            } else if (appId === 'wechat') {
    import('./apps/wechat/wechat-app.js').then(module => {
        const wechatApp = new module.WechatApp(phoneShell, storage);
        window.currentWechatApp = wechatApp;
        window.VirtualPhone.wechatApp = wechatApp;
        
        // 🔥 新增：加载待处理的联系人
        const pendingContacts = storage.get('pending-contacts') || [];
        if (pendingContacts.length > 0 && wechatApp.addContacts) {
            wechatApp.addContacts(pendingContacts);
            storage.set('pending-contacts', []); // 清空
            console.log(`📱 已加载 ${pendingContacts.length} 个待处理联系人`);
        }
        
        wechatApp.render();
    }).catch(err => {
        console.error('加载微信APP失败:', err);
        phoneShell?.showNotification('错误', '微信加载失败', '❌');
    });
} else {
                phoneShell?.showNotification('APP', `${appId} 功能开发中...`, '🚧');
            }
        });
        
        // 监听从微信发送到聊天的消息
        window.addEventListener('phone:sendToChat', (e) => {
            const { message, chatId, chatName } = e.detail;
            
            const textarea = document.querySelector('#send_textarea');
            if (textarea) {
                textarea.value = message;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                
                const sendButton = document.querySelector('#send_but');
                if (sendButton && settings.autoSend) {
                    setTimeout(() => sendButton.click(), 100);
                }
            } else {
                console.warn('找不到聊天输入框');
            }
        });
        
        // 监听清空数据
        window.addEventListener('phone:clearCurrentData', () => {
            storage.clearCurrentData();
            currentApps = JSON.parse(JSON.stringify(APPS));
            totalNotifications = 0;
            updateNotificationBadge(0);
            if (homeScreen) {
                homeScreen.apps = currentApps;
                homeScreen.render();
            }
        });
        
        window.addEventListener('phone:clearAllData', () => {
            storage.clearAllData();
            currentApps = JSON.parse(JSON.stringify(APPS));
            totalNotifications = 0;
            updateNotificationBadge(0);
            if (homeScreen) {
                homeScreen.apps = currentApps;
                homeScreen.render();
            }
        });
        
        // 连接到酒馆
        const context = getContext();
        if (context && context.eventSource) {
            context.eventSource.on(
                context.event_types.CHARACTER_MESSAGE_RENDERED,
                onMessageReceived
            );
            
            context.eventSource.on(
                context.event_types.CHAT_CHANGED,
                onChatChanged
            );
            
            console.log('✅ 已连接到酒馆事件系统');
        }
        
        console.log('🎉 虚拟手机初始化完成！');
        console.log(`📊 状态: ${settings.enabled ? '已启用' : '已禁用'}`);
        
    } catch (e) {
        console.error('❌ 虚拟手机初始化失败:', e);
    }
}
    
    setTimeout(init, 1000);
    
    window.VirtualPhone = {
    phone: phoneShell,
    home: homeScreen,
    storage: storage,
    settings: settings,
    imageManager: new ImageUploadManager(storage),
    wechatApp: null,
    version: '1.0.0'
};
    
    window.ImageUploadManager = ImageUploadManager;
    
})();
