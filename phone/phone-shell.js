// 手机外壳 - 包含屏幕、按钮、状态栏
import { PHONE_CONFIG } from '../config/apps.js';

export class PhoneShell {
    constructor() {
        this.container = null;
        this.screen = null;
        this.isVisible = false;
        this.currentApp = null;
    }
    
    // ✅ 在面板中创建（新方法）
    createInPanel(panelContainer) {
        if (!panelContainer) {
            console.error('❌ 面板容器不存在');
            return;
        }
        
        this.container = document.createElement('div');
        this.container.className = 'phone-in-panel';
        
        this.container.innerHTML = `
            <div class="phone-body-panel">
                <!-- 刘海 -->
                <div class="phone-notch"></div>
                
                <!-- 状态栏 -->
                <div class="phone-statusbar">
                    <div class="statusbar-left">
                        <span class="time">${this.getCurrentTime()}</span>
                    </div>
                    <div class="statusbar-right">
                        <span class="signal">📶</span>
                        <span class="wifi">📡</span>
                        <span class="battery">🔋 85%</span>
                    </div>
                </div>
                
                <!-- 屏幕内容区 -->
                <div class="phone-screen" id="phone-screen">
                    <!-- APP内容会在这里显示 -->
                </div>
                
                <!-- Home键指示器 -->
                <div class="phone-home-indicator"></div>
                
                <!-- 底部按钮 -->
                <div class="phone-panel-buttons">
                    <button class="phone-panel-btn" id="phone-panel-home" title="返回主页">🏠 主页</button>
                    <button class="phone-panel-btn" id="phone-panel-power" title="锁屏">🔒 锁屏</button>
                </div>
            </div>
        `;
        
        panelContainer.appendChild(this.container);
        this.screen = document.getElementById('phone-screen');
        
        this.bindPanelEvents();
        this.startClock();
        
        console.log('✅ 手机已渲染到面板');
        
        return this.container;
    }
    
    // 绑定面板事件
    bindPanelEvents() {
        const homeBtn = document.getElementById('phone-panel-home');
        homeBtn?.addEventListener('click', () => {
            console.log('点击了主页按钮');
            this.goHome();
        });
        
        const powerBtn = document.getElementById('phone-panel-power');
        powerBtn?.addEventListener('click', () => {
            console.log('点击了锁屏按钮');
            this.toggleScreen();
        });
    }
    
    // 获取当前时间
    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // 更新时钟
    startClock() {
        setInterval(() => {
            const timeEl = this.container?.querySelector('.statusbar-left .time');
            if (timeEl) {
                timeEl.textContent = this.getCurrentTime();
            }
        }, 1000);
    }
    
    // 返回主页
    goHome() {
        this.currentApp = null;
        window.dispatchEvent(new CustomEvent('phone:goHome'));
    }
    
    // 开关屏幕
    toggleScreen() {
        if (this.container) {
            this.container.classList.toggle('screen-off');
        }
    }
    
    // 设置屏幕内容
    setContent(html) {
        if (this.screen) {
            this.screen.innerHTML = html;
        }
    }
    
    // 显示通知
    showNotification(title, message, icon = '📱') {
        if (!this.container) return;
        
        const notification = document.createElement('div');
        notification.className = 'phone-notification';
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
