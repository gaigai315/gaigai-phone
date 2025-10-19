// ========================================
// 虚拟手机互动系统 v1.0.1 (修复版)
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
    
    console.log('📱 虚拟手机系统 v1.0.1 启动');
    
    let phoneShell = null;
    let homeScreen = null;
    let currentApp = null;
    let totalNotifications = 0;
    let currentApps = JSON.parse(JSON.stringify(APPS));
    let storage = new PhoneStorage();
    let settings = storage.loadSettings();
    let panelCreated = false;
    
    const PHONE_TAG_REGEX = /<Phone>([\s\S]*?)<\/Phone>/gi;
    
    // 创建顶部面板按钮（加强版 - 持续重试）
    function createTopPanel(retryCount = 0) {
        console.log(`🔨 尝试创建顶部面板... (第${retryCount + 1}次)`);
        
        if (panelCreated) {
            console.log('✅ 面板已存在，跳过创建');
            return true;
        }
        
        const topSettingsHolder = document.getElementById('top-settings-holder');
        
        if (!topSettingsHolder) {
            console.warn(`⚠️ 找不到 top-settings-holder (尝试 ${retryCount + 1}/20)`);
            
            if (retryCount < 20) {
                setTimeout(() => createTopPanel(retryCount + 1), 500);
            } else {
                console.error('❌ 20次重试后仍未找到容器，放弃创建');
                console.log('🔍 当前页面上所有ID包含"settings"的元素:');
                document.querySelectorAll('[id*="settings"]').forEach(el => {
                    console.log('  - ID:', el.id, '元素:', el);
                });
            }
            return false;
        }
        
        console.log('✅ 找到容器:', topSettingsHolder);
        
        // 移除旧面板
        const oldPanel = document.getElementById('phone-panel-holder');
        if (oldPanel) {
            console.log('🗑️ 移除旧面板');
            oldPanel.remove();
        }
        
        const iconStyle = settings.enabled ? '' : 'opacity: 0.4; filter: grayscale(1);';
        const statusText = settings.enabled ? '已启用' : '已禁用';
        
        const panelHTML = `
            <div id="phone-panel-holder" class="drawer" style="display: flex !important;">
                <div class="drawer-toggle drawer-header">
                    <div id="phoneDrawerIcon" 
                         class="drawer-icon fa-solid fa-mobile-screen-button fa-fw closedIcon interactable" 
                         title="虚拟手机 (${statusText})" 
                         style="cursor: pointer !important; font-size: 20px !important; padding: 10px !important; color: #ffffff !important; ${iconStyle}"
                         tabindex="0" 
                         role="button">
                        <span id="phone-badge" class="badge-notification" style="display:none;">0</span>
                    </div>
                </div>
                <div id="phone-panel" class="drawer-content fillRight closedDrawer" style="display: none;">
                    <div id="phone-panel-header" class="fa-solid fa-grip drag-grabber"></div>
                    <div id="phone-panel-content">
                        ${!settings.enabled ? '<div style="text-align:center; padding:40px; color:#999;">手机功能已禁用<br><small>在手机"设置"APP中启用</small></div>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        try {
            topSettingsHolder.insertAdjacentHTML('afterbegin', panelHTML);
            console.log('✅ HTML已插入');
        } catch (e) {
            console.error('❌ 插入HTML失败:', e);
            return false;
        }
        
        const drawerIcon = document.getElementById('phoneDrawerIcon');
        const drawerPanel = document.getElementById('phone-panel');
        
        console.log('📍 图标元素:', drawerIcon);
        console.log('📍 面板元素:', drawerPanel);
        
        if (!drawerIcon || !drawerPanel) {
            console.error('❌ 元素创建失败！');
            return false;
        }
        
        drawerIcon.addEventListener('click', () => {
            console.log('🖱️ 图标被点击');
            toggleDrawer(drawerIcon, drawerPanel);
        });
        
        panelCreated = true;
        console.log('🎉 顶部面板创建成功！');
        
        return true;
    }
    
    // 切换抽屉
    function toggleDrawer(icon, panel) {
        const isOpen = panel.style.display !== 'none' && panel.classList.contains('openDrawer');
        
        console.log('🔄 切换抽屉，当前状态:', isOpen ? '打开' : '关闭');
        
        if (isOpen) {
            // 关闭
            panel.style.display = 'none';
            panel.classList.remove('openDrawer');
            panel.classList.add('closedDrawer');
            icon.classList.remove('openIcon');
            icon.classList.add('closedIcon');
        } else {
            // 打开
            panel.style.display = 'block';
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
        console.log('📱 创建手机界面...');
        
        const container = document.getElementById('phone-panel-content');
        if (!container || !settings.enabled) {
            console.error('❌ 无法创建手机界面');
            return;
        }
        
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
    
    // 解析手机指令
    function parsePhoneCommands(text) {
        if (!text || !settings.enabled) return [];
        const commands = [];
        let match;
        PHONE_TAG_REGEX.lastIndex = 0;
        
        while ((match = PHONE_TAG_REGEX.exec(text)) !== null) {
            try {
                const jsonStr = match[1].trim();
                const command = JSON.parse(jsonStr);
                commands.push(command);
                console.log('📱 解析到手机指令:', command);
            } catch (e) {
                console.error('❌ 手机指令解析失败:', e);
            }
        }
        return commands;
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
            if (data.message) {
                phoneShell?.showNotification(data.from || '新消息', data.message, '💬');
                updateAppBadge('wechat', 1);
                totalNotifications++;
                updateNotificationBadge(totalNotifications);
            }
            
            if (data.messages && Array.isArray(data.messages)) {
                data.messages.forEach((msg, index) => {
                    setTimeout(() => {
                        phoneShell?.showNotification(data.from || '新消息', msg.text || msg.message, '💬');
                    }, index * 1500);
                });
                
                updateAppBadge('wechat', data.messages.length);
                totalNotifications += data.messages.length;
                updateNotificationBadge(totalNotifications);
            }
            
            console.log('📱 收到微信消息:', data);
            handleWechatMessage(data);
        }
        
        if (action === 'newMessage') {
            phoneShell?.showNotification(data.from || '新消息', data.message || '', '💬');
            updateAppBadge('wechat', 1);
            totalNotifications++;
            updateNotificationBadge(totalNotifications);
            handleWechatMessage(data);
        }
    }
    
    function handleWechatMessage(data) {
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
            const commands = parsePhoneCommands(text);
            
            commands.forEach(cmd => executePhoneCommand(cmd));
            
            if (commands.length > 0) {
                setTimeout(hidePhoneTags, 100);
            }
            
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
            
            html = html.replace(PHONE_TAG_REGEX, '<span style="display:none!important;" class="phone-hidden-tag">$&</span>');
            html = html.replace(/KATEX_INLINE_OPENKATEX_INLINE_OPENPHONE_CHAT_MODEKATEX_INLINE_CLOSEKATEX_INLINE_CLOSE/g, '<span style="display:none!important;" class="phone-mode-hidden"></span>');
            
            $this.html(html);
        });
        
        console.log('✅ 已隐藏手机标签内容');
    }
    
    function getContext() {
        return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
            ? SillyTavern.getContext() 
            : null;
    }
    
    // 初始化
    function init() {
        console.log('🚀 开始初始化虚拟手机...');
        
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
            createTopPanel(0);
            
            window.addEventListener('phone:goHome', () => {
                currentApp = null;
                window.currentWechatApp = null;
                if (homeScreen) homeScreen.render();
            });
            
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
                
                if (appId === 'settings') {
                    const settingsApp = new SettingsApp(phoneShell, storage, settings);
                    settingsApp.render();
                } else if (appId === 'wechat') {
                    import('./apps/wechat/wechat-app.js').then(module => {
                        const wechatApp = new module.WechatApp(phoneShell, storage);
                        window.currentWechatApp = wechatApp;
                        wechatApp.render();
                    }).catch(err => {
                        console.error('加载微信APP失败:', err);
                        phoneShell?.showNotification('错误', '微信加载失败', '❌');
                    });
                } else {
                    phoneShell?.showNotification('APP', `${appId} 功能开发中...`, '🚧');
                }
            });
            
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
    
    setTimeout(init, 2000);
    
    window.VirtualPhone = {
        phone: phoneShell,
        home: homeScreen,
        storage: storage,
        settings: settings,
        imageManager: new ImageUploadManager(storage),
        createPanel: createTopPanel,
        version: '1.0.1'
    };
    
    window.ImageUploadManager = ImageUploadManager;
    
})();
