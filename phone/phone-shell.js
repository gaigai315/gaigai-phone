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
        
        return this.container;
    }
    
 bindPanelEvents() {
    const homeBtn = document.getElementById('phone-panel-home');
    const powerBtn = document.getElementById('phone-panel-power');
    
    // 返回主页
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            this.goHome();
        });
    }
    
    // 锁屏 - 模拟点击顶部图标
    if (powerBtn) {
        powerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 方案1：直接触发图标点击
            const icon = document.getElementById('phoneDrawerIcon');
            if (icon) {
                console.log('🔒 触发图标点击关闭');
                icon.click();
                return;
            }
            
            // 方案2：手动操作DOM
            const panel = document.getElementById('phone-panel');
            if (panel && panel.classList.contains('openDrawer')) {
                panel.classList.remove('openDrawer');
                panel.classList.add('closedDrawer');
                
                const drawerIcon = document.getElementById('phoneDrawerIcon');
                if (drawerIcon) {
                    drawerIcon.classList.remove('openIcon');
                    drawerIcon.classList.add('closedIcon');
                }
                
                console.log('🔒 手动关闭抽屉');
            }
        });
    }
}
    
    getCurrentTime() {
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
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
