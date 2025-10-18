// 主屏幕
import { APPS } from '../config/apps.js';

export class HomeScreen {
    constructor(phoneShell, apps) {
        this.phoneShell = phoneShell;
        this.apps = apps || APPS;
    }
    
   render() {
    // ✅ 获取自定义壁纸
    const imageManager = new (window.ImageUploadManager || class {
        getWallpaper() { return null; }
    })(window.VirtualPhone?.storage);
    
    const customWallpaper = imageManager.getWallpaper();
    const wallpaperStyle = customWallpaper 
        ? `background-image: url('${customWallpaper}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`;
    
    const html = `
        <div class="home-screen">
            <div class="wallpaper" style="${wallpaperStyle}"></div>
                
                <div class="home-time">
                    <div class="time-large">${this.getCurrentTime()}</div>
                    <div class="date">${this.getCurrentDate()}</div>
                </div>
                
                <div class="app-grid">
                    ${this.apps.map(app => this.renderAppIcon(app)).join('')}
                </div>
                
                <div class="dock">
                    <div class="dock-app" data-app="wechat">💬</div>
                    <div class="dock-app" data-app="browser">🌐</div>
                    <div class="dock-app" data-app="photos">📷</div>
                    <div class="dock-app" data-app="games">🎮</div>
                </div>
            </div>
        `;
        
        this.phoneShell.setContent(html);
        this.bindEvents();
    }
    
    renderAppIcon(app) {
        const badge = app.badge > 0 ? `<span class="app-badge">${app.badge}</span>` : '';
        return `
            <div class="app-icon" data-app="${app.id}" style="--app-color: ${app.color}">
                <div class="app-icon-bg">
                    <span class="app-icon-emoji">${app.icon}</span>
                </div>
                ${badge}
                <div class="app-name">${app.name}</div>
            </div>
        `;
    }
    
    bindEvents() {
        const icons = this.phoneShell.screen.querySelectorAll('.app-icon, .dock-app');
        icons.forEach(icon => {
            icon.addEventListener('click', () => {
                const appId = icon.dataset.app;
                this.openApp(appId);
            });
        });
         // ✅ 监听壁纸更新
    window.addEventListener('phone:updateWallpaper', (e) => {
        this.render(); // 重新渲染主屏幕
    });
    }
    
    openApp(appId) {
        window.dispatchEvent(new CustomEvent('phone:openApp', { 
            detail: { appId } 
        }));
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    getCurrentDate() {
        const now = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekday = weekdays[now.getDay()];
        return `${month}月${day}日 ${weekday}`;
    }
}
