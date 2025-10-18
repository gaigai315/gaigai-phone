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
        const style = document.createElement('style');
        style.id = 'wechat-styles';
        style.textContent = `
/* 微信APP完整样式 */
.wechat-app {
    width: 100%;
    height: 100%;
    background: #ededed;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, sans-serif;
}

.wechat-header {
    background: #ededed;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    border-bottom: 0.5px solid #d8d8d8;
    flex-shrink: 0;
}

.wechat-header-left {
    width: 60px;
}

.wechat-back-btn {
    background: none;
    border: none;
    color: #576b95;
    font-size: 16px;
    padding: 8px;
    cursor: pointer;
}

.wechat-header-title {
    font-size: 17px;
    font-weight: 600;
    color: #000;
    flex: 1;
    text-align: center;
}

.header-badge {
    color: #576b95;
    font-size: 14px;
}

.wechat-header-right {
    width: 60px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.wechat-header-btn {
    background: none;
    border: none;
    color: #000;
    font-size: 18px;
    cursor: pointer;
}

.wechat-content {
    flex: 1;
    overflow-y: auto;
    background: #fff;
}

.wechat-tabbar {
    height: 50px;
    background: #f7f7f7;
    border-top: 0.5px solid #d8d8d8;
    display: flex;
    flex-shrink: 0;
}

.wechat-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    color: #999;
    font-size: 10px;
}

.wechat-tab.active {
    color: #07c160;
}

.wechat-tab i {
    font-size: 22px;
    margin-bottom: 2px;
}

.tab-badge {
    position: absolute;
    top: 3px;
    right: calc(50% - 20px);
    background: #ff3b30;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
}

.wechat-chat-list {
    background: #fff;
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 0.5px solid #e5e5e5;
    cursor: pointer;
    background: #fff;
}

.chat-item:active {
    background: #ececec;
}

.chat-avatar-wrapper {
    margin-right: 12px;
    flex-shrink: 0;
}

.chat-avatar {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
}

.chat-info {
    flex: 1;
    min-width: 0;
}

.chat-name {
    font-size: 17px;
    color: #000;
    margin-bottom: 5px;
    font-weight: 500;
}

.group-count {
    font-size: 13px;
    color: #999;
}

.chat-last-msg {
    font-size: 14px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chat-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    flex-shrink: 0;
}

.chat-time {
    font-size: 12px;
    color: #b2b2b2;
    margin-bottom: 5px;
}

.chat-badge {
    background: #ff3b30;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 10px;
}

.wechat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    color: #b2b2b2;
}

.wechat-empty i {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 15px;
}

.wechat-discover,
.wechat-profile {
    background: #fff;
}

.discover-item,
.profile-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    cursor: pointer;
    background: #fff;
    border-bottom: 0.5px solid #e5e5e5;
}

.discover-item:active,
.profile-item:active {
    background: #ececec;
}

.discover-icon,
.profile-avatar {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
}

.discover-name,
.profile-name {
    flex: 1;
    font-size: 16px;
    color: #000;
}

.discover-arrow,
.profile-arrow {
    color: #c7c7cc;
    font-size: 14px;
}

.discover-divider,
.profile-divider {
    height: 8px;
    background: #ededed;
}

.profile-header {
    display: flex;
    align-items: center;
    padding: 20px 15px;
}

.profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-size: 32px;
}

.profile-info {
    flex: 1;
}

.profile-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
}

.profile-id {
    font-size: 14px;
    color: #999;
}

.profile-qr {
    font-size: 18px;
    color: #999;
}

.profile-icon {
    font-size: 20px;
    margin-right: 12px;
    width: 24px;
}
        `;
        document.head.appendChild(style);
        console.log('✅ 微信样式已内联加载');
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
