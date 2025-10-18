// 微信数据管理
export class WechatData {
    constructor(storage) {
        this.storage = storage;
        this.storageKey = 'wechat_data';
        this.data = this.loadData();
    }
    
    loadData() {
        try {
            const key = this.getStorageKey();
            const saved = localStorage.getItem(key);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('加载微信数据失败:', e);
        }
        
        // 返回默认数据
        return {
            userInfo: {
                name: '我',
                wxid: 'wxid_' + Math.random().toString(36).substr(2, 9),
                avatar: '😊',
                coverImage: null
            },
            chats: [],
            contacts: this.getDefaultContacts(),
            messages: {},
            moments: this.getDefaultMoments()
        };
    }
    
    getStorageKey() {
        const context = this.storage.getContext();
        const charId = context?.characterId || 'default';
        const chatId = context?.chatId || 'default';
        return `${this.storageKey}_${charId}_${chatId}`;
    }
    
    getDefaultContacts() {
        return [
            { id: 'ai_assistant', name: 'AI助手', avatar: '🤖', letter: 'A' },
            { id: 'xiaoming', name: '小明', avatar: '👨', letter: 'X' },
            { id: 'xiaohong', name: '小红', avatar: '👩', letter: 'X' },
            { id: 'zhangsan', name: '张三', avatar: '🧑', letter: 'Z' },
            { id: 'lisi', name: '李四', avatar: '👤', letter: 'L' },
            { id: 'wangwu', name: '王五', avatar: '👥', letter: 'W' }
        ];
    }
    
    getDefaultMoments() {
        return [
            {
                id: '1',
                name: '小明',
                avatar: '👨',
                text: '今天天气真好！适合出去走走～',
                images: [],
                time: '2小时前',
                likes: 5,
                comments: 2,
                liked: false,
                likeList: ['小红', '张三'],
                commentList: [
                    { name: '小红', text: '确实！要不要一起去公园？' },
                    { name: '张三', text: '我也想去！' }
                ]
            },
            {
                id: '2',
                name: '小红',
                avatar: '👩',
                text: '分享一组今天拍的照片📷',
                images: [],
                time: '5小时前',
                likes: 12,
                comments: 3,
                liked: true,
                likeList: ['我', '小明', '张三', '李四']
            }
        ];
    }
    
    saveData() {
        try {
            const key = this.getStorageKey();
            localStorage.setItem(key, JSON.stringify(this.data));
        } catch (e) {
            console.error('保存微信数据失败:', e);
        }
    }
    
    // 用户信息
    getUserInfo() {
        return this.data.userInfo;
    }
    
    updateUserInfo(info) {
        Object.assign(this.data.userInfo, info);
        this.saveData();
    }
    
    // 聊天列表
    getChatList() {
        return this.data.chats;
    }
    
    getChat(chatId) {
        return this.data.chats.find(c => c.id === chatId);
    }
    
    createChat(chatInfo) {
        const chat = {
            id: chatInfo.id || Date.now().toString(),
            name: chatInfo.name,
            type: chatInfo.type || 'single',
            avatar: chatInfo.avatar,
            lastMessage: '',
            time: '刚刚',
            unread: 0,
            members: chatInfo.members || []
        };
        
        this.data.chats.push(chat);
        this.saveData();
        return chat;
    }
    
    getChatByContactId(contactId) {
        return this.data.chats.find(c => c.contactId === contactId);
    }
    
    // 消息
    getMessages(chatId) {
        if (!this.data.messages[chatId]) {
            this.data.messages[chatId] = [];
        }
        return this.data.messages[chatId];
    }
    
    addMessage(chatId, message) {
        if (!this.data.messages[chatId]) {
            this.data.messages[chatId] = [];
        }
        
        this.data.messages[chatId].push(message);
        
        // 更新聊天列表的最后消息
        const chat = this.getChat(chatId);
        if (chat) {
            chat.lastMessage = message.content || '[图片]';
            chat.time = message.time;
        }
        
        this.saveData();
    }
    
    // 联系人
    getContacts() {
        return this.data.contacts;
    }
    
    getContact(contactId) {
        return this.data.contacts.find(c => c.id === contactId);
    }
    
    addContact(contact) {
        this.data.contacts.push(contact);
        this.saveData();
    }
    
    // 朋友圈
    getMoments() {
        return this.data.moments;
    }
    
    getMoment(momentId) {
        return this.data.moments.find(m => m.id === momentId);
    }
    
    addMoment(moment) {
        this.data.moments.unshift(moment);
        this.saveData();
    }
}
