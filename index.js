// ========================================
// 虚拟手机互动系统 v1.0.0
// SillyTavern 扩展插件
// ========================================

import { PhoneShell } from './phone/phone-shell.js';
import { HomeScreen } from './phone/home-screen.js';
import { APPS, PHONE_CONFIG } from './config/apps.js';

(function() {
    'use strict';
    
    // 防止重复加载
    if (window.VirtualPhoneLoaded) {
        console.warn('⚠️ 虚拟手机已加载，跳过重复初始化');
        return;
    }
    window.VirtualPhoneLoaded = true;
    
    console.log('📱 虚拟手机系统 v1.0.0 启动');
    
    // 全局变量
    let phoneShell = null;
    let homeScreen = null;
    let currentApp = null;
    
    // AI指令的正则表达式
    const PHONE_TAG_REGEX = /<Phone>([\s\S]*?)<\/Phone>/gi;
    
    // ========================================
    // 解析AI发送的手机指令
    // ========================================
    function parsePhoneCommands(text) {
        if (!text) return [];
        
        const commands = [];
        let match;
        
        PHONE_TAG_REGEX.lastIndex = 0; // 重置正则
        
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
    
    // ========================================
    // 执行手机指令
    // ========================================
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
            default:
                console.warn('⚠️ 未知的APP:', app);
        }
    }
    
    // 微信指令
    function handleWechatCommand(action, data) {
        switch (action) {
            case 'newMessage':
                phoneShell?.showNotification(
                    data.from || '新消息',
                    data.message || '',
                    '💬'
                );
                updateAppBadge('wechat', 1);
                break;
        }
    }
    
    // 浏览器指令
    function handleBrowserCommand(action, data) {
        if (action === 'open') {
            phoneShell?.showNotification('浏览器', `访问: ${data.url}`, '🌐');
        }
    }
    
    // 通知
    function handleNotification(action, data) {
        if (action === 'show') {
            phoneShell?.showNotification(
                data.title || '通知',
                data.message || '',
                data.icon || '📱'
            );
        }
    }
    
    // 系统指令
    function handleSystemCommand(action, data) {
        switch (action) {
            case 'vibrate':
                if (phoneShell?.container) {
                    phoneShell.container.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        phoneShell.container.style.animation = '';
                    }, 500);
                }
                break;
            case 'screenOn':
                phoneShell?.container?.classList.remove('screen-off');
                break;
            case 'screenOff':
                phoneShell?.container?.classList.add('screen-off');
                break;
        }
    }
    
    // 更新APP角标
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
    
    // 隐藏聊天中的<Phone>标签
    function hidePhoneTags() {
        $('.mes_text').each(function() {
            const $this = $(this);
            let html = $this.html();
            if (!html) return;
            html = html.replace(PHONE_TAG_REGEX, '<span style="display:none!important;">$&</span>');
            $this.html(html);
        });
    }
    
    // 获取酒馆上下文
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
            // 创建手机外壳
            phoneShell = new PhoneShell();
            phoneShell.create();
            console.log('✅ 手机外壳创建完成');
            
            // 创建主屏幕
            homeScreen = new HomeScreen(phoneShell);
            homeScreen.render();
            console.log('✅ 主屏幕渲染完成');
            
            // 监听事件
            window.addEventListener('phone:goHome', () => {
                currentApp = null;
                homeScreen.render();
            });
            
            window.addEventListener('phone:openApp', (e) => {
                const { appId } = e.detail;
                console.log('📱 打开APP:', appId);
                
                const app = APPS.find(a => a.id === appId);
                if (app) app.badge = 0;
                
                phoneShell.showNotification('APP', `${appId} 功能开发中...`, '🚧');
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
            
            // 欢迎通知
            setTimeout(() => {
                phoneShell.showNotification('虚拟手机', '已成功启动！', '✅');
            }, 500);
            
        } catch (e) {
            console.error('❌ 虚拟手机初始化失败:', e);
        }
    }
    
    // 启动
    setTimeout(init, 1000);
    
    // 导出全局接口
    window.VirtualPhone = {
        phone: phoneShell,
        home: homeScreen,
        executeCommand: executePhoneCommand,
        updateBadge: updateAppBadge,
        version: '1.0.0'
    };
    
})();

console.log('📱 虚拟手机系统已加载，等待初始化...');
