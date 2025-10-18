// 聊天界面视图
export class ChatView {
    constructor(wechatApp) {
        this.app = wechatApp;
        this.inputText = '';
        this.showEmoji = false;
        this.showMore = false;
    }
    
    renderChatRoom(chat) {
        const messages = this.app.data.getMessages(chat.id);
        const userInfo = this.app.data.getUserInfo();
        
        return `
            <div class="chat-room">
                <!-- 消息列表 -->
                <div class="chat-messages" id="chat-messages">
                    ${messages.map(msg => this.renderMessage(msg, userInfo)).join('')}
                </div>
                
                <!-- 输入区 -->
                <div class="chat-input-area">
                    <div class="chat-input-bar">
                        <button class="input-btn" id="voice-btn">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <input type="text" class="chat-input" id="chat-input" 
                               placeholder="输入消息..." value="${this.inputText}">
                        <button class="input-btn" id="emoji-btn">
                            <i class="fa-solid fa-face-smile"></i>
                        </button>
                        <button class="input-btn" id="more-btn">
                            <i class="fa-solid fa-circle-plus"></i>
                        </button>
                        <button class="send-btn" id="send-btn" style="${this.inputText ? '' : 'display:none'}">
                            发送
                        </button>
                    </div>
                    
                    <!-- 表情面板 -->
                    ${this.showEmoji ? this.renderEmojiPanel() : ''}
                    
                    <!-- 更多功能面板 -->
                    ${this.showMore ? this.renderMorePanel() : ''}
                </div>
            </div>
        `;
    }
    
    renderMessage(msg, userInfo) {
        const isMe = msg.from === 'me' || msg.from === userInfo.name;
        
        return `
            <div class="chat-message ${isMe ? 'message-right' : 'message-left'}">
                ${!isMe ? `<div class="message-avatar">${msg.avatar || '👤'}</div>` : ''}
                <div class="message-content">
                    ${msg.type === 'image' ? `
                        <img src="${msg.content}" class="message-image">
                    ` : msg.type === 'voice' ? `
                        <div class="message-voice">
                            <i class="fa-solid fa-volume-high"></i>
                            <span>${msg.duration || '3"'}</span>
                        </div>
                    ` : msg.type === 'transfer' ? `
                        <div class="message-transfer">
                            <div class="transfer-icon">💰</div>
                            <div class="transfer-info">
                                <div class="transfer-amount">¥${msg.amount}</div>
                                <div class="transfer-desc">${msg.desc || '转账'}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="message-text">${this.parseEmoji(msg.content)}</div>
                    `}
                    <div class="message-time">${msg.time}</div>
                </div>
                ${isMe ? `<div class="message-avatar">${userInfo.avatar || '😊'}</div>` : ''}
            </div>
        `;
    }
    
    renderEmojiPanel() {
        const emojis = ['😊', '😂', '🤣', '😍', '😘', '🥰', '😭', '😅', '😁', '🤔', '😒', '🙄', 
                       '😤', '😡', '🥺', '😱', '😨', '😰', '😓', '🤗', '🤭', '🤫', '😏', '😌'];
        
        return `
            <div class="emoji-panel">
                <div class="emoji-grid">
                    ${emojis.map(emoji => `
                        <span class="emoji-item" data-emoji="${emoji}">${emoji}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderMorePanel() {
        return `
            <div class="more-panel">
                <div class="more-grid">
                    <div class="more-item" data-action="photo">
                        <div class="more-icon">
                            <i class="fa-solid fa-image"></i>
                        </div>
                        <div class="more-name">相册</div>
                    </div>
                    <div class="more-item" data-action="camera">
                        <div class="more-icon">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                        <div class="more-name">拍摄</div>
                    </div>
                    <div class="more-item" data-action="video">
                        <div class="more-icon">
                            <i class="fa-solid fa-video"></i>
                        </div>
                        <div class="more-name">视频通话</div>
                    </div>
                    <div class="more-item" data-action="location">
                        <div class="more-icon">
                            <i class="fa-solid fa-location-dot"></i>
                        </div>
                        <div class="more-name">位置</div>
                    </div>
                    <div class="more-item" data-action="transfer">
                        <div class="more-icon">
                            <i class="fa-solid fa-money-bill"></i>
                        </div>
                        <div class="more-name">转账</div>
                    </div>
                    <div class="more-item" data-action="redpacket">
                        <div class="more-icon">
                            <i class="fa-solid fa-gift"></i>
                        </div>
                        <div class="more-name">红包</div>
                    </div>
                    <div class="more-item" data-action="file">
                        <div class="more-icon">
                            <i class="fa-solid fa-folder"></i>
                        </div>
                        <div class="more-name">文件</div>
                    </div>
                    <div class="more-item" data-action="contact">
                        <div class="more-icon">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="more-name">名片</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    parseEmoji(text) {
    // 将[表情]转换为emoji
    const emojiMap = {
        '[微笑]': '😊',
        '[撇嘴]': '😥',
        '[色]': '😍',
        '[发呆]': '😳',
        '[得意]': '😏',
        '[流泪]': '😭',
        '[害羞]': '😊',
        '[闭嘴]': '🤐',
        '[睡]': '😴',
        '[大哭]': '😭',
        '[尴尬]': '😅',
        '[发怒]': '😠',
        '[调皮]': '😜',
        '[呲牙]': '😁',
        '[惊讶]': '😮',
        '[难过]': '😔',
        '[酷]': '😎',
        '[冷汗]': '😰',
        '[抓狂]': '😤',
        '[吐]': '🤮'
    };
    
          return text.replace(/```math([^```]+)```/g, function(match) { return emojiMap[match] || match; });
}
    
    bindEvents() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        // 输入框变化
        input?.addEventListener('input', (e) => {
            this.inputText = e.target.value;
            if (this.inputText) {
                sendBtn.style.display = 'block';
                document.getElementById('more-btn').style.display = 'none';
            } else {
                sendBtn.style.display = 'none';
                document.getElementById('more-btn').style.display = 'block';
            }
        });
        
        // 发送消息
        sendBtn?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // 表情按钮
        document.getElementById('emoji-btn')?.addEventListener('click', () => {
            this.showEmoji = !this.showEmoji;
            this.showMore = false;
            this.app.render();
        });
        
        // 更多按钮
        document.getElementById('more-btn')?.addEventListener('click', () => {
            this.showMore = !this.showMore;
            this.showEmoji = false;
            this.app.render();
        });
        
        // 选择表情
        document.querySelectorAll('.emoji-item').forEach(item => {
            item.addEventListener('click', () => {
                const emoji = item.dataset.emoji;
                this.inputText += emoji;
                input.value = this.inputText;
                input.focus();
            });
        });
        
        // 更多功能
        document.querySelectorAll('.more-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleMoreAction(action);
            });
        });
        
        // 滚动到底部
        const messagesDiv = document.getElementById('chat-messages');
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }
    
    sendMessage() {
        if (!this.inputText.trim()) return;
        
        const userInfo = this.app.data.getUserInfo();
        
        // 添加消息到数据
        this.app.data.addMessage(this.app.currentChat.id, {
            from: 'me',
            content: this.inputText,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            avatar: userInfo.avatar
        });
        
        // 如果开启了在线模式，发送到AI
        if (window.VirtualPhone?.settings?.onlineMode) {
            this.sendToAI(this.inputText);
        }
        
        // 清空输入
        this.inputText = '';
        this.app.render();
    }
    
    sendToAI(message) {
        // 发送消息到酒馆聊天框
        const event = new CustomEvent('phone:sendToChat', {
            detail: {
                message: `[📱手机] ${message}`,
                chatId: this.app.currentChat.id,
                chatName: this.app.currentChat.name
            }
        });
        window.dispatchEvent(event);
    }
    
    handleMoreAction(action) {
        switch (action) {
            case 'transfer':
                this.showTransferDialog();
                break;
            case 'redpacket':
                this.showRedPacketDialog();
                break;
            case 'video':
                this.startVideoCall();
                break;
            case 'photo':
                this.selectPhoto();
                break;
            default:
                this.app.phoneShell.showNotification('提示', `${action} 功能开发中...`, '🚧');
        }
    }
    
    showTransferDialog() {
        const amount = prompt('请输入转账金额：');
        if (amount && !isNaN(amount)) {
            this.app.data.addMessage(this.app.currentChat.id, {
                from: 'me',
                type: 'transfer',
                amount: amount,
                desc: '转账给你',
                time: '刚刚'
            });
            this.app.render();
        }
    }
    
    showRedPacketDialog() {
        this.app.phoneShell.showNotification('红包', '红包功能开发中...', '🧧');
    }
    
    startVideoCall() {
        this.app.phoneShell.showNotification('视频通话', '正在呼叫...', '📹');
    }
    
    selectPhoto() {
        this.app.phoneShell.showNotification('相册', '打开相册选择...', '📷');
    }
}
