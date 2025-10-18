// APP配置文件
export const APPS = [
    {
        id: 'wechat',
        name: '微信',
        icon: '💬',
        color: '#07c160',
        badge: 0,  // 未读消息数
        data: {
            contacts: [],
            messages: [],
            moments: []
        }
    },
    {
        id: 'browser',
        name: '浏览器',
        icon: '🌐',
        color: '#1890ff',
        data: {
            bookmarks: [],
            history: [],
            currentUrl: 'about:blank'
        }
    },
    {
        id: 'photos',
        name: '相册',
        icon: '📷',
        color: '#ff4d4f',
        data: {
            albums: [],
            photos: []
        }
    },
    {
        id: 'games',
        name: '游戏',
        icon: '🎮',
        color: '#722ed1',
        data: {
            installed: ['2048', '贪吃蛇', '俄罗斯方块']
        }
    },
    {
        id: 'music',
        name: '音乐',
        icon: '🎵',
        color: '#eb2f96',
        data: {
            playlists: [],
            nowPlaying: null
        }
    },
    {
        id: 'notes',
        name: '备忘录',
        icon: '📝',
        color: '#faad14',
        data: {
            notes: []
        }
    },
    {
        id: 'calendar',
        name: '日历',
        icon: '📅',
        color: '#52c41a',
        data: {
            events: []
        }
    },
    {
        id: 'settings',
        name: '设置',
        icon: '⚙️',
        color: '#8c8c8c',
        data: {}
    }
];

// 手机配置
export const PHONE_CONFIG = {
    brand: 'iPhone',  // 或 'Android'
    model: 'iPhone 14 Pro',
    theme: 'light',   // 'light' 或 'dark'
    wallpaper: 'default',
    position: 'right', // 'left' 或 'right'（手机显示在聊天窗口左边还是右边）
    size: 'medium'     // 'small', 'medium', 'large'（手机大小）
};
