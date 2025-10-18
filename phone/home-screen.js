// 主屏幕 - 显示所有APP图标
import { APPS } from '../config/apps.js';

export class HomeScreen {
    constructor(phoneShell, apps) {
        this.phoneShell = phoneShell;
        this.apps = apps || APPS;  // ✅ 支持传入自定义apps
    }
    
    render() {
        const html = `
            <div class="home-screen">
                <!-- 壁纸 -->
                <div class="wallpaper"></div>
                
                <!-- 时间和日期 -->
                <div class="home-time">
                    <div class="time-large">${this.getCurrentTime()}</div>
                    <div class="date">${this.getCurrentDate()}</div>
                </div>
                
                <!-- APP网格 -->
                <div class="app-grid">
                    ${this.apps.map(app => this.renderAppIcon(app)).join('')}
                </div>
                
                <!-- Dock栏 -->
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
    }
    
    openApp(appId) {
        window.dispatchEvent(new CustomEvent('phone:openApp', { 
            detail: { appId } 
        }));
    }
    
    getCurrentTime() {
        // 优先使用剧情时间
        const storyTime = this.getStoryTime();
        if (storyTime) {
            return storyTime;
        }
        
        // 没有剧情时间则用真实时间
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    getCurrentDate() {
        // 优先使用剧情日期
        const storyDate = this.getStoryDate();
        if (storyDate) {
            return storyDate;
        }
        
        // 没有剧情日期则用真实日期
        const now = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekday = weekdays[now.getDay()];
        return `${month}月${day}日 ${weekday}`;
    }
    
    // 从记忆表格获取剧情时间
    getStoryTime() {
        try {
            // 尝试从Gaigai记忆表格获取
            if (window.Gaigai && window.Gaigai.m) {
                const mainStory = window.Gaigai.m.get(0); // 主线剧情表
                if (mainStory && mainStory.r.length > 0) {
                    const lastRow = mainStory.r[mainStory.r.length - 1];
                    // 优先用完结时间，没有则用开始时间
                    const timeStr = lastRow[2] || lastRow[1]; // 列2是完结时间，列1是开始时间
                    if (timeStr) {
                        // 提取时间，例如 "上午(08:30)" -> "08:30"
                        const match = timeStr.match(/(\d{1,2}:\d{2})/);
                        if (match) return match[1];
                    }
                }
            }
        } catch (e) {
            console.warn('获取剧情时间失败:', e);
        }
        return null;
    }
    
    // 从记忆表格获取剧情日期
    getStoryDate() {
        try {
            if (window.Gaigai && window.Gaigai.m) {
                const mainStory = window.Gaigai.m.get(0);
                if (mainStory && mainStory.r.length > 0) {
                    const lastRow = mainStory.r[mainStory.r.length - 1];
                    const dateStr = lastRow[0]; // 列0是日期
                    if (dateStr) {
                        // 提取日期，例如 "2024年3月15日" -> "3月15日 星期五"
                        const match = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
                        if (match) {
                            const year = parseInt(match[1]);
                            const month = parseInt(match[2]);
                            const day = parseInt(match[3]);
                            const date = new Date(year, month - 1, day);
                            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                            const weekday = weekdays[date.getDay()];
                            return `${month}月${day}日 ${weekday}`;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('获取剧情日期失败:', e);
        }
        return null;
    }
}
