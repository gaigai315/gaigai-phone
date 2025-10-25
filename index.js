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
import { TimeManager } from './config/time-manager.js';
import { PromptManager } from './config/prompt-manager.js';
    
    if (!window.VirtualPhoneLoaded) {
    window.VirtualPhoneLoaded = true;
    
    console.log('📱 虚拟手机系统 v1.0.0 启动');
    
let phoneShell = null;
let homeScreen = null;
let currentApp = null;
let totalNotifications = 0;
let currentApps = JSON.parse(JSON.stringify(APPS));
let storage = new PhoneStorage();
let settings = storage.loadSettings();
let timeManager = new TimeManager(storage);
let promptManager = null;
    
    // 🔥 新版：统一的JSON格式手机标签
const PHONE_TAG_REGEX = /<phone>([\s\S]*?)<\/phone>/gi;

// 兼容旧版标签（逐步废弃）
const LEGACY_PHONE_TAG = /<Phone>([\s\S]*?)<\/Phone>/gi;
const LEGACY_WECHAT_TAG = /<wechat\s+chatId="([^"]+)"\s+from="([^"]+)">([\s\S]*?)<\/wechat>/gi;
const WECHAT_TAG_REGEX = /<wechat\s+chatId="([^"]+)"\s+from="([^"]+)">([\s\S]*?)<\/wechat>/gi;
    
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

        // 🔧 解析旧版 <Phone> 标签中的JSON命令
function parsePhoneCommands(text) {
    if (!text || !settings.enabled) return [];
    const commands = [];
    let match;
    LEGACY_PHONE_TAG.lastIndex = 0;
    
    while ((match = LEGACY_PHONE_TAG.exec(text)) !== null) {
        try {
            const jsonStr = match[1].trim();
            // 🔥 跳过空内容
            if (!jsonStr) {
                console.log('📱 空的Phone标签，跳过');
                continue;
            }
            const command = JSON.parse(jsonStr);
            commands.push(command);
            console.log('📱 解析到旧版Phone命令:', command);
        } catch (e) {
            console.warn('⚠️ 旧版Phone标签解析失败（已忽略）:', e.message);
        }
    }
    return commands;
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

// 🔥 处理微信消息标签数据（强制使用剧情时间）
function handleWechatTagData(data) {
    if (!data.contact || !data.messages) {
        console.warn('⚠️ 微信消息数据不完整:', data);
        return;
    }
    
    // 🔥 强制获取剧情时间（不依赖AI）
    let baseTime = '21:30'; // 默认时间
    let baseDate = '2044年10月28日';
    
    try {
        const currentTime = timeManager.getCurrentTime();
        if (currentTime && currentTime.time) {
            baseTime = currentTime.time;
            baseDate = currentTime.date || baseDate;
            console.log('⏰ [强制时间] 使用剧情时间:', baseTime);
        } else {
            console.warn('⚠️ [强制时间] 无法获取剧情时间，使用默认21:30');
        }
    } catch (e) {
        console.error('❌ [强制时间] 获取失败，使用默认时间:', e);
    }
    
    // 传递给微信APP
    if (window.currentWechatApp) {
        data.messages.forEach((msg, index) => {
            // 🔥 强制替换时间（忽略AI返回的时间）
            const [hour, minute] = baseTime.split(':').map(Number);
            const totalMinutes = hour * 60 + minute + index + 1;
            const newHour = Math.floor(totalMinutes / 60) % 24;
            const newMinute = totalMinutes % 60;
            const msgTime = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
            
            // 🔥 如果AI给的时间明显错误（早上7点之类的），强制替换
            let finalTime = msgTime;
            if (msg.time && msg.time.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
                const [aiHour, aiMinute] = msg.time.split(':').map(Number);
                const timeDiff = Math.abs((aiHour * 60 + aiMinute) - (hour * 60 + minute));
                
                // 如果AI给的时间和剧情时间相差超过2小时，视为错误
                if (timeDiff > 120) {
                    console.warn(`⚠️ [强制时间] AI时间 ${msg.time} 与剧情时间 ${baseTime} 相差${Math.floor(timeDiff/60)}小时，已强制替换为 ${msgTime}`);
                    finalTime = msgTime;
                } else {
                    // AI时间合理，使用AI的时间
                    finalTime = msg.time;
                    console.log(`✅ [时间检查] AI时间 ${msg.time} 合理，保留`);
                }
            } else {
                console.warn(`⚠️ [强制时间] AI未提供时间或格式错误，使用自动生成时间 ${msgTime}`);
            }
            
            setTimeout(() => {
                window.currentWechatApp.receiveMessage({
                    chatId: data.contact,
                    from: data.contact,
                    message: msg.content,
                    messageType: msg.type || 'text',
                    timestamp: finalTime,
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
    
    function hidePhoneTags(text) {
    $('.mes_text').each(function() {
        const $this = $(this);
        let html = $this.html();
        if (!html) return;
        
        // 隐藏新版标签
        html = html.replace(PHONE_TAG_REGEX, '<span style="color:#07c160;font-size:11px;">📱 已同步到手机</span>');
        
        // 隐藏旧版标签
        html = html.replace(LEGACY_PHONE_TAG, '<span style="display:none!important;">$&</span>');
        html = html.replace(LEGACY_WECHAT_TAG, '<span style="display:none!important;">$&</span>');
        
        // 隐藏手机模式标记
        html = html.replace(/KATEX_INLINE_OPENKATEX_INLINE_OPENPHONE_CHAT_MODEKATEX_INLINE_CLOSEKATEX_INLINE_CLOSE/g, '');
        
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
        window.VirtualPhone = {
          storage: storage,
          settings: settings,
          timeManager: timeManager,
          promptManager: new PromptManager(storage)
     };
     promptManager = window.VirtualPhone.promptManager;
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
    
    // 🟢🟢🟢 在这里添加新的监听器 🟢🟢🟢
    // ========================================
    // 📱 监听提示词准备事件，注入手机活动记录
    // ========================================
    if (context.event_types.CHAT_COMPLETION_PROMPT_READY) {
    context.eventSource.on(
        context.event_types.CHAT_COMPLETION_PROMPT_READY,
        (eventData) => {
        if (!settings.enabled) return;
        
        try {
            // 🔥🔥🔥 新增：注入手机功能提示词 🔥🔥🔥
            // ========================================
            // 📝 第一步：注入启用的提示词规则
            // ========================================
            const promptManager = window.VirtualPhone?.promptManager;
            if (promptManager) {
                const enabledPrompts = promptManager.getEnabledPromptsForChat();
                
                if (enabledPrompts && enabledPrompts.trim()) {
                    // 插入到 system 消息区域（通常在最后一个 system 之后）
                    const messages = eventData.chat;
                    
                    if (messages && Array.isArray(messages)) {
                        // 找到最后一个 system 消息的位置
                        let lastSystemIndex = -1;
                        for (let i = messages.length - 1; i >= 0; i--) {
                            if (messages[i].role === 'system') {
                                lastSystemIndex = i;
                                break;
                            }
                        }
                        
                        // 插入提示词
                        const insertPosition = lastSystemIndex >= 0 ? lastSystemIndex + 1 : 0;
                        messages.splice(insertPosition, 0, {
                            role: 'system',
                            content: enabledPrompts
                        });
                        
                        console.log('📝 已注入手机功能提示词到位置:', insertPosition);
                        console.log('📝 启用的功能:', promptManager.prompts);
                    }
                } else {
                    console.log('⚠️ 没有启用的提示词');
                }
            } else {
                console.warn('⚠️ PromptManager 未初始化');
            }
            
            // ========================================
            // 📱 第二步：收集手机活动记录
            // ========================================
            console.log('\n📱 [手机→酒馆] 开始收集手机活动记录...');
            
            const phoneActivities = [];
                    
// ========================================
// 1️⃣ 收集微信消息（直接从存储读取，不依赖wechatApp）
// ========================================
const storage = window.VirtualPhone?.storage;
if (storage) {
    try {
        // 🔥 直接从存储读取微信数据
        const charId = context?.characterId || 'default';
        const chatId = context?.chatId || 'default';
        const storageKey = `wechat_data_${charId}_${chatId}`;
        
        const savedData = storage.get(storageKey, false);
        if (savedData) {
            const wechatDataParsed = JSON.parse(savedData);
            const allChats = wechatDataParsed.chats || [];
            
            console.log('💬 微信聊天数量:', allChats.length);
            
            allChats.forEach(chat => {
                const messages = wechatDataParsed.messages?.[chat.id] || [];
                if (messages && messages.length > 0) {
                    // 取每个聊天的最近10条消息
                    const recentMessages = messages.slice(-10);
                    
                    recentMessages.forEach(msg => {
                        const speaker = msg.from === 'me' 
                            ? (context.name1 || '用户') 
                            : chat.name;
                        
                        let content = '';
                        switch (msg.type) {
                            case 'text':
                                content = msg.content;
                                break;
                            case 'image':
                                content = '[图片]';
                                break;
                            case 'voice':
                                content = `[语音 ${msg.duration || '3秒'}]`;
                                break;
                            case 'video':
                                content = '[视频通话]';
                                break;
                            case 'transfer':
                                content = `[转账 ¥${msg.amount}]`;
                                break;
                            case 'redpacket':
                                content = `[红包 ¥${msg.amount}]`;
                                break;
                            default:
                                content = `[${msg.type}]`;
                        }
                        
                        phoneActivities.push({
                            app: '微信',
                            type: chat.type === 'group' ? '群聊' : '私聊',
                            chatName: chat.name,
                            speaker: speaker,
                            content: content,
                            time: msg.time,
                            timestamp: msg.realTimestamp || Date.now(),
                            tavernMessageIndex: msg.tavernMessageIndex
                        });
                    });
                }
            });
            
            console.log('✅ 收集了微信消息:', phoneActivities.length, '条');
        } else {
            console.log('📱 没有保存的微信数据');
        }
    } catch (e) {
        console.error('❌ 读取微信数据失败:', e);
    }
} else {
    console.warn('⚠️ 无法访问storage');
}
                    
                    // ========================================
                    // 2️⃣ 收集朋友圈（如果有）
                    // ========================================
                    if (window.VirtualPhone?.wechatApp?.wechatData) {
                        const wechatData = window.VirtualPhone.wechatApp.wechatData;
                        const moments = wechatData.getMoments();
                        
                        if (moments && moments.length > 0) {
                            moments.slice(-5).forEach(moment => {
                                phoneActivities.push({
                                    app: '微信朋友圈',
                                    type: '动态',
                                    chatName: moment.author || '未知',
                                    speaker: moment.author || '未知',
                                    content: moment.content || '',
                                    time: moment.time || '刚刚',
                                    timestamp: Date.now()
                                });
                            });
                            
                            console.log('✅ 收集了朋友圈:', moments.length, '条');
                        }
                    }
                    
                    // ========================================
                    // 3️⃣ 预留：其他APP（短信、电话等）
                    // ========================================
                    // 未来可以在这里添加其他APP的数据收集
                    
                    // ========================================
// 4️⃣ 按时间线智能注入手机消息
// ========================================
if (phoneActivities.length > 0) {
    console.log('📊 总共收集到', phoneActivities.length, '条手机活动');
    
    const messages = eventData.chat;
    
    if (!messages || !Array.isArray(messages)) {
        console.error('❌ eventData.chat 不是数组');
        return;
    }
    
    // 🔥 按消息索引分组手机活动
    const activitiesByIndex = {};
    
    phoneActivities.forEach(activity => {
    // 使用记录的索引，如果没有则默认为最新（修复：0 不应该被当成无效值）
    const index = activity.tavernMessageIndex !== undefined 
        ? activity.tavernMessageIndex 
        : 999999;  // ← 正确判断！
    
    if (!activitiesByIndex[index]) {
        activitiesByIndex[index] = [];
    }
    activitiesByIndex[index].push(activity);
});
    
    console.log('📊 手机消息分组:', Object.keys(activitiesByIndex).length, '个时间点');
    
    // 🔥 找到聊天记录的起始位置（兼容多种格式）
let chatStartIndex = -1;
for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === 'user' || 
        messages[i].role === 'assistant' ||
        messages[i].is_user !== undefined ||
        messages[i].name !== undefined) {
        chatStartIndex = i;
        break;
    }
}

if (chatStartIndex === -1) {
    console.warn('⚠️ 找不到聊天记录起始位置，插入到开头');
    chatStartIndex = 0;
}
    
    console.log('📍 聊天记录起始位置:', chatStartIndex);
    
    // 🔥 按时间顺序注入
const sortedIndices = Object.keys(activitiesByIndex)
    .map(k => parseInt(k))
    .sort((a, b) => a - b);

let totalInjected = 0;

// 🔥 对同一索引下的消息按时间排序
Object.keys(activitiesByIndex).forEach(index => {
    activitiesByIndex[index].sort((a, b) => a.timestamp - b.timestamp);
});

sortedIndices.forEach(tavernIndex => {
    const activities = activitiesByIndex[tavernIndex];
    
    // 🔥 动态计算插入位置
    let timeDesc;
    let insertPosition;
    
    // ========================================
    // 策略：根据手机消息的索引智能插入
    // ========================================
    
    if (tavernIndex === 0) {
        // 情况A：手机消息在对话开始前
        timeDesc = '（在酒馆对话开始之前）';
        
        // 找到第一条真实用户消息
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].role === 'user' && 
                !messages[i].content?.includes('【Gaigai') &&
                !messages[i].content?.includes('[Example') &&
                !messages[i].content?.includes('"**我任务失败了')) {
                insertPosition = i;
                console.log(`📍 [位置计算] 索引=0，插入到第一条用户消息前: ${insertPosition}`);
                break;
            }
        }
        
        if (insertPosition === undefined) {
            insertPosition = Math.max(0, chatStartIndex);
        }
        
    } else if (tavernIndex >= 999999) {
        // 情况B：时间未知的消息，放在最后
        timeDesc = '（最新消息）';
        insertPosition = messages.length;
        console.log(`📍 [位置计算] 索引无效，插入到末尾: ${insertPosition}`);
        
    } else {
        // 情况C：根据索引动态插入
        timeDesc = `（在第${tavernIndex}句对话之后）`;
        
        // 🔥 关键修复：从聊天开始位置计算真实对话数
        let messageCount = 0;
        insertPosition = messages.length; // 默认末尾
        
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            
            // 跳过系统消息、提示词、示例
            if (msg.role === 'system' || 
                msg.content?.includes('【Gaigai') ||
                msg.content?.includes('[Example') ||
                msg.content?.includes('"**我任务失败了**')) {
                continue;
            }
            
            // 统计真实对话（user或assistant）
            if (msg.role === 'user' || msg.role === 'assistant') {
                messageCount++;
                
                // 🔥 找到第N句对话
                if (messageCount === tavernIndex) {
                    insertPosition = i + 1;  // 插入到这句对话之后
                    console.log(`📍 [位置计算] 在第${tavernIndex}句对话后插入到位置: ${insertPosition}`);
                    break;
                }
            }
        }
        
        // 🔥 如果手机消息的索引超过当前对话数，说明是"未来"的消息
        if (messageCount < tavernIndex) {
            insertPosition = messages.length;
            console.log(`📍 [位置计算] 索引${tavernIndex}超过当前对话数${messageCount}，插入到末尾: ${insertPosition}`);
        }
    }
    
    // 构建这个时间点的手机消息内容
    let phoneContextContent = `
═══════════════════════════════════════
📱 手机活动${timeDesc}
═══════════════════════════════════════
`;
    
    const groupedByApp = {};
    activities.forEach(activity => {
        if (!groupedByApp[activity.app]) {
            groupedByApp[activity.app] = [];
        }
        groupedByApp[activity.app].push(activity);
    });
    
    Object.keys(groupedByApp).forEach(appName => {
        phoneContextContent += `## ${appName}\n\n`;
        
        groupedByApp[appName].forEach(activity => {
            let prefix = '';
            if (activity.type === '群聊') {
                prefix = `[群：${activity.chatName}]`;
            } else if (activity.type === '私聊') {
                prefix = `[私聊]`;
            } else if (activity.type === '动态') {
                prefix = `[朋友圈]`;
            } else {
                prefix = `[${activity.type}]`;
            }
            
            phoneContextContent += `${prefix} ${activity.time} ${activity.speaker}: ${activity.content}\n`;
        });
    });
    
    phoneContextContent += `\n═══════════════════════════════════════\n`;
    
    // 插入手机消息
    messages.splice(insertPosition, 0, {
        role: 'system',
        content: phoneContextContent
    });
    
    totalInjected++;
    
    console.log(`✅ 已注入索引${tavernIndex}的手机消息到位置${insertPosition}（${activities.length}条）`);
});
    
    console.log(`🎉 总共注入了 ${totalInjected} 个时间点的手机消息`);
    
} else {
    console.log('📱 暂无手机活动记录');
}
                    
                } catch (e) {
                    console.error('❌ 手机活动注入失败:', e);
                }
            }
        );
        
        console.log('✅ 已注册手机活动注入监听器');
    } else {
        console.warn('⚠️ CHAT_COMPLETION_PROMPT_READY 事件不存在，手机活动将不会注入到酒馆');
    }
    
    console.log('✅ 已连接到酒馆事件系统');
}
        
        console.log('🎉 虚拟手机初始化完成！');
        console.log(`📊 状态: ${settings.enabled ? '已启用' : '已禁用'}`);
        
    } catch (e) {
        console.error('❌ 虚拟手机初始化失败:', e);
    }
}
    
    // 🔥 修复：改进初始化流程
setTimeout(() => {
    init();
    
    // 更新全局对象（不要重复创建）
    if (window.VirtualPhone) {
        window.VirtualPhone.phone = phoneShell;
        window.VirtualPhone.home = homeScreen;
        window.VirtualPhone.imageManager = new ImageUploadManager(storage);
        window.VirtualPhone.wechatApp = null;
        window.VirtualPhone.version = '1.0.0';
    }
}, 1000);
    
    window.ImageUploadManager = ImageUploadManager;
}
