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
    
    // 简单替换每个表情
    let result = text;
    for (let emoji in emojiMap) {
        result = result.split(emoji).join(emojiMap[emoji]);
    }
    return result;
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

        // 添加头像点击事件（在 bindEvents 方法末尾）
document.querySelectorAll('.message-avatar').forEach(avatar => {
    avatar.addEventListener('click', (e) => {
        const message = e.target.closest('.chat-message');
        const isMe = message.classList.contains('message-right');
        
        if (!isMe) {
            // 显示设置面板
            this.showAvatarSettings(this.app.currentChat);
        }
    });
});
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
    // 获取设置
    const settings = window.VirtualPhone?.settings;
    
    if (!settings?.onlineMode) {
        console.log('⚠️ 在线模式未开启，消息不会发送到AI');
        return;
    }
    
    // 💡 核心改动：添加隐藏的手机模式标记
    // 这个标记会让AI知道"用户在用手机聊天，只回复手机消息"
    const phoneMessage = `((PHONE_CHAT_MODE))${message}`;
    
    // 发送到酒馆聊天框
    const textarea = document.querySelector('#send_textarea');
    if (textarea) {
        textarea.value = phoneMessage;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 自动发送
        setTimeout(() => {
            const sendButton = document.querySelector('#send_but');
            if (sendButton) {
                sendButton.click();
                console.log('📱 已发送手机消息到AI:', message);
            }
        }, 100);
    } else {
        console.warn('❌ 找不到聊天输入框');
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

// 显示头像设置面板
showAvatarSettings(chat) {
    const modal = document.createElement('div');
    modal.className = 'avatar-settings-modal';
    modal.innerHTML = `
        <div class="avatar-settings-content">
            <div class="avatar-settings-title">设置备注和头像</div>
            <div class="avatar-preview" id="avatar-preview">
                ${chat.avatar || '👤'}
            </div>
            <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
            <button class="avatar-upload-btn" onclick="document.getElementById('avatar-upload').click()">
                上传头像
            </button>
            <input type="text" class="remark-input" id="remark-input" 
                   placeholder="设置备注名" value="${chat.name}">
            <div class="avatar-settings-buttons">
                <button class="save-avatar-btn" id="save-avatar">保存</button>
                <button class="cancel-avatar-btn" id="cancel-avatar">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定事件
    document.getElementById('cancel-avatar').onclick = () => modal.remove();
    
    document.getElementById('save-avatar').onclick = () => {
        const remark = document.getElementById('remark-input').value;
        if (remark) {
            chat.name = remark;
            this.app.data.saveData();
            this.app.render();
        }
        modal.remove();
    };
    
    document.getElementById('avatar-upload').onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('avatar-preview');
                preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
                chat.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
}

// 显示输入状态
showTypingStatus() {
    const header = document.querySelector('.wechat-header-title');
    if (header && this.app.currentChat) {
        const originalContent = header.innerHTML;
        header.innerHTML = `
            <div>${this.app.currentChat.name}</div>
            <div class="typing-status">对方正在输入<span class="typing-dots">...</span></div>
        `;
        
        // 3秒后恢复
        setTimeout(() => {
            header.innerHTML = originalContent;
        }, 3000);
    }
}
