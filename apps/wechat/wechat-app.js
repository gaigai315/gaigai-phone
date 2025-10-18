// 微信APP主程序
import { ChatView } from './chat-view.js';
import { ContactsView } from './contacts-view.js';
import { MomentsView } from './moments-view.js';
import { WechatData } from './wechat-data.js';

export class WechatApp {
    constructor(phoneShell, storage) {
        this.phoneShell = phoneShell;
        this.storage = storage;
        this.data = new WechatData(storage);
        this.currentView = 'chats'; // chats, contacts, discover, me
        this.currentChat = null;
        
        // 初始化视图
        this.chatView = new ChatView(this);
        this.contactsView = new ContactsView(this);
        this.momentsView = new MomentsView(this);
        
        // 加载样式
        this.loadStyles();
    }
    
    loadStyles() {
        if (!document.getElementById('wechat-styles')) {
            const link = document.createElement('link');
            link.id = 'wechat-styles';
            link.rel = 'stylesheet';
            link.href = '/scripts/extensions/third-party/虚拟手机/apps/wechat/wechat.css';
            document.head.appendChild(link);
        }
    }
    
    render() {
        const chatList = this.data.getChatList();
        const unreadCount = chatList.reduce((sum, chat) => sum + chat.unread, 0);
        
        const html = `
            <div class="wechat-app">
                <!-- 顶部栏 -->
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="wechat-back">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">
                        ${this.currentChat ? this.currentChat.name : '微信'}
                        ${unreadCount > 0 && !this.currentChat ? `<span class="header-badge">(${unreadCount})</span>` : ''}
                    </div>
                    <div class="wechat-header-right">
                        ${this.currentChat ? `
                            <button class="wechat-header-btn" id="chat-info">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                        ` : `
                            <button class="wechat-header-btn" id="wechat-search">
                                <i class="fa-solid fa-search"></i>
                            </button>
                            <button class="wechat-header-btn" id="wechat-add">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        `}
                    </div>
                </div>
                
                <!-- 内容区 -->
                <div class="wechat-content" id="wechat-content">
                    ${this.renderContent()}
                </div>
                
                <!-- 底部导航（主页才显示）-->
                ${!this.currentChat ? `
                    <div class="wechat-tabbar">
                        <div class="wechat-tab ${this.currentView === 'chats' ? 'active' : ''}" data-view="chats">
                            <i class="fa-solid fa-comment"></i>
                            <span>微信</span>
                            ${unreadCount > 0 ? `<span class="tab-badge">${unreadCount}</span>` : ''}
                        </div>
                        <div class="wechat-tab ${this.currentView === 'contacts' ? 'active' : ''}" data-view="contacts">
                            <i class="fa-solid fa-address-book"></i>
                            <span>通讯录</span>
                        </div>
                        <div class="wechat-tab ${this.currentView === 'discover' ? 'active' : ''}" data-view="discover">
                            <i class="fa-solid fa-compass"></i>
                            <span>发现</span>
                        </div>
                        <div class="wechat-tab ${this.currentView === 'me' ? 'active' : ''}" data-view="me">
                            <i class="fa-solid fa-user"></i>
                            <span>我</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.phoneShell.setContent(html);
        this.bindEvents();
    }
    
    renderContent() {
        if (this.currentChat) {
            return this.chatView.renderChatRoom(this.currentChat);
        }
        
        switch (this.currentView) {
            case 'chats':
                return this.renderChatList();
            case 'contacts':
                return this.contactsView.render();
            case 'discover':
                return this.renderDiscover();
            case 'me':
                return this.renderProfile();
            default:
                return this.renderChatList();
        }
    }
    
    renderChatList() {
        const chats = this.data.getChatList();
        
        if (chats.length === 0) {
            return `
                <div class="wechat-empty">
                    <i class="fa-solid fa-comments" style="font-size: 48px; color: #ccc;"></i>
                    <p>暂无聊天</p>
                </div>
            `;
        }
        
        return `
            <div class="wechat-chat-list">
                ${chats.map(chat => `
                    <div class="chat-item" data-chat-id="${chat.id}">
                        <div class="chat-avatar">
                            ${chat.avatar || (chat.type === 'group' ? '👥' : '👤')}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">
                                ${chat.name}
                                ${chat.type === 'group' ? `<span class="group-count">(${chat.members?.length || 2})</span>` : ''}
                            </div>
                            <div class="chat-last-msg">${chat.lastMessage || '暂无消息'}</div>
                        </div>
                        <div class="chat-meta">
                            <div class="chat-time">${chat.time || '刚刚'}</div>
                            ${chat.unread > 0 ? `<span class="chat-badge">${chat.unread > 99 ? '99+' : chat.unread}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderDiscover() {
        return `
            <div class="wechat-discover">
                <div class="discover-item" id="moments-btn">
                    <div class="discover-icon" style="background: #ff6b6b;">
                        <i class="fa-solid fa-circle-nodes"></i>
                    </div>
                    <div class="discover-name">朋友圈</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-divider"></div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #4ecdc4;">
                        <i class="fa-solid fa-video"></i>
                    </div>
                    <div class="discover-name">视频号</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #95e1d3;">
                        <i class="fa-solid fa-tv"></i>
                    </div>
                    <div class="discover-name">直播</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-divider"></div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #f38181;">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                    <div class="discover-name">扫一扫</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #aa96da;">
                        <i class="fa-solid fa-shake"></i>
                    </div>
                    <div class="discover-name">摇一摇</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderProfile() {
        const userInfo = this.data.getUserInfo();
        return `
            <div class="wechat-profile">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${userInfo.avatar || '😊'}
                    </div>
                    <div class="profile-info">
                        <div class="profile-name">${userInfo.name || '用户'}</div>
                        <div class="profile-id">微信号：${userInfo.wxid || 'wx_user001'}</div>
                    </div>
                    <div class="profile-qr">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                </div>
                
                <div class="profile-divider"></div>
                
                <div class="profile-item">
                    <div class="profile-icon" style="color: #f39c12;">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <div class="profile-name">支付</div>
                    <div class="profile-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-divider"></div>
                
                <div class="profile-item">
                    <div class="profile-icon" style="color: #e74c3c;">
                        <i class="fa-solid fa-star"></i>
                    </div>
                    <div class="profile-name">收藏</div>
                    <div class="profile-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-item">
                    <div class="profile-icon" style="color: #3498db;">
                        <i class="fa-solid fa-images"></i>
                    </div>
                    <div class="profile-name">相册</div>
                    <div class="profile-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-item">
                    <div class="profile-icon" style="color: #9b59b6;">
                        <i class="fa-solid fa-credit-card"></i>
                    </div>
                    <div class="profile-name">卡包</div>
                    <div class="profile-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-item">
                    <div class="profile-icon" style="color: #2ecc71;">
                        <i class="fa-solid fa-face-smile"></i>
                    </div>
                    <div class="profile-name">表情</div>
                    <div class="profile-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-divider"></div>
                
                <div class="profile-item">
                    <div class="profile-icon" style="color: #95a5a6;">
                        <i class="fa-solid fa-gear"></i>
                    </div>
                    <div class="profile-name">设置</div>
                    <div class="profile-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // 返回按钮
        document.getElementById('wechat-back')?.addEventListener('click', () => {
            if (this.currentChat) {
                this.currentChat = null;
                this.render();
            } else {
                window.dispatchEvent(new CustomEvent('phone:goHome'));
            }
        });
        
        // 底部导航切换
        document.querySelectorAll('.wechat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentView = tab.dataset.view;
                this.render();
            });
        });
        
        // 聊天列表点击
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatId = item.dataset.chatId;
                this.openChat(chatId);
            });
        });
        
        // 朋友圈入口
        document.getElementById('moments-btn')?.addEventListener('click', () => {
            this.openMoments();
        });
        
        // 绑定聊天界面事件
        if (this.currentChat) {
            this.chatView.bindEvents();
        }
    }
    
    openChat(chatId) {
        const chat = this.data.getChat(chatId);
        if (chat) {
            chat.unread = 0; // 清空未读
            this.currentChat = chat;
            this.render();
        }
    }
    
    openMoments() {
        this.momentsView.render();
    }
    
    // 接收新消息（从AI）
    receiveMessage(data) {
        const chatId = data.chatId || data.from || 'ai_chat';
        
        // 确保聊天存在
        let chat = this.data.getChat(chatId);
        if (!chat) {
            chat = this.data.createChat({
                id: chatId,
                name: data.from || 'AI助手',
                type: 'single',
                avatar: data.avatar || '🤖'
            });
        }
        
        // 添加消息
        if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach(msg => {
                this.data.addMessage(chatId, {
                    from: data.from || 'AI',
                    content: msg.text || msg.message,
                    time: msg.timestamp || '刚刚',
                    type: 'text'
                });
            });
            
            // 如果不在当前聊天，增加未读
            if (!this.currentChat || this.currentChat.id !== chatId) {
                chat.unread = (chat.unread || 0) + data.messages.length;
            }
        } else if (data.message) {
            this.data.addMessage(chatId, {
                from: data.from || 'AI',
                content: data.message,
                time: data.timestamp || '刚刚',
                type: 'text'
            });
            
            if (!this.currentChat || this.currentChat.id !== chatId) {
                chat.unread = (chat.unread || 0) + 1;
            }
        }
        
        // 刷新界面
        if (this.currentChat && this.currentChat.id === chatId) {
            this.render();
        }
        
        this.data.saveData();
    }
}
