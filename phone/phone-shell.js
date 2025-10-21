// 手机外壳
import { PHONE_CONFIG } from '../config/apps.js';

export class PhoneShell {
    constructor() {
        this.container = null;
        this.screen = null;
        this.isVisible = false;
        this.currentApp = null;
    }
    
    createInPanel(panelContainer) {
        if (!panelContainer) {
            console.error('❌ 面板容器不存在');
            return;
        }
        
        this.container = document.createElement('div');
        this.container.className = 'phone-in-panel';
        
        this.container.innerHTML = `
    <div class="phone-body-panel">
        <div class="phone-notch"></div>
        
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
        
        <div class="phone-screen" id="phone-screen"></div>
        
        <div class="phone-home-indicator"></div>
    </div>
`;
        
        panelContainer.appendChild(this.container);
        this.screen = document.getElementById('phone-screen');
        
        this.bindPanelEvents();
        this.startClock();
        
        return this.container;
    }

   bindPanelEvents() {
    // 按钮已移除，功能改为手势操作
    // 点击Home指示器返回主页
    const homeIndicator = this.container.querySelector('.phone-home-indicator');
    if (homeIndicator) {
        homeIndicator.style.cursor = 'pointer';
        homeIndicator.addEventListener('click', () => {
            console.log('🏠 点击Home指示器返回主页');
            this.goHome();
        });
    }
}
    
    getCurrentTime() {
    const timeManager = window.VirtualPhone?.timeManager;
    
    if (timeManager) {
        const storyTime = timeManager.getCurrentStoryTime();
        return storyTime.time;
    }
    
    // 降级方案
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
    
    startClock() {
        setInterval(() => {
            const timeEl = this.container?.querySelector('.statusbar-left .time');
            if (timeEl) {
                timeEl.textContent = this.getCurrentTime();
            }
        }, 1000);
    }
    
    goHome() {
        this.currentApp = null;
        window.dispatchEvent(new CustomEvent('phone:goHome'));
    }
    
    toggleScreen() {
        if (this.container) {
            this.container.classList.toggle('screen-off');
        }
    }
    
    setContent(html) {
        if (this.screen) {
            this.screen.innerHTML = html;
        }
    }
    
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
    
    // ✅ 改为插入到手机屏幕内
    const phoneBody = this.container.querySelector('.phone-body-panel');
    if (phoneBody) {
        phoneBody.appendChild(notification);
    } else {
        // 兜底方案
        this.container.appendChild(notification);
    }
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
