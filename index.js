// ========================================
// 虚拟手机互动系统 v1.0.0
// SillyTavern 扩展插件
// ========================================

import { PhoneShell } from './phone/phone-shell.js';
import { HomeScreen } from './phone/home-screen.js';
import { APPS, PHONE_CONFIG } from './config/apps.js';

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
    
    const PHONE_TAG_REGEX = /<Phone>([\s\S]*?)<\/Phone>/gi;
    
    // ========================================
    // 创建顶部面板按钮（集成到酒馆）
    // ========================================
    function createTopPanel() {
        const topSettingsHolder = document.getElementById('top-settings-holder');
        if (!topSettingsHolder) {
            console.error('❌ 找不到 top-settings-holder');
            return;
        }
        
        // 移除旧的面板
        const oldPanel = document.getElementById('phone-panel-holder');
        if (oldPanel) oldPanel.remove();
        
        // 创建面板HTML
        const panelHTML = `
            <div id="phone-panel-holder" class="drawer">
                <div class="drawer-toggle drawer-header">
                    <div id="phoneDrawerIcon" class="drawer-icon fa-solid fa-mobile-screen-button fa-fw closedIcon interactable" 
                         title="虚拟手机" 
                         data-i18n="[title]Virtual Phone" 
                         tabindex="0" 
                         role="button">
                        <span id="phone-badge" class="badge-notification" style="display:none;">0</span>
                    </div>
                </div>
                <div id="phone-panel" class="drawer-content fillRight closedDrawer">
                    <div id="phone-panel-header" class="fa-solid fa-grip drag-grabber"></div>
                    <div id="phone-panel-content" style="padding: 10px; height: 100%; overflow: auto;">
                        <!-- 手机界面会在这里显示 -->
                    </div>
                </div>
            </div>
        `;
        
        // 插入到第一个位置
        topSettingsHolder.insertAdjacentHTML('afterbegin', panelHTML);
        
        // 绑定点击事件
        const drawerIcon = document.getElementById('phoneDrawerIcon');
        const drawerPanel = document.getElementById('phone-panel');
        
        drawerIcon?.addEventListener('click', () => {
            toggleDrawer(drawerIcon, drawerPanel);
        });
        
        console.log('✅ 顶部面板已创建');
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
            
            // 打开时创建手机界面
            if (!phoneShell) {
                createPhoneInPanel();
            }
        }
    }
    
    // 在面板中创建手机
    function createPhoneInPanel() {
        const container = document.getElementById('phone-panel-content');
        if (!container) return;
        
        phoneShell = new PhoneShell();
        phoneShell.createInPanel(container);
        
        homeScreen = new HomeScreen(phoneShell);
        homeScreen.render();
        
        console.log('✅ 手机界面已创建');
    }
    
    // 更新通知红点
    function updateNotificationBadge(count) {
        totalNotifications = count;
        const badge = document.getElementById('phone-badge');
        if (!badge) return;
        
        if (count > 0) {
            badge.style.display = 'block';
            badge.textContent = count > 99 ? '99+' : count;
        } else {
            badge.style.display = 'none';
        }
    }
    
    // ========================================
    // 解析和执行指令
    // ========================================
    function parsePhoneCommands(text) {
        if (!text) return [];
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
    
    function executePhoneCommand(command) {
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
    }
    
    function handleWechatCommand(action, data) {
        if (action === 'newMessage') {
            phoneShell?.showNotification(data.from || '新消息', data.message || '', '💬');
            updateAppBadge('wechat', 1);
            totalNotifications++;
            updateNotificationBadge(totalNotifications);
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
        switch (action) {
            case 'vibrate':
                if (phoneShell?.container) {
                    phoneShell.container.style.animation = 'shake 0.5s';
                    setTimeout(() => { phoneShell.container.style.animation = ''; }, 500);
                }
                break;
        }
    }
    
    function updateAppBadge(appId, increment = 1) {
        const app = APPS.find(a => a.id === appId);
        if (app) {
            app.badge = (app.badge || 0) + increment;
            if (homeScreen && currentApp === null) {
                homeScreen.render();
            }
        }
    }
    
    // ========================================
    // 监听酒馆消息
    // ========================================
    function onMessageReceived(messageId) {
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
        } catch (e) {
            console.error('❌ 消息处理失败:', e);
        }
    }
    
    function hidePhoneTags() {
        $('.mes_text').each(function() {
            const $this = $(this);
            let html = $this.html();
            if (!html) return;
            html = html.replace(PHONE_TAG_REGEX, '<span style="display:none!important;">$&</span>');
            $this.html(html);
        });
    }
    
    function getContext() {
        return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
            ? SillyTavern.getContext() 
            : null;
    }
    
    // ========================================
    // 初始化
    // ========================================
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
            // 创建顶部面板
            createTopPanel();
            
            // 监听事件
            window.addEventListener('phone:goHome', () => {
                currentApp = null;
                if (homeScreen) homeScreen.render();
            });
            
            window.addEventListener('phone:openApp', (e) => {
                const { appId } = e.detail;
                console.log('📱 打开APP:', appId);
                const app = APPS.find(a => a.id === appId);
                if (app) {
                    app.badge = 0;
                    totalNotifications = APPS.reduce((sum, a) => sum + (a.badge || 0), 0);
                    updateNotificationBadge(totalNotifications);
                }
                phoneShell?.showNotification('APP', `${appId} 功能开发中...`, '🚧');
            });
            
            // 连接到酒馆
            const context = getContext();
            if (context && context.eventSource) {
                context.eventSource.on(
                    context.event_types.CHARACTER_MESSAGE_RENDERED,
                    onMessageReceived
                );
                console.log('✅ 已连接到酒馆事件系统');
            }
            
            console.log('🎉 虚拟手机初始化完成！');
            
        } catch (e) {
            console.error('❌ 虚拟手机初始化失败:', e);
        }
    }
    
    setTimeout(init, 1000);
    
    window.VirtualPhone = {
        phone: phoneShell,
        home: homeScreen,
        executeCommand: executePhoneCommand,
        updateBadge: updateAppBadge,
        version: '1.0.0'
    };
    
})();
