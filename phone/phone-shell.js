// 手机外壳 - 包含屏幕、按钮、状态栏
import { PHONE_CONFIG } from '../config/apps.js';

export class PhoneShell {
    constructor() {
        this.container = null;
        this.screen = null;
        this.isVisible = false;
        this.currentApp = null;
        this.topButton = null;
    }
    
    // 创建手机UI
    create() {
        // 先创建顶部按钮
        this.createTopButton();
        
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
        `;
        
        document.body.appendChild(this.container);
        this.screen = document.getElementById('phone-screen');
        
        // 初始状态为隐藏
        this.container.classList.add('hidden');
        this.isVisible = false;
        
        this.bindEvents();
        this.startClock();
        
        return this.container;
    }
    
    // 创建顶部按钮
    createTopButton() {
        // 移除旧按钮
        const oldBtn = document.getElementById('phone-top-button');
        if (oldBtn) oldBtn.remove();
        
        const topButton = document.createElement('button');
        topButton.id = 'phone-top-button';
        topButton.innerHTML = `
            📱
            <span class="notification-dot" id="phone-notification-dot" style="display:none;">0</span>
        `;
        topButton.title = '虚拟手机';
        
        topButton.addEventListener('click', () => {
            this.togglePhone();
        });
        
        document.body.appendChild(topButton);
        this.topButton = topButton;
    }
    
    // 切换手机显示/隐藏
    togglePhone() {
        if (this.container.classList.contains('hidden')) {
            this.container.classList.remove('hidden');
            this.container.classList.add('visible');
            this.isVisible = true;
        } else {
            this.container.classList.add('hidden');
            this.container.classList.remove('visible');
            this.isVisible = false;
        }
    }
    
    // 更新顶部按钮红点
    updateNotificationBadge(count) {
        const dot = document.getElementById('phone-notification-dot');
        if (!dot) return;
        
        if (count > 0) {
            dot.style.display = 'flex';
            dot.textContent = count > 99 ? '99+' : count;
        } else {
            dot.style.display = 'none';
        }
    }
    
    // 绑定事件
    bindEvents() {
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
