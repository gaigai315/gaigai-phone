// 手机外壳 - 包含屏幕、按钮、状态栏
import { PHONE_CONFIG } from '../config/apps.js';

export class PhoneShell {
    constructor() {
        this.container = null;
        this.screen = null;
        this.isVisible = true;
        this.currentApp = null;
    }
    
    // 创建手机UI
    create() {
        this.container = document.createElement('div');
        this.container.id = 'virtual-phone';
        this.container.className = `phone-container ${PHONE_CONFIG.position} ${PHONE_CONFIG.size}`;
        
        this.container.innerHTML = `
            <!-- 手机外壳 -->
            <div class="phone-body">
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
                
                <!-- Home键指示器 (iPhone样式) -->
                <div class="phone-home-indicator"></div>
                
                <!-- 侧边按钮 -->
                <div class="phone-buttons">
                    <button class="phone-btn-power" title="电源键">⏻</button>
                    <button class="phone-btn-volume" title="音量">🔊</button>
                    <button class="phone-btn-home" title="返回主页">🏠</button>
                </div>
            </div>
            
            <!-- 折叠/展开按钮 -->
            <button class="phone-toggle" id="phone-toggle">
                <span class="toggle-icon">📱</span>
            </button>
        `;
        
        document.body.appendChild(this.container);
        this.screen = document.getElementById('phone-screen');
        
        this.bindEvents();
        this.startClock();
        
        return this.container;
    }
    
    // 绑定事件
    bindEvents() {
        // 折叠/展开
        const toggle = document.getElementById('phone-toggle');
        toggle?.addEventListener('click', () => this.toggle());
        
        // 返回主页
        const homeBtn = this.container.querySelector('.phone-btn-home');
        homeBtn?.addEventListener('click', () => this.goHome());
        
        // 电源键
        const powerBtn = this.container.querySelector('.phone-btn-power');
        powerBtn?.addEventListener('click', () => this.toggleScreen());
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
            const timeEl = this.container.querySelector('.statusbar-left .time');
            if (timeEl) {
                timeEl.textContent = this.getCurrentTime();
            }
        }, 1000);
    }
    
    // 折叠/展开手机
    toggle() {
        this.isVisible = !this.isVisible;
        this.container.classList.toggle('collapsed', !this.isVisible);
    }
    
    // 返回主页
    goHome() {
        this.currentApp = null;
        window.dispatchEvent(new CustomEvent('phone:goHome'));
    }
    
    // 开关屏幕
    toggleScreen() {
        this.container.classList.toggle('screen-off');
    }
    
    // 设置屏幕内容
    setContent(html) {
        if (this.screen) {
            this.screen.innerHTML = html;
        }
    }
    
    // 显示通知
    showNotification(title, message, icon = '📱') {
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
