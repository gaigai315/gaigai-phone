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
                    <button class="phone-panel-btn" id="phone-panel-power" title="锁屏并关闭">🔒 锁屏</button>
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
        
        // 锁屏并关闭抽屉
        if (powerBtn) {
            powerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔒 锁屏按钮被点击');
                
                // 直接触发顶部图标点击（模拟用户点击）
                const icon = document.getElementById('phoneDrawerIcon');
                if (icon) {
                    // 使用原生点击事件
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    icon.dispatchEvent(clickEvent);
                    console.log('✅ 已触发图标关闭事件');
                } else {
                    console.warn('⚠️ 找不到手机图标，尝试手动关闭');
                    // 备用方案：手动操作DOM
                    this.manualCloseDrawer();
                }
            });
        }
    }
    
    // 备用方案：手动关闭抽屉
    manualCloseDrawer() {
        const panel = document.getElementById('phone-panel');
        const icon = document.getElementById('phoneDrawerIcon');
        
        if (panel && panel.classList.contains('openDrawer')) {
            panel.classList.remove('openDrawer');
            panel.classList.add('closedDrawer');
            
            if (icon) {
                icon.classList.remove('openIcon');
                icon.classList.add('closedIcon');
            }
            
            console.log('✅ 手动关闭成功');
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
