// ========================================
// 虚拟手机互动系统 v1.0.0
// SillyTavern 扩展插件
// ========================================

import { PhoneShell } from './phone/phone-shell.js';
import { HomeScreen } from './phone/home-screen.js';
import { APPS, PHONE_CONFIG } from './config/apps.js';
import { PhoneStorage } from './config/storage.js';

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
    let currentApps = JSON.parse(JSON.stringify(APPS)); // 深拷贝
    let storage = new PhoneStorage();
    let settings = storage.loadSettings();
    let currentCharacterId = null;
    
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
    
    const oldPanel = document.getElementById('phone-panel-holder');
    if (oldPanel) oldPanel.remove();
    
    // 根据开关状态设置图标样式
    const iconClass = settings.enabled ? 'fa-mobile-screen-button' : 'fa-mobile-screen-button';
    const iconStyle = settings.enabled ? '' : 'opacity: 0.4; filter: grayscale(1);';
    const statusText = settings.enabled ? '已启用' : '已禁用';
    
    const panelHTML = `
        <div id="phone-panel-holder" class="drawer">
            <div class="drawer-toggle drawer-header">
                <div id="phoneDrawerIcon" class="drawer-icon fa-solid ${iconClass} fa-fw closedIcon interactable" 
                     title="虚拟手机 (${statusText})" 
                     style="${iconStyle}"
                     tabindex="0" 
                     role="button">
                    <span id="phone-badge" class="badge-notification" style="display:none;">0</span>
                </div>
            </div>
            <div id="phone-panel" class="drawer-content fillRight closedDrawer">
                <div id="phone-panel-header" class="fa-solid fa-grip drag-grabber"></div>
                <div id="phone-panel-toolbar" style="padding: 10px; border-bottom: 1px solid #ddd; display: flex; gap: 10px;">
                    <button id="phone-settings-btn" class="menu_button" title="设置">
                        <i class="fa-solid fa-gear"></i> 设置
                    </button>
                    <button id="phone-clear-btn" class="menu_button" title="清空当前角色数据">
                        <i class="fa-solid fa-trash"></i> 清空数据
                    </button>
                    <div style="flex: 1; text-align: right; font-size: 11px; color: #666; padding-top: 8px;">
                        角色: <span id="phone-char-name">加载中...</span>
                    </div>
                </div>
                <div id="phone-panel-content" style="padding: 10px; height: calc(100% - 60px); overflow: auto;">
                    ${!settings.enabled ? '<div style="text-align:center; padding:40px; color:#999;">手机功能已禁用<br><small>点击上方"设置"启用</small></div>' : '<div style="text-align:center; padding:20px; color:#999;"><i class="fa-solid fa-spinner fa-spin"></i> 加载中...</div>'}
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
    
    // 设置按钮
    document.getElementById('phone-settings-btn')?.addEventListener('click', showSettings);
    
    // 清空数据按钮
    document.getElementById('phone-clear-btn')?.addEventListener('click', async () => {
        if (confirm('确定清空当前角色的所有手机数据？\n\n此操作不可恢复！')) {
            storage.clearCurrentData();
            currentApps = JSON.parse(JSON.stringify(APPS));
            totalNotifications = 0;
            updateNotificationBadge(0);
            if (homeScreen) homeScreen.render();
            alert('数据已清空！');
        }
    });
    
    // ✅ 更新角色名显示
    updateCharacterName();
    
    // ✅ 立即创建手机界面（如果功能已启用）
    if (settings.enabled) {
        setTimeout(() => {
            const content = document.getElementById('phone-panel-content');
            if (content && !content.querySelector('.phone-in-panel')) {
                createPhoneInPanel();
            }
        }, 100);
    }
    
    console.log('✅ 顶部面板已创建');
}
    
    // 更新角色名显示
    function updateCharacterName() {
        const context = storage.getContext();
        const charNameEl = document.getElementById('phone-char-name');
        if (charNameEl && context) {
            const charName = context.name2 || context.characterId || '未知';
            charNameEl.textContent = charName;
        }
    }
    
    // 显示设置对话框
    function showSettings() {
        const dialogHTML = `
            <div id="phone-settings-dialog" class="phone-dialog-overlay">
                <div class="phone-dialog">
                    <div class="phone-dialog-header">
                        <h3>📱 虚拟手机设置</h3>
                        <button class="phone-dialog-close">&times;</button>
                    </div>
                    <div class="phone-dialog-body">
                        <div class="phone-setting-item">
                            <label class="phone-setting-label">
                                <input type="checkbox" id="phone-enabled" ${settings.enabled ? 'checked' : ''}>
                                <span class="phone-setting-title">启用手机功能</span>
                            </label>
                            <small class="phone-setting-desc">关闭后将不接收和显示手机消息（适用于古代背景）</small>
                        </div>
                        
                        <div class="phone-setting-item">
                            <label class="phone-setting-label">
                                <input type="checkbox" id="phone-sound" ${settings.soundEnabled ? 'checked' : ''}>
                                <span class="phone-setting-title">提示音</span>
                            </label>
                            <small class="phone-setting-desc">收到消息时播放提示音</small>
                        </div>
                        
                        <div class="phone-setting-item">
                            <label class="phone-setting-label">
                                <input type="checkbox" id="phone-vibration" ${settings.vibrationEnabled ? 'checked' : ''}>
                                <span class="phone-setting-title">震动效果</span>
                            </label>
                            <small class="phone-setting-desc">收到消息时手机震动</small>
                        </div>
                        
                        <div class="phone-setting-divider"></div>
                        
                        <div class="phone-setting-item">
                            <button id="phone-clear-all-btn" class="phone-danger-btn">
                                <i class="fa-solid fa-trash"></i> 清空所有角色数据
                            </button>
                            <small class="phone-setting-desc">删除所有角色的手机数据，谨慎操作！</small>
                        </div>
                        
                        <div class="phone-setting-info">
                            <strong>ℹ️ 数据说明：</strong><br>
                            • 每个角色的手机数据独立存储<br>
                            • 切换角色时自动加载对应的数据<br>
                            • 关闭手机功能后，AI将无法发送手机消息
                        </div>
                    </div>
                    <div class="phone-dialog-footer">
                        <button id="phone-settings-save" class="phone-primary-btn">保存</button>
                        <button id="phone-settings-cancel" class="phone-secondary-btn">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        // 移除旧对话框
        document.getElementById('phone-settings-dialog')?.remove();
        
        // 添加新对话框
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // 绑定事件
        document.querySelector('.phone-dialog-close')?.addEventListener('click', closeSettingsDialog);
        document.getElementById('phone-settings-cancel')?.addEventListener('click', closeSettingsDialog);
        
        document.getElementById('phone-settings-save')?.addEventListener('click', () => {
            // 保存设置
            settings.enabled = document.getElementById('phone-enabled').checked;
            settings.soundEnabled = document.getElementById('phone-sound').checked;
            settings.vibrationEnabled = document.getElementById('phone-vibration').checked;
            
            storage.saveSettings(settings);
            
            // 更新UI
            updatePhoneStatus();
            
            closeSettingsDialog();
            alert('设置已保存！');
        });
        
        document.getElementById('phone-clear-all-btn')?.addEventListener('click', () => {
            if (confirm('⚠️ 警告！\n\n确定清空所有角色的手机数据？\n此操作将删除所有聊天记录、消息、联系人等！\n\n此操作不可恢复！')) {
                if (confirm('再次确认：真的要删除所有数据吗？')) {
                    storage.clearAllData();
                    currentApps = JSON.parse(JSON.stringify(APPS));
                    totalNotifications = 0;
                    updateNotificationBadge(0);
                    if (homeScreen) homeScreen.render();
                    closeSettingsDialog();
                    alert('所有数据已清空！');
                }
            }
        });
    }
    
    function closeSettingsDialog() {
        document.getElementById('phone-settings-dialog')?.remove();
    }
    
    // 更新手机状态（启用/禁用）
    function updatePhoneStatus() {
        const icon = document.getElementById('phoneDrawerIcon');
        const content = document.getElementById('phone-panel-content');
        
        if (settings.enabled) {
            icon.style.opacity = '1';
            icon.style.filter = 'none';
            icon.title = '虚拟手机 (已启用)';
            
            // 重新创建手机界面
            if (content && !phoneShell) {
                content.innerHTML = '';
                createPhoneInPanel();
            }
        } else {
            icon.style.opacity = '0.4';
            icon.style.filter = 'grayscale(1)';
            icon.title = '虚拟手机 (已禁用)';
            
            if (content) {
                content.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">手机功能已禁用<br><small>点击上方"设置"启用</small></div>';
            }
        }
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
        
        // ✅ 修复：无论是否已创建，都尝试创建或刷新手机界面
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
    
    // ========================================
    // 解析和执行指令
    // ========================================
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
        
        // 保存数据
        saveData();
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
    
    // 保存数据
    function saveData() {
        storage.saveApps(currentApps);
    }
    
    // 加载数据
    function loadData() {
        currentApps = storage.loadApps(JSON.parse(JSON.stringify(APPS)));
        totalNotifications = currentApps.reduce((sum, app) => sum + (app.badge || 0), 0);
        updateNotificationBadge(totalNotifications);
    }
    
    // ========================================
    // 监听酒馆消息
    // ========================================
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
        } catch (e) {
            console.error('❌ 消息处理失败:', e);
        }
    }
    
    // 监听聊天切换
    function onChatChanged() {
        console.log('🔄 聊天已切换，重新加载数据...');
        loadData();
        updateCharacterName();
        
        // 如果手机界面已打开，重新渲染
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
            // 加载数据
            loadData();
            
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
                const app = currentApps.find(a => a.id === appId);
                if (app) {
                    app.badge = 0;
                    totalNotifications = currentApps.reduce((sum, a) => sum + (a.badge || 0), 0);
                    updateNotificationBadge(totalNotifications);
                    saveData();
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
        executeCommand: executePhoneCommand,
        updateBadge: updateAppBadge,
        version: '1.0.0'
    };
    
})();
