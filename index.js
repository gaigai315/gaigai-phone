// ========================================
// 虚拟手机互动系统 v1.0.0
// 主入口文件 - 连接到酒馆
// ========================================

import { PhoneShell } from './phone/phone-shell.js';
import { HomeScreen } from './phone/home-screen.js';
import { APPS, PHONE_CONFIG } from './config/apps.js';

console.log('📱 虚拟手机系统正在加载...');

// 全局变量
let phoneShell = null;
let homeScreen = null;
let currentApp = null;
let isInitialized = false;

// AI指令的正则表达式
const PHONE_TAG_REGEX = /<Phone>([\s\S]*?)<\/Phone>/gi;

// ========================================
// 核心功能：解析AI发送的手机指令
// ========================================
function parsePhoneCommands(text) {
    if (!text) return [];
    
    const commands = [];
    let match;
    
    while ((match = PHONE_TAG_REGEX.exec(text)) !== null) {
        try {
            const jsonStr = match[1].trim();
            const command = JSON.parse(jsonStr);
            commands.push(command);
            console.log('📱 解析到手机指令:', command);
        } catch (e) {
            console.error('❌ 手机指令解析失败:', e, match[1]);
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

// ========================================
// 微信指令处理
// ========================================
function handleWechatCommand(action, data) {
    switch (action) {
        case 'newMessage':
            // 显示新消息通知
            phoneShell?.showNotification(
                data.from || '新消息',
                data.message || '',
                '💬'
            );
            // 更新微信角标
            updateAppBadge('wechat', 1);
            break;
            
        case 'openChat':
            // 打开聊天窗口（后续实现）
            console.log('打开聊天:', data);
            break;
    }
}

// ========================================
// 浏览器指令处理
// ========================================
function handleBrowserCommand(action, data) {
    switch (action) {
        case 'open':
            phoneShell?.showNotification(
                '浏览器',
                `正在访问: ${data.url}`,
                '🌐'
            );
            break;
    }
}

// ========================================
// 通知处理
// ========================================
function handleNotification(action, data) {
    if (action === 'show') {
        phoneShell?.showNotification(
            data.title || '通知',
            data.message || '',
            data.icon || '📱'
        );
    }
}

// ========================================
// 系统指令处理
// ========================================
function handleSystemCommand(action, data) {
    switch (action) {
        case 'vibrate':
            // 震动效果
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

// ========================================
// 更新APP角标
// ========================================
function updateAppBadge(appId, increment = 1) {
    const app = APPS.find(a => a.id === appId);
    if (app) {
        app.badge = (app.badge || 0) + increment;
        // 重新渲染主屏幕
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
        
        // 只处理AI的消息
        if (!message || message.is_user) return;
        
        const text = message.mes || message.swipes?.[message.swipe_id || 0] || '';
        
        // 解析手机指令
        const commands = parsePhoneCommands(text);
        
        // 执行所有指令
        commands.forEach(cmd => executePhoneCommand(cmd));
        
        // 隐藏聊天中的手机标签
        if (commands.length > 0) {
            setTimeout(() => hidePhoneTags(), 100);
        }
        
    } catch (e) {
        console.error('❌ 消息处理失败:', e);
    }
}

// ========================================
// 隐藏聊天中的<Phone>标签
// ========================================
function hidePhoneTags() {
    document.querySelectorAll('.mes_text').forEach(el => {
        if (el.innerHTML && PHONE_TAG_REGEX.test(el.innerHTML)) {
            el.innerHTML = el.innerHTML.replace(
                PHONE_TAG_REGEX,
                '<span style="display:none;">$&</span>'
            );
        }
    });
}

// ========================================
// 获取酒馆上下文
// ========================================
function getContext() {
    return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
        ? SillyTavern.getContext() 
        : null;
}

// ========================================
// 加载CSS文件
// ========================================
function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`CSS加载失败: ${url}`));
        document.head.appendChild(link);
    });
}

// ========================================
// 初始化手机
// ========================================
async function initPhone() {
    if (isInitialized) {
        console.warn('⚠️ 虚拟手机已初始化');
        return;
    }
    
    try {
        console.log('📱 开始初始化虚拟手机...');
        
        // 加载CSS
        const cssBase = 'https://cdn.jsdelivr.net/gh/gaigai315/gaigai-phone@main/styles/';
        await loadCSS(cssBase + 'phone.css');
        await loadCSS(cssBase + 'animations.css');
        console.log('✅ CSS加载完成');
        
        // 创建手机外壳
        phoneShell = new PhoneShell();
        phoneShell.create();
        console.log('✅ 手机外壳创建完成');
        
        // 创建主屏幕
        homeScreen = new HomeScreen(phoneShell);
        homeScreen.render();
        console.log('✅ 主屏幕渲染完成');
        
        // 监听返回主页事件
        window.addEventListener('phone:goHome', () => {
            currentApp = null;
            homeScreen.render();
        });
        
        // 监听打开APP事件
        window.addEventListener('phone:openApp', (e) => {
            const { appId } = e.detail;
            console.log('📱 打开APP:', appId);
            
            // 清除角标
            const app = APPS.find(a => a.id === appId);
            if (app) {
                app.badge = 0;
            }
            
            // TODO: 根据appId加载对应的APP界面
            phoneShell.showNotification(
                'APP',
                `${appId} 功能开发中...`,
                '🚧'
            );
        });
        
        // 连接到酒馆
        const context = getContext();
        if (context && context.eventSource) {
            // 监听AI消息
            context.eventSource.on(
                context.event_types.CHARACTER_MESSAGE_RENDERED,
                onMessageReceived
            );
            console.log('✅ 已连接到酒馆事件系统');
        } else {
            console.warn('⚠️ 无法连接到酒馆，手机将无法接收AI指令');
        }
        
        isInitialized = true;
        console.log('🎉 虚拟手机初始化完成！');
        
        // 显示欢迎通知
        setTimeout(() => {
            phoneShell.showNotification(
                '虚拟手机',
                '已成功连接到酒馆！',
                '✅'
            );
        }, 500);
        
    } catch (e) {
        console.error('❌ 虚拟手机初始化失败:', e);
    }
}

// ========================================
// 等待依赖加载
// ========================================
function waitForDependencies() {
    if (typeof $ === 'undefined') {
        console.log('⏳ 等待 jQuery 加载...');
        setTimeout(waitForDependencies, 500);
        return;
    }
    
    if (typeof SillyTavern === 'undefined') {
        console.log('⏳ 等待 SillyTavern 加载...');
        setTimeout(waitForDependencies, 500);
        return;
    }
    
    console.log('✅ 依赖加载完成');
    initPhone();
}

// ========================================
// 启动
// ========================================
setTimeout(waitForDependencies, 1000);

// ========================================
// 导出全局接口（方便调试）
// ========================================
window.VirtualPhone = {
    phone: phoneShell,
    home: homeScreen,
    executeCommand: executePhoneCommand,
    updateBadge: updateAppBadge,
    version: '1.0.0'
};

console.log('📱 虚拟手机系统已加载，等待初始化...');
