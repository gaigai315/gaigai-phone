// 聊天界面视图
export class ChatView {
    constructor(wechatApp) {
    this.app = wechatApp;
    this.inputText = '';
    this.showEmoji = false;
    this.showMore = false;
    this.emojiTab = 'default'; // ← 新增：表情标签状态
}
    
    renderChatRoom(chat) {
    const messages = this.app.wechatData.getMessages(chat.id);
    const userInfo = this.app.wechatData.getUserInfo();
        
        return `
    <div class="chat-room" style="background: ${chat.background || '#ededed'};">
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
` : msg.type === 'redpacket' ? `
    <div class="message-redpacket">
        <div class="redpacket-icon">🧧</div>
        <div class="redpacket-wish">${msg.wish || '恭喜发财，大吉大利'}</div>
        <div class="redpacket-amount">¥${msg.amount}</div>
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
    
    const customEmojis = this.app.wechatData.getCustomEmojis();
    
    return `
        <div class="emoji-panel">
            <!-- 🔥 新增：表情标签 -->
            <div class="emoji-tabs">
                <div class="emoji-tab ${this.emojiTab !== 'custom' ? 'active' : ''}" data-tab="default">
                    系统表情
                </div>
                <div class="emoji-tab ${this.emojiTab === 'custom' ? 'active' : ''}" data-tab="custom">
                    我的表情
                </div>
            </div>
            
            <div class="emoji-grid">
                ${this.emojiTab === 'custom' ? `
                    <!-- 自定义表情 -->
                    ${customEmojis.map(emoji => `
                        <span class="emoji-item custom-emoji-item" data-emoji-type="custom" data-emoji-id="${emoji.id}" title="${emoji.name}">
                            <img src="${emoji.image}" alt="${emoji.name}">
                        </span>
                    `).join('')}
                    
                    <!-- 添加表情按钮 -->
                    <span class="emoji-item emoji-add" id="add-custom-emoji">
                        <i class="fa-solid fa-plus"></i>
                    </span>
                ` : `
                    <!-- 系统表情 -->
                    ${emojis.map(emoji => `
                        <span class="emoji-item" data-emoji="${emoji}">${emoji}</span>
                    `).join('')}
                `}
            </div>
        </div>
    `;
}
    
    renderMorePanel() {
    return `
        <div class="more-panel">
            <div class="more-grid">
                <div class="more-item" data-action="photo">
                    <div class="more-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none;">
                        <i class="fa-solid fa-image"></i>
                    </div>
                    <div class="more-name">相册</div>
                </div>
                
                <div class="more-item" data-action="video">
                    <div class="more-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; border: none;">
                        <i class="fa-solid fa-video"></i>
                    </div>
                    <div class="more-name">视频通话</div>
                </div>
                
                <div class="more-item" data-action="voice">
                    <div class="more-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #fff; border: none;">
                        <i class="fa-solid fa-phone"></i>
                    </div>
                    <div class="more-name">语音通话</div>
                </div>
                
                <div class="more-item" data-action="location">
                    <div class="more-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #fff; border: none;">
                        <i class="fa-solid fa-location-dot"></i>
                    </div>
                    <div class="more-name">位置</div>
                </div>
                
                <div class="more-item" data-action="transfer">
                    <div class="more-icon" style="background: linear-gradient(135deg, #ff9500 0%, #ff8c00 100%); color: #fff; border: none;">
                        <i class="fa-solid fa-money-bill"></i>
                    </div>
                    <div class="more-name">转账</div>
                </div>
                
                <div class="more-item" data-action="redpacket">
                    <div class="more-icon" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #fff; border: none;">
                        <i class="fa-solid fa-gift"></i>
                    </div>
                    <div class="more-name">红包</div>
                </div>
            </div>
            
            <!-- 🔥 隐藏的文件上传input -->
            <input type="file" id="photo-upload-input" accept="image/*" capture="environment" style="display: none;">
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
    
    let result = text;
    
    // 1️⃣ 替换系统表情
    for (let emoji in emojiMap) {
        result = result.split(emoji).join(emojiMap[emoji]);
    }
    
    // 2️⃣ 替换自定义表情
    const customEmojis = this.app.wechatData.getCustomEmojis();
    customEmojis.forEach(emoji => {
        const pattern = `[${emoji.name}]`;
        if (result.includes(pattern)) {
            result = result.split(pattern).join(
                `<img src="${emoji.image}" style="width:24px;height:24px;vertical-align:middle;border-radius:4px;" alt="${emoji.name}" title="${emoji.name}">`
            );
        }
    });
    
    return result;
}
    
         bindEvents() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        // 📱 移动端防变形：输入框聚焦时锁定页面
input?.addEventListener('focus', () => {
    if (window.innerWidth <= 500) {
        document.body.classList.add('phone-input-active');
        
        // ← 新增：滚动到手机顶部
        const phonePanel = document.querySelector('.phone-body-panel');
        if (phonePanel) {
            phonePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

input?.addEventListener('blur', () => {
    document.body.classList.remove('phone-input-active');
});

// 📱 新增：输入时阻止页面缩放
input?.addEventListener('input', (e) => {
    if (window.innerWidth <= 500) {
        // 阻止视口变化
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
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

        // 🔥 新增：相册上传处理
document.getElementById('photo-upload-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            this.app.phoneShell.showNotification('提示', '图片太大，请选择小于10MB的图片', '⚠️');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // 添加图片消息
            this.app.wechatData.addMessage(this.app.currentChat.id, {
                from: 'me',
                type: 'image',
                content: e.target.result,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                avatar: this.app.wechatData.getUserInfo().avatar
            });
            
            this.app.render();
            this.app.phoneShell.showNotification('发送成功', '图片已发送', '✅');
            
            // 🔥 如果开启在线模式，通知AI
            if (window.VirtualPhone?.settings?.onlineMode) {
                this.notifyAI('[图片]');
            }
        };
        reader.readAsDataURL(file);
        
        // 清空input，允许重复选择同一文件
        e.target.value = '';
    }
});

// 🔥 新增：表情标签切换
document.querySelectorAll('.emoji-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        this.emojiTab = tab.dataset.tab;
        this.app.render();
    });
});

// 🔥 新增：添加自定义表情
document.getElementById('add-custom-emoji')?.addEventListener('click', () => {
    this.showAddCustomEmojiDialog();
});

// 🔥 新增：选择自定义表情
document.querySelectorAll('.custom-emoji-item').forEach(item => {
    item.addEventListener('click', () => {
        const emojiId = item.dataset.emojiId;
        const emoji = this.app.wechatData.getCustomEmoji(emojiId);
        if (emoji) {
            this.inputText += `[${emoji.name}]`;
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = this.inputText;
                input.focus();
            }
        }
    });
});
        
        // 添加头像点击事件
        document.querySelectorAll('.message-avatar').forEach(avatar => {
            avatar.addEventListener('click', (e) => {
                const message = e.target.closest('.chat-message');
                const isMe = message.classList.contains('message-right');
                
                if (!isMe) {
                    this.showAvatarSettings(this.app.currentChat);
                }
            });
        });
        
        // 滚动到底部
        const messagesDiv = document.getElementById('chat-messages');
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

                // 🔧 消息气泡长按/点击事件
        document.querySelectorAll('.chat-message').forEach((msgElement, index) => {
            let pressTimer;
            
            // 移动端长按
            msgElement.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.showMessageMenu(index);
                }, 500);
            });
            
            msgElement.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
            
            // 桌面端右键
            msgElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showMessageMenu(index);
            });
            
            // 或者简单的双击
            msgElement.addEventListener('dblclick', () => {
                this.showMessageMenu(index);
            });
        });
    }
    
async sendMessage() {
    if (!this.inputText.trim()) return;
    
    const context = window.SillyTavern?.getContext?.();
    const userName = context?.name1 || '我';
    const userAvatar = this.app.wechatData.getUserInfo().avatar;
    
    // 🎯 获取剧情时间
const timeManager = window.VirtualPhone?.timeManager;
const currentTime = timeManager 
    ? timeManager.getCurrentStoryTime().time 
    : new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

// 添加用户消息到微信
this.app.wechatData.addMessage(this.app.currentChat.id, {
    from: 'me',
    content: this.inputText,
    time: currentTime,  // ← 使用剧情时间
    type: 'text',
    avatar: userAvatar
});
    
    const messageToSend = this.inputText;
    
    // 清空输入并刷新界面
    this.inputText = '';
    this.app.render();
    
    // 如果开启了在线模式，发送到AI
    if (window.VirtualPhone?.settings?.onlineMode) {
        await this.sendToAI(messageToSend);
    } else {
        console.log('💬 离线模式，消息仅保存在手机本地');
    }
}
    
async sendToAI(message) {
    const settings = window.VirtualPhone?.settings;
    
    if (!settings?.onlineMode) {
        console.log('⚠️ 在线模式未开启，消息不会发送到AI');
        return;
    }
    
    // 🔥 显示正在输入状态
    this.showTypingStatus();
    
    try {
        // 1️⃣ 获取上下文
        const context = window.SillyTavern?.getContext?.();
        if (!context) {
            throw new Error('无法获取酒馆上下文');
        }
        
        // 2️⃣ 获取完整聊天记录（酒馆历史 + 手机微信记录）
        const chatHistory = [];
        
        // 酒馆聊天记录
        if (context.chat && Array.isArray(context.chat)) {
            context.chat.forEach(msg => {
                if (msg.mes && msg.mes.trim()) {
                    const speaker = msg.is_user ? (context.name1 || '用户') : (context.name2 || '角色');
                    const content = msg.mes
                        .replace(/<[^>]*>/g, '') // 移除HTML
                        .replace(/\*.*?\*/g, '') // 移除动作
                        .substring(0, 500);
                    
                    if (content.trim()) {
                        chatHistory.push({
                            speaker: speaker,
                            message: content,
                            source: 'tavern'
                        });
                    }
                }
            });
        }
        
        // 当前微信聊天记录
        const wechatMessages = this.app.wechatData.getMessages(this.app.currentChat.id);
        wechatMessages.forEach(msg => {
            const speaker = msg.from === 'me' 
                ? (context.name1 || '用户') 
                : (context.name2 || this.app.currentChat.name);
            
            chatHistory.push({
                speaker: speaker,
                message: msg.content || '',
                source: 'wechat'
            });
        });
        
        // 3️⃣ 构建手机聊天专用提示词
        const phonePrompt = this.buildPhoneChatPrompt(
            context,
            this.app.currentChat.name,
            message
        );
        
        console.log('📤 发送给AI的提示词长度:', phonePrompt.length);
        
        // 4️⃣ 静默发送给AI
        const aiResponse = await this.sendToAIHidden(phonePrompt, context);
        
        // 5️⃣ 解析AI回复（支持多条消息）
        const messages = aiResponse.includes('|||') 
            ? aiResponse.split('|||').map(m => m.trim()).filter(m => m)
            : [aiResponse.trim()];
        
        // 6️⃣ 将AI回复添加到微信界面（可能多条）
        const charName = context.name2 || this.app.currentChat.name;
        messages.forEach((msgText, index) => {
    setTimeout(() => {
        // 使用剧情时间而不是现实时间
        const timeManager = window.VirtualPhone?.timeManager;
        const currentStoryTime = timeManager 
            ? timeManager.getCurrentStoryTime() 
            : { time: '21:30' };
        
        // 每条消息递增1分钟
        const [hour, minute] = currentStoryTime.time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute + index + 1;
        const msgHour = Math.floor(totalMinutes / 60) % 24;
        const msgMinute = totalMinutes % 60;
        const msgTime = `${String(msgHour).padStart(2, '0')}:${String(msgMinute).padStart(2, '0')}`;
        
        this.app.wechatData.addMessage(this.app.currentChat.id, {
            from: charName,
            content: msgText,
            time: msgTime,  // 使用计算后的剧情时间
            type: 'text',
            avatar: this.app.currentChat.avatar
        });
                
                // 最后一条消息时刷新界面
                if (index === messages.length - 1) {
                    this.app.render();
                }
            }, index * 800); // 每条消息间隔800ms
        });
        
        console.log('✅ 手机消息发送成功');
        
    } catch (error) {
        console.error('❌ 发送手机消息失败:', error);
        this.app.phoneShell?.showNotification('发送失败', error.message, '❌');
    }
}

// 🔧 构建手机聊天提示词（支持多角色）
buildPhoneChatPrompt(context, contactName, userMessage) {
    const userName = context.name1 || '用户';
    
    console.log('📝 开始构建手机聊天提示词...');
    console.log('💬 当前聊天对象:', contactName);
    
    // ========================================
    // 1️⃣ 判断聊天对象类型
    // ========================================
    let chatMode = 'npc'; // 默认是NPC
    let chatPartner = contactName;
    let partnerInfo = '';
    
    // 检查是否是主角色
    const mainCharName = context.name2 || context.characters?.[context.characterId]?.name;
    if (contactName === mainCharName) {
        chatMode = 'main_char';
        console.log('✅ 正在和主角色聊天:', mainCharName);
    } else if (contactName.includes('群')) {
        chatMode = 'group';
        console.log('✅ 群聊模式:', contactName);
    } else {
        console.log('✅ NPC聊天:', contactName);
    }
    
    // ========================================
    // 2️⃣ 获取角色信息
    // ========================================
    
    // 2.1 获取用户信息
    let userPersona = '';
    const personaTextarea = document.getElementById('persona_description');
    if (personaTextarea && personaTextarea.value) {
        userPersona = personaTextarea.value;
        console.log('✅ 用户角色卡:', userPersona.length, '字符');
    }
    
    // 2.2 获取聊天对象信息
    if (chatMode === 'main_char') {
        // 主角色：从角色卡获取
        if (context.characters && context.characterId !== undefined) {
            const char = context.characters[context.characterId];
            if (char) {
                partnerInfo = `
角色名：${char.name}
${char.personality ? `性格：${char.personality.substring(0, 500)}` : ''}
${char.scenario ? `背景：${char.scenario.substring(0, 300)}` : ''}
`;
            }
        }
    } else {
        // NPC：从世界书、记忆表格、联系人信息查找
        partnerInfo = this.findNPCInfo(contactName, context);
    }
    
    // ========================================
    // 3️⃣ 获取记忆和世界信息
    // ========================================
    let memoryData = '';
    let worldInfoData = '';
    
    // 3.1 记忆表格
    if (window.Gaigai && window.Gaigai.m && Array.isArray(window.Gaigai.m.s)) {
        const memoryLines = [];
        window.Gaigai.m.s.forEach((section) => {
            if (Array.isArray(section.r) && section.r.length > 0) {
                // 查找与当前聊天对象相关的记忆
                section.r.forEach((row) => {
                    const rowText = Object.values(row).join(' ');
                    if (rowText.includes(contactName)) {
                        memoryLines.push(rowText);
                    }
                });
            }
        });
        
        if (memoryLines.length > 0) {
            memoryData = '相关记忆：\n' + memoryLines.join('\n');
            console.log('✅ 找到相关记忆:', memoryLines.length, '条');
        }
    }
    
    // 3.2 世界书（查找NPC信息）
    if (context.characters && context.characterId !== undefined) {
        const char = context.characters[context.characterId];
        if (char?.data?.character_book?.entries) {
            const entries = char.data.character_book.entries;
            entries.forEach(entry => {
                if (entry.content && entry.content.includes(contactName)) {
                    worldInfoData += `\n${entry.content.substring(0, 500)}`;
                }
            });
            
            if (worldInfoData) {
                console.log('✅ 从世界书找到相关信息');
            }
        }
    }
    
    // ========================================
    // 4️⃣ 获取聊天历史
    // ========================================
    const chatHistory = [];
    
    // 4.1 酒馆聊天记录（可能包含与NPC的互动）
    if (context.chat && Array.isArray(context.chat)) {
        context.chat.slice(-10).forEach(msg => {
            if (msg.mes && msg.mes.trim()) {
                const content = msg.mes
                    .replace(/<[^>]*>/g, '')
                    .replace(/\*.*?\*/g, '')
                    .substring(0, 300);
                
                // 检查是否提到当前聊天对象
                if (content.includes(contactName) || chatMode === 'main_char') {
                    chatHistory.push({
                        speaker: msg.is_user ? userName : (context.name2 || '角色'),
                        message: content,
                        source: 'tavern'
                    });
                }
            }
        });
    }
    
    // 4.2 当前微信聊天记录
    const wechatMessages = this.app.wechatData.getMessages(this.app.currentChat.id);
    wechatMessages.slice(-15).forEach(msg => {
        chatHistory.push({
            speaker: msg.from === 'me' ? userName : contactName,
            message: msg.content || '',
            source: 'wechat'
        });
    });
    
    // ========================================
    // 5️⃣ 构建提示词
    // ========================================
    const sections = [];
    
    if (chatMode === 'main_char') {
        // 与主角色聊天
        sections.push(
            '# 场景：微信聊天',
            `你现在扮演${contactName}，正在微信上和${userName}聊天。`,
            '',
            '## 角色信息',
            partnerInfo,
            ''
        );
    } else if (chatMode === 'group') {
        // 群聊
        sections.push(
            '# 场景：微信群聊',
            `这是一个名为"${contactName}"的微信群。`,
            `你需要扮演群里的一个或多个成员回复${userName}的消息。`,
            '可以模拟多人对话，用"【名字】内容"格式区分不同人。',
            ''
        );
    } else {
    // NPC聊天
    sections.push(
        '# 场景：微信聊天',
        `你现在扮演${contactName}，正在微信上和${userName}聊天。`,
        '',
        '## 背景信息（所有角色）',
        partnerInfo || `${contactName}是故事中的一个角色。根据上下文推测其身份和性格。`,
        '',
        '## ⚠️ 重要：你的身份锁定',
        `虽然你了解上述所有角色的信息，但你必须明确：`,
        '',
        `【你是谁】`,
        `你是 ${contactName} 本人`,
        `用第一人称"我"来称呼自己`,
        '',
        `【你可以做什么】`,
        `✅ 谈论你认识的人（家人、朋友、同事等）`,
        `✅ 评价其他角色（基于${contactName}的立场）`,
        `✅ 提到其他角色的名字和关系`,
        '',
        `【你不能做什么】`,
        `❌ 用其他角色的性格、口气、立场说话`,
        `❌ 混淆${contactName}和其他角色的身份`,
        `❌ 说出${contactName}不应该知道的信息`,
        '',
        `【示例】`,
        `如果你是陈聿：`,
        `✅ "我妹妹陈舒然最近..."（可以提到）`,
        `✅ "周应淮那家伙..."（可以评价）`,
        `✅ 用陈聿的性格：玩世不恭、戏谑调侃`,
        `❌ 用陈舒然的口气说话`,
        `❌ 说"我哥哥陈聿..."（身份混淆）`,
        ''
    );
}
    
    // 添加用户信息
    if (userPersona) {
        sections.push(
            `## 关于${userName}`,
            userPersona.substring(0, 300),
            ''
        );
    }
    
    // 添加相关记忆
    if (memoryData) {
        sections.push(memoryData, '');
    }
    
    // 添加世界信息
    if (worldInfoData) {
        sections.push('## 背景信息', worldInfoData, '');
    }
    
    // 添加聊天历史
    if (chatHistory.length > 0) {
        sections.push(
            '## 相关对话历史',
            chatHistory.map(h => {
                const tag = h.source === 'tavern' ? '[剧情]' : '[微信]';
                return `${tag} ${h.speaker}: ${h.message}`;
            }).join('\n'),
            ''
        );
    }

// ========================================
// 🔥 新增：明确注入剧情时间
// ========================================
const timeManager = window.VirtualPhone?.timeManager;
const currentStoryTime = timeManager 
    ? timeManager.getCurrentStoryTime() 
    : { time: '21:30', date: '2044年10月28日' };

// 计算AI应该回复的时间
const userTime = currentStoryTime.time;
const [hour, minute] = userTime.split(':').map(Number);
const replyMinute = minute + 1 + Math.floor(Math.random() * 2);
const replyHour = hour + Math.floor(replyMinute / 60);
const replyTime = `${String(replyHour % 24).padStart(2, '0')}:${String(replyMinute % 60).padStart(2, '0')}`;

sections.push(
    '## ⏰ 当前剧情时间（重要！必须遵守）',
    `剧情当前时间：${currentStoryTime.date} ${currentStoryTime.time}`,
    '',
    '### 时间规则：',
    `1. 用户发送消息的时间：${userTime}`,
    `2. 你回复消息的time字段必须是：${replyTime} 或稍后`,
    `3. 严禁使用现实时间（如07:16、08:00等早上时间）`,
    `4. 严禁使用"刚刚"、"5分钟前"等模糊时间`,
    `5. 如果发多条消息，每条递增1分钟`,
    '',
    '时间示例：',
    `第1条 → time: "${replyTime}"`,
    `第2条 → time: "${String(replyHour % 24).padStart(2, '0')}:${String((replyMinute + 1) % 60).padStart(2, '0')}"`,
    '',
    '---',
    ''
);
    
    // 添加当前消息
    sections.push(
        '## 用户刚发来的微信消息',
        `${userName}: ${userMessage}`,
        '',
        '---',
        ''
    );
    
    // 回复要求
    if (chatMode === 'group') {
        sections.push(
            '## 回复要求',
            '1. 可以模拟1-3个群成员回复',
            '2. 用【名字】开头标识说话人',
            '3. 符合群聊的氛围（可能有人开玩笑、有人认真回复）',
            '4. 每个人用|||分隔',
            '',
            '示例格式：',
            '【张三】这事我知道|||【李四】真的假的？|||【王五】[图片]',
            ''
        );
    } else {
        sections.push(
            '## 回复要求',
            `1. 你是${contactName}本人，用第一人称说话`,
            `2. 符合${contactName}的身份、性格和说话方式`,
            '3. 基于聊天历史保持话题连贯',
            '4. 只返回微信消息内容，不要旁白描写',
            '5. 多条消息用|||分隔',
            '6. 可以适当使用表情，但要符合角色性格',
            ''
        );
    }
    
    sections.push(`现在请以${contactName}的身份回复：`);
    
    const finalPrompt = sections.join('\n');
    console.log('📤 最终提示词长度:', finalPrompt.length, '字符');
    
    // 保存供调试
    window.lastPhonePrompt = finalPrompt;
    
    return finalPrompt;
}

// 🔍 辅助方法：查找NPC信息（改为提供完整背景）
findNPCInfo(npcName, context) {
    let info = [];
    
    // 1. 从联系人列表查找
    const contacts = this.app.wechatData.getContacts();
    const contact = contacts.find(c => c.name === npcName);
    if (contact) {
        if (contact.relation) {
            info.push(`联系人备注 - ${npcName}：${contact.relation}`);
        }
        if (contact.remark) {
            info.push(`备注：${contact.remark}`);
        }
    }
    
    // 2. 🔥 提供完整的世界书背景（不精确提取）
    // 让AI了解所有NPC的关系，但在提示词中明确身份
    if (context.characters && context.characterId !== undefined) {
        const char = context.characters[context.characterId];
        if (char?.data?.character_book?.entries) {
            char.data.character_book.entries.forEach(entry => {
                // 只要包含NPC名字的条目，都提供给AI
                if (entry.content && entry.content.includes(npcName)) {
                    // 提供完整的条目内容（截取前800字符，避免太长）
                    const content = entry.content.substring(0, 800);
                    info.push(content);
                }
            });
        }
    }
    
    // 3. 从记忆表格查找
    if (window.Gaigai && window.Gaigai.m && Array.isArray(window.Gaigai.m.s)) {
        window.Gaigai.m.s.forEach(section => {
            if (section.n === '人物档案' || section.n === '人物关系') {
                section.r?.forEach(row => {
                    const rowText = Object.values(row).join(' ');
                    if (rowText.includes(npcName)) {
                        info.push(rowText.substring(0, 200));
                    }
                });
            }
        });
    }
    
    return info.length > 0 ? info.join('\n\n') : '';
}

    // ✅ 静默调用AI（使用 context.generateRaw）
async sendToAIHidden(prompt, context) {
    try {
        console.log('🚀 [手机聊天] 开始静默调用...');
        
        if (!context || typeof context.generateRaw !== 'function') {
            throw new Error('❌ 无法访问 context.generateRaw');
        }
        
        // ✅ 使用正确的对象参数格式
        const result = await context.generateRaw({
            prompt: prompt,
            quietToLoud: false,  // 🔥 关键：不显示在聊天窗口
            instructOverride: false
        });
        
        console.log('✅ [手机聊天] 调用成功，回复长度:', result?.length || 0);
        return result;
        
    } catch (error) {
        console.error('❌ [手机聊天] 静默调用失败:', error);
        this.hideTypingStatus();
        throw error;
    }
}
    
    handleMoreAction(action) {
    switch(action) {
        case 'photo':
            this.selectPhoto(); // ← 调用手机相册
            break;
        case 'video':
            this.startVideoCall(); // ← 视频通话
            break;
        case 'voice':
            this.startVoiceCall(); // ← 新增：语音通话
            break;
        case 'location':
            this.app.phoneShell.showNotification('位置', '正在获取位置...', '📍');
            break;
        case 'transfer':
            this.showTransferDialog();
            break;
        case 'redpacket':
            this.showRedPacketDialog();
            break;
    }
}
    
    showTransferDialog() {
    // 🔥 改成手机内部界面
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-transfer">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">转账</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <div style="background: #fff; border-radius: 10px; padding: 30px; text-align: center;">
                    <div style="font-size: 14px; color: #999; margin-bottom: 20px;">转账金额</div>
                    <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">
                        ¥ <input type="number" id="transfer-amount" 
                                 placeholder="0.00" 
                                 style="border:none; font-size:48px; width:200px; text-align:center; font-weight:bold;">
                    </div>
                    <input type="text" id="transfer-desc" placeholder="添加转账说明" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #e5e5e5;
                        border-radius: 6px;
                        box-sizing: border-box;
                        margin-bottom: 30px;
                    ">
                    <button id="confirm-transfer" style="
                        width: 100%;
                        padding: 14px;
                        background: #07c160;
                        color: #fff;
                        border: none;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                    ">转账</button>
                </div>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    document.getElementById('back-from-transfer')?.addEventListener('click', () => {
        this.app.render();
    });
    
 document.getElementById('confirm-transfer')?.addEventListener('click', async () => {
    const amount = document.getElementById('transfer-amount').value;
    const desc = document.getElementById('transfer-desc').value || '转账给你';
    
    if (!amount || isNaN(amount) || amount <= 0) {
        this.app.phoneShell.showNotification('提示', '请输入正确的金额', '⚠️');
        return;
    }
    
    this.app.wechatData.addMessage(this.app.currentChat.id, {
        from: 'me',
        type: 'transfer',
        amount: amount,
        desc: desc,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
    
    this.app.phoneShell.showNotification('转账成功', `已向${this.app.currentChat.name}转账¥${amount}`, '✅');
    
    // 🔥 新增：通知AI
    if (window.VirtualPhone?.settings?.onlineMode) {
        await this.notifyAI(`通过微信向你转账了¥${amount}，备注：${desc}`);
    }
    
    setTimeout(() => this.app.render(), 1000);
});
}
    
    showRedPacketDialog() {
        this.app.phoneShell.showNotification('红包', '红包功能开发中...', '🧧');
    }
    
    startVideoCall() {
        this.app.phoneShell.showNotification('视频通话', '正在呼叫...', '📹');
    }
    
    selectPhoto() {
    const input = document.getElementById('photo-upload-input');
    if (!input) {
        console.error('找不到文件上传input');
        return;
    }
    
    // 点击隐藏的input，触发相册选择
    input.click();
}
    
     showAvatarSettings(chat) {
    // 🔥 不用弹窗，在手机内部显示设置页面
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-to-chat">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">聊天设置</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed;">
                <!-- 头像区域 -->
                <div style="background: #fff; padding: 20px; margin-bottom: 10px;">
                    <div style="text-align: center; margin-bottom: 15px; color: #999; font-size: 13px;">
                        点击头像更换
                    </div>
                    <div id="avatar-preview" style="
                        width: 100px;
                        height: 100px;
                        border-radius: 10px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 50px;
                        cursor: pointer;
                        overflow: hidden;
                    ">${chat.avatar || '👤'}</div>
                    <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                </div>
                
                <!-- 备注名 -->
                <div style="background: #fff; padding: 15px 20px; margin-bottom: 10px;">
                    <div style="color: #999; font-size: 13px; margin-bottom: 8px;">备注名</div>
                    <input type="text" id="remark-input" value="${chat.name}" 
                           placeholder="设置备注名" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #e5e5e5;
                        border-radius: 6px;
                        font-size: 15px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <!-- 保存按钮 -->
                <div style="padding: 20px;">
                    <button id="save-chat-settings" style="
                        width: 100%;
                        padding: 12px;
                        background: #07c160;
                        color: #fff;
                        border: none;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                    ">保存</button>
                </div>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    // 绑定事件
    document.getElementById('back-to-chat')?.addEventListener('click', () => {
        this.app.render();
    });
    
    document.getElementById('avatar-preview')?.addEventListener('click', () => {
        document.getElementById('avatar-upload').click();
    });
    
    document.getElementById('avatar-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                this.app.phoneShell.showNotification('提示', '图片太大，请选择小于2MB的图片', '⚠️');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('avatar-preview');
                preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
                chat.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('save-chat-settings')?.addEventListener('click', () => {
        const remark = document.getElementById('remark-input').value.trim();
        if (remark) {
            chat.name = remark;
            this.app.wechatData.saveData();
            this.app.phoneShell.showNotification('保存成功', '设置已更新', '✅');
            setTimeout(() => this.app.render(), 1000);
        }
    });
}
    
    showTypingStatus() {
    const header = document.querySelector('.wechat-header-title');
    if (header && this.app.currentChat) {
        // 保存原始内容
        if (!this.originalHeaderContent) {
            this.originalHeaderContent = header.innerHTML;
        }
        
        header.innerHTML = `
            <div>${this.app.currentChat.name}</div>
            <div style="font-size: 12px; color: #999; font-weight: normal; margin-top: 2px;">
                对方正在输入<span class="typing-dots">...</span>
            </div>
        `;
        
        // 添加动画样式
        if (!document.getElementById('typing-animation')) {
            const style = document.createElement('style');
            style.id = 'typing-animation';
            style.textContent = `
                .typing-dots {
                    animation: typing-blink 1.4s infinite;
                }
                @keyframes typing-blink {
                    0%, 60%, 100% { opacity: 1; }
                    30% { opacity: 0.3; }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('💬 显示"正在输入"状态');
    }
}

hideTypingStatus() {
    const header = document.querySelector('.wechat-header-title');
    if (header && this.originalHeaderContent) {
        header.innerHTML = this.originalHeaderContent;
        this.originalHeaderContent = null;
        console.log('✅ 隐藏"正在输入"状态');
    }
}
        // 🔧 显示聊天设置菜单
    showChatMenu() {
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-menu">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">聊天设置</div>
                    <div class="wechat-header-right"></div>
                </div>
                
                <div class="wechat-content" style="background: #ededed;">
                    <!-- 聊天背景 -->
                    <div style="background: #fff; padding: 15px 20px; margin-bottom: 10px; cursor: pointer;" id="set-bg-btn">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 16px; color: #000;">设置聊天背景</div>
                                <div style="font-size: 12px; color: #999; margin-top: 3px;">更换当前聊天的背景图片</div>
                            </div>
                            <i class="fa-solid fa-chevron-right" style="color: #c8c8c8;"></i>
                        </div>
                    </div>
                    
                    <!-- 删除聊天 -->
                    <div style="background: #fff; padding: 15px 20px; margin-bottom: 10px; cursor: pointer;" id="delete-chat-btn">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 16px; color: #ff3b30;">删除聊天</div>
                            <i class="fa-solid fa-chevron-right" style="color: #c8c8c8;"></i>
                        </div>
                    </div>
                    
                    <!-- 拉黑好友 -->
                    <div style="background: #fff; padding: 15px 20px; cursor: pointer;" id="block-contact-btn">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 16px; color: #ff3b30;">拉黑好友</div>
                            <i class="fa-solid fa-chevron-right" style="color: #c8c8c8;"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        // 返回按钮
        document.getElementById('back-from-menu')?.addEventListener('click', () => {
            this.app.render();
        });
        
        // 设置背景按钮
        document.getElementById('set-bg-btn')?.addEventListener('click', () => {
            this.showBackgroundPicker();
        });
        
       // 删除聊天按钮
document.getElementById('delete-chat-btn')?.addEventListener('click', () => {
    this.showDeleteConfirm();
});
        
       // 拉黑好友按钮
document.getElementById('block-contact-btn')?.addEventListener('click', () => {
    this.showBlockConfirm();
});
    }
    
    // 🎨 显示背景选择器
    showBackgroundPicker() {
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-bg">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">选择背景</div>
                    <div class="wechat-header-right"></div>
                </div>
                
                <div class="wechat-content" style="background: #ededed; padding: 20px;">
                    <!-- 上传自定义背景 -->
                    <div style="background: #fff; border-radius: 10px; padding: 20px; margin-bottom: 15px; text-align: center;">
                        <div style="font-size: 14px; color: #999; margin-bottom: 12px;">上传自定义背景</div>
                        <input type="file" id="bg-upload" accept="image/*" style="display: none;">
                        <button id="upload-bg-btn" style="
                            width: 100%;
                            padding: 12px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #fff;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            cursor: pointer;
                        ">
                            <i class="fa-solid fa-upload"></i> 选择图片
                        </button>
                    </div>
                    
                    <!-- 预设背景 -->
                    <div style="background: #fff; border-radius: 10px; padding: 20px;">
                        <div style="font-size: 14px; color: #999; margin-bottom: 12px;">预设背景</div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <div class="preset-bg" data-bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                                 style="height: 80px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); cursor: pointer;"></div>
                            <div class="preset-bg" data-bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
                                 style="height: 80px; border-radius: 8px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); cursor: pointer;"></div>
                            <div class="preset-bg" data-bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" 
                                 style="height: 80px; border-radius: 8px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); cursor: pointer;"></div>
                            <div class="preset-bg" data-bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" 
                                 style="height: 80px; border-radius: 8px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); cursor: pointer;"></div>
                            <div class="preset-bg" data-bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" 
                                 style="height: 80px; border-radius: 8px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); cursor: pointer;"></div>
                            <div class="preset-bg" data-bg="#ffffff" 
                                 style="height: 80px; border-radius: 8px; background: #ffffff; border: 1px solid #e5e5e5; cursor: pointer;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        // 返回按钮
        document.getElementById('back-from-bg')?.addEventListener('click', () => {
            this.showChatMenu();
        });
        
        // 上传背景按钮
        document.getElementById('upload-bg-btn')?.addEventListener('click', () => {
            document.getElementById('bg-upload').click();
        });
        
        // 上传背景
        document.getElementById('bg-upload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    this.app.phoneShell.showNotification('提示', '图片太大，请选择小于5MB的图片', '⚠️');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.app.wechatData.setChatBackground(this.app.currentChat.id, e.target.result);
                    this.app.phoneShell.showNotification('设置成功', '聊天背景已更新', '✅');
                    setTimeout(() => this.app.render(), 1000);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 预设背景点击
        document.querySelectorAll('.preset-bg').forEach(item => {
            item.addEventListener('click', () => {
                const bg = item.dataset.bg;
                this.app.wechatData.setChatBackground(this.app.currentChat.id, bg);
                this.app.phoneShell.showNotification('设置成功', '聊天背景已更新', '✅');
                setTimeout(() => this.app.render(), 1000);
            });
        });
    }
    
    // 🗑️ 显示消息操作菜单
    showMessageMenu(messageIndex) {
        const messages = this.app.wechatData.getMessages(this.app.currentChat.id);
        const message = messages[messageIndex];
        
        const menuHtml = `
            <div class="message-action-menu" id="message-menu-${messageIndex}" style="
                position: absolute;
                background: rgba(50, 50, 50, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                padding: 8px;
                display: flex;
                gap: 12px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            ">
                <button class="msg-action-btn" data-action="edit" data-index="${messageIndex}" style="
                    background: #667eea;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                ">
                    <i class="fa-solid fa-pen"></i> 编辑
                </button>
                <button class="msg-action-btn" data-action="delete" data-index="${messageIndex}" style="
                    background: #ff3b30;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                ">
                    <i class="fa-solid fa-trash"></i> 删除
                </button>
            </div>
        `;
        
        // 移除旧菜单
        document.querySelectorAll('.message-action-menu').forEach(menu => menu.remove());
        
        // 添加新菜单
        const messageElement = document.querySelectorAll('.chat-message')[messageIndex];
        if (messageElement) {
            messageElement.style.position = 'relative';
            messageElement.insertAdjacentHTML('beforeend', menuHtml);
            
            // 绑定按钮事件
            document.querySelectorAll('.msg-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    const index = parseInt(btn.dataset.index);
                    
                    if (action === 'delete') {
                        this.deleteMessage(index);
                    } else if (action === 'edit') {
                        this.editMessage(index);
                    }
                });
            });
            
            // 点击其他地方关闭菜单
            setTimeout(() => {
                document.addEventListener('click', function closeMenu() {
                    document.querySelectorAll('.message-action-menu').forEach(menu => menu.remove());
                    document.removeEventListener('click', closeMenu);
                }, { once: true });
            }, 100);
        }
    }
    
    // 🗑️ 删除消息
    deleteMessage(messageIndex) {
    // 直接删除，不需要确认（因为已经是长按操作了）
    this.app.wechatData.deleteMessage(this.app.currentChat.id, messageIndex);
    this.app.render();
    this.app.phoneShell.showNotification('已删除', '消息已删除', '✅');
}
    
    // ✏️ 编辑消息
    editMessage(messageIndex) {
    const messages = this.app.wechatData.getMessages(this.app.currentChat.id);
    const message = messages[messageIndex];
    
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-edit">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">编辑消息</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <div style="background: #fff; border-radius: 12px; padding: 20px;">
                    <div style="font-size: 14px; color: #999; margin-bottom: 10px;">消息内容</div>
                    <textarea id="edit-message-input" style="
                        width: 100%;
                        min-height: 120px;
                        padding: 12px;
                        border: 1.5px solid #e5e5e5;
                        border-radius: 8px;
                        font-size: 15px;
                        box-sizing: border-box;
                        resize: vertical;
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    ">${message.content}</textarea>
                </div>
                
                <button id="save-edit" style="
                    width: 100%;
                    padding: 14px;
                    background: #07c160;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 15px;
                ">保存修改</button>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    document.getElementById('back-from-edit')?.addEventListener('click', () => {
        this.app.render();
    });
    
    document.getElementById('save-edit')?.addEventListener('click', () => {
        const newContent = document.getElementById('edit-message-input').value.trim();
        if (newContent) {
            this.app.wechatData.editMessage(this.app.currentChat.id, messageIndex, newContent);
            this.app.render();
            this.app.phoneShell.showNotification('已修改', '消息已更新', '✅');
        }
    });
}
        // 📋 显示删除聊天确认界面
    showDeleteConfirm() {
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-delete">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">删除聊天</div>
                    <div class="wechat-header-right"></div>
                </div>
                
                <div class="wechat-content" style="background: #ededed; padding: 20px;">
                    <div style="background: #fff; border-radius: 12px; padding: 30px; text-align: center;">
                        <i class="fa-solid fa-trash" style="font-size: 48px; color: #ff3b30; margin-bottom: 20px;"></i>
                        <div style="font-size: 18px; font-weight: 600; color: #000; margin-bottom: 10px;">确定要删除这个聊天吗？</div>
                        <div style="font-size: 14px; color: #999; margin-bottom: 30px;">删除后将清空所有聊天记录</div>
                        
                        <button id="confirm-delete" style="
                            width: 100%;
                            padding: 14px;
                            background: #ff3b30;
                            color: #fff;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            margin-bottom: 10px;
                        ">确定删除</button>
                        
                        <button id="cancel-delete" style="
                            width: 100%;
                            padding: 14px;
                            background: #f0f0f0;
                            color: #666;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        ">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        document.getElementById('back-from-delete')?.addEventListener('click', () => {
            this.showChatMenu();
        });
        
        document.getElementById('cancel-delete')?.addEventListener('click', () => {
            this.showChatMenu();
        });
        
        document.getElementById('confirm-delete')?.addEventListener('click', () => {
            this.app.wechatData.deleteChat(this.app.currentChat.id);
            this.app.phoneShell.showNotification('已删除', '聊天已删除', '✅');
            this.app.currentChat = null;
            this.app.currentView = 'chats';
            setTimeout(() => this.app.render(), 1000);
        });
    }
    
    // 🚫 显示拉黑确认界面
    showBlockConfirm() {
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-block">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">拉黑好友</div>
                    <div class="wechat-header-right"></div>
                </div>
                
                <div class="wechat-content" style="background: #ededed; padding: 20px;">
                    <div style="background: #fff; border-radius: 12px; padding: 30px; text-align: center;">
                        <i class="fa-solid fa-ban" style="font-size: 48px; color: #ff3b30; margin-bottom: 20px;"></i>
                        <div style="font-size: 18px; font-weight: 600; color: #000; margin-bottom: 10px;">确定要拉黑 ${this.app.currentChat.name} 吗？</div>
                        <div style="font-size: 14px; color: #999; margin-bottom: 30px;">拉黑后将无法收到对方消息</div>
                        
                        <button id="confirm-block" style="
                            width: 100%;
                            padding: 14px;
                            background: #ff3b30;
                            color: #fff;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            margin-bottom: 10px;
                        ">确定拉黑</button>
                        
                        <button id="cancel-block" style="
                            width: 100%;
                            padding: 14px;
                            background: #f0f0f0;
                            color: #666;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                        ">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        document.getElementById('back-from-block')?.addEventListener('click', () => {
            this.showChatMenu();
        });
        
        document.getElementById('cancel-block')?.addEventListener('click', () => {
            this.showChatMenu();
        });
        
        document.getElementById('confirm-block')?.addEventListener('click', () => {
            this.app.wechatData.blockContact(this.app.currentChat.contactId);
            this.app.phoneShell.showNotification('已拉黑', `${this.app.currentChat.name}已被拉黑`, '✅');
            this.app.currentChat = null;
            this.app.currentView = 'chats';
            setTimeout(() => this.app.render(), 1000);
        });
    }

    // ========================================
// 🆕 新增功能方法
// ========================================

// 📞 语音通话界面
startVoiceCall() {
    const contact = this.app.currentChat;
    const html = `
        <div class="wechat-app">
            <div class="wechat-header" style="background: #1a1a1a;">
                <div class="wechat-header-left"></div>
                <div class="wechat-header-title" style="color: #fff;">语音通话</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px;">
                <!-- 对方头像 -->
                <div style="width: 120px; height: 120px; border-radius: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 60px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);">
                    ${contact.avatar || '👤'}
                </div>
                
                <!-- 对方名字 -->
                <div style="font-size: 26px; font-weight: 600; color: #fff; margin-bottom: 10px;">
                    ${contact.name}
                </div>
                
                <!-- 通话状态 -->
                <div id="call-status" style="font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-bottom: 60px;">
                    正在呼叫...
                </div>
                
                <!-- 控制按钮 -->
                <div style="display: flex; gap: 40px; margin-top: 40px;">
                    <!-- 静音按钮 -->
                    <div style="text-align: center;">
                        <button id="mute-btn" style="
                            width: 60px;
                            height: 60px;
                            border-radius: 30px;
                            background: rgba(255, 255, 255, 0.2);
                            border: none;
                            color: #fff;
                            font-size: 24px;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">静音</div>
                    </div>
                    
                    <!-- 挂断按钮 -->
                    <div style="text-align: center;">
                        <button id="hangup-btn" style="
                            width: 70px;
                            height: 70px;
                            border-radius: 35px;
                            background: #ff3b30;
                            border: none;
                            color: #fff;
                            font-size: 28px;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 6px 20px rgba(255, 59, 48, 0.5);
                        ">
                            <i class="fa-solid fa-phone-slash"></i>
                        </button>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">挂断</div>
                    </div>
                    
                    <!-- 免提按钮 -->
                    <div style="text-align: center;">
                        <button id="speaker-btn" style="
                            width: 60px;
                            height: 60px;
                            border-radius: 30px;
                            background: rgba(255, 255, 255, 0.2);
                            border: none;
                            color: #fff;
                            font-size: 24px;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px;">免提</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    // 模拟接通
    let callDuration = 0;
    const callTimer = setTimeout(() => {
        const statusDiv = document.getElementById('call-status');
        if (statusDiv) {
            statusDiv.textContent = '00:00';
            
            // 开始计时
            const timer = setInterval(() => {
                callDuration++;
                const minutes = Math.floor(callDuration / 60).toString().padStart(2, '0');
                const seconds = (callDuration % 60).toString().padStart(2, '0');
                if (statusDiv) {
                    statusDiv.textContent = `${minutes}:${seconds}`;
                }
            }, 1000);
            
            // 存储timer以便清理
            statusDiv.dataset.timer = timer;
        }
    }, 2000);
    
    // 挂断按钮
    document.getElementById('hangup-btn')?.addEventListener('click', () => {
        clearTimeout(callTimer);
        const statusDiv = document.getElementById('call-status');
        if (statusDiv?.dataset.timer) {
            clearInterval(parseInt(statusDiv.dataset.timer));
        }
        
        this.app.phoneShell.showNotification('通话结束', `通话时长 ${Math.floor(callDuration / 60)}分${callDuration % 60}秒`, '📞');
        
        // 🔥 如果开启在线模式，通知AI
        if (window.VirtualPhone?.settings?.onlineMode && callDuration > 0) {
            this.notifyAI(`[语音通话 ${Math.floor(callDuration / 60)}分${callDuration % 60}秒]`);
        }
        
        setTimeout(() => this.app.render(), 1000);
    });
    
    // 静音按钮
    let isMuted = false;
    document.getElementById('mute-btn')?.addEventListener('click', (e) => {
        isMuted = !isMuted;
        e.currentTarget.style.background = isMuted ? '#07c160' : 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.querySelector('i').className = isMuted ? 'fa-solid fa-microphone-slash' : 'fa-solid fa-microphone';
    });
    
    // 免提按钮
    let isSpeaker = false;
    document.getElementById('speaker-btn')?.addEventListener('click', (e) => {
        isSpeaker = !isSpeaker;
        e.currentTarget.style.background = isSpeaker ? '#07c160' : 'rgba(255, 255, 255, 0.2)';
    });
}

// 📹 视频通话界面
startVideoCall() {
    const contact = this.app.currentChat;
    const html = `
        <div class="wechat-app">
            <div class="wechat-header" style="background: transparent; position: absolute; z-index: 10; border: none;">
                <div class="wechat-header-left"></div>
                <div class="wechat-header-title" style="color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">视频通话</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #000; display: flex; flex-direction: column; position: relative; overflow: hidden;">
                <!-- 对方视频区域（占满） -->
                <div style="flex: 1; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                    <div style="text-align: center;">
                        <div style="width: 150px; height: 150px; border-radius: 75px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 80px; margin: 0 auto 20px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);">
                            ${contact.avatar || '👤'}
                        </div>
                        <div style="font-size: 24px; font-weight: 600; color: #fff;">
                            ${contact.name}
                        </div>
                        <div id="video-status" style="font-size: 14px; color: rgba(255, 255, 255, 0.7); margin-top: 10px;">
                            正在呼叫...
                        </div>
                    </div>
                </div>
                
                <!-- 小窗口（自己） -->
                <div style="position: absolute; top: 60px; right: 15px; width: 100px; height: 140px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; font-size: 40px;">
                    ${this.app.wechatData.getUserInfo().avatar || '😊'}
                </div>
                
                <!-- 底部控制栏 -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 30px 20px; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);">
                    <div style="display: flex; justify-content: center; gap: 30px;">
                        <!-- 切换摄像头 -->
                        <div style="text-align: center;">
                            <button id="camera-switch-btn" style="
                                width: 55px;
                                height: 55px;
                                border-radius: 28px;
                                background: rgba(255, 255, 255, 0.2);
                                backdrop-filter: blur(10px);
                                border: none;
                                color: #fff;
                                font-size: 20px;
                                cursor: pointer;
                            ">
                                <i class="fa-solid fa-camera-rotate"></i>
                            </button>
                        </div>
                        
                        <!-- 静音 -->
                        <div style="text-align: center;">
                            <button id="video-mute-btn" style="
                                width: 55px;
                                height: 55px;
                                border-radius: 28px;
                                background: rgba(255, 255, 255, 0.2);
                                backdrop-filter: blur(10px);
                                border: none;
                                color: #fff;
                                font-size: 20px;
                                cursor: pointer;
                            ">
                                <i class="fa-solid fa-microphone"></i>
                            </button>
                        </div>
                        
                        <!-- 挂断 -->
                        <div style="text-align: center;">
                            <button id="video-hangup-btn" style="
                                width: 65px;
                                height: 65px;
                                border-radius: 33px;
                                background: #ff3b30;
                                border: none;
                                color: #fff;
                                font-size: 26px;
                                cursor: pointer;
                                box-shadow: 0 6px 20px rgba(255, 59, 48, 0.6);
                            ">
                                <i class="fa-solid fa-phone-slash"></i>
                            </button>
                        </div>
                        
                        <!-- 关闭摄像头 -->
                        <div style="text-align: center;">
                            <button id="camera-off-btn" style="
                                width: 55px;
                                height: 55px;
                                border-radius: 28px;
                                background: rgba(255, 255, 255, 0.2);
                                backdrop-filter: blur(10px);
                                border: none;
                                color: #fff;
                                font-size: 20px;
                                cursor: pointer;
                            ">
                                <i class="fa-solid fa-video"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    // 模拟接通
    let videoDuration = 0;
    const videoTimer = setTimeout(() => {
        const statusDiv = document.getElementById('video-status');
        if (statusDiv) {
            statusDiv.textContent = '00:00';
            
            const timer = setInterval(() => {
                videoDuration++;
                const minutes = Math.floor(videoDuration / 60).toString().padStart(2, '0');
                const seconds = (videoDuration % 60).toString().padStart(2, '0');
                if (statusDiv) {
                    statusDiv.textContent = `${minutes}:${seconds}`;
                }
            }, 1000);
            
            statusDiv.dataset.timer = timer;
        }
    }, 2000);
    
    // 挂断
    document.getElementById('video-hangup-btn')?.addEventListener('click', () => {
        clearTimeout(videoTimer);
        const statusDiv = document.getElementById('video-status');
        if (statusDiv?.dataset.timer) {
            clearInterval(parseInt(statusDiv.dataset.timer));
        }
        
        this.app.phoneShell.showNotification('通话结束', `视频通话 ${Math.floor(videoDuration / 60)}分${videoDuration % 60}秒`, '📹');
        
        // 🔥 如果开启在线模式，通知AI
        if (window.VirtualPhone?.settings?.onlineMode && videoDuration > 0) {
            this.notifyAI(`[视频通话 ${Math.floor(videoDuration / 60)}分${videoDuration % 60}秒]`);
        }
        
        setTimeout(() => this.app.render(), 1000);
    });
    
    // 静音
    let isVideoMuted = false;
    document.getElementById('video-mute-btn')?.addEventListener('click', (e) => {
        isVideoMuted = !isVideoMuted;
        e.currentTarget.style.background = isVideoMuted ? '#ff3b30' : 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.querySelector('i').className = isVideoMuted ? 'fa-solid fa-microphone-slash' : 'fa-solid fa-microphone';
    });
    
    // 关闭摄像头
    let isCameraOff = false;
    document.getElementById('camera-off-btn')?.addEventListener('click', (e) => {
        isCameraOff = !isCameraOff;
        e.currentTarget.style.background = isCameraOff ? '#ff3b30' : 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.querySelector('i').className = isCameraOff ? 'fa-solid fa-video-slash' : 'fa-solid fa-video';
    });
}

// 💰 转账后通知AI
async notifyTransfer(amount, desc) {
    if (!window.VirtualPhone?.settings?.onlineMode) return;
    
    const message = `用户通过微信向你转账了¥${amount}，备注：${desc}`;
    await this.notifyAI(message);
}

// 🧧 红包后通知AI（待实现）
showRedPacketDialog() {
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-redpacket">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">发红包</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 20px;">
                <div style="background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🧧</div>
                    <div style="font-size: 14px; color: #999; margin-bottom: 20px;">红包金额</div>
                    <div style="font-size: 48px; font-weight: bold; margin-bottom: 20px; color: #ff3b30;">
                        ¥ <input type="number" id="redpacket-amount" 
                                 placeholder="0.00" 
                                 step="0.01"
                                 style="border:none; font-size:48px; width:150px; text-align:center; font-weight:bold; color: #ff3b30;">
                    </div>
                    <input type="text" id="redpacket-wish" placeholder="恭喜发财，大吉大利" maxlength="20" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #e5e5e5;
                        border-radius: 8px;
                        box-sizing: border-box;
                        margin-bottom: 25px;
                        text-align: center;
                    ">
                    <button id="confirm-redpacket" style="
                        width: 100%;
                        padding: 14px;
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
                    ">塞钱进红包</button>
                </div>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    document.getElementById('back-from-redpacket')?.addEventListener('click', () => {
        this.app.render();
    });
    
    document.getElementById('confirm-redpacket')?.addEventListener('click', async () => {
        const amount = document.getElementById('redpacket-amount').value;
        const wish = document.getElementById('redpacket-wish').value || '恭喜发财，大吉大利';
        
        if (!amount || isNaN(amount) || amount <= 0) {
            this.app.phoneShell.showNotification('提示', '请输入正确的金额', '⚠️');
            return;
        }
        
        this.app.wechatData.addMessage(this.app.currentChat.id, {
            from: 'me',
            type: 'redpacket',
            amount: amount,
            wish: wish,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        
        this.app.phoneShell.showNotification('红包已发送', `已向${this.app.currentChat.name}发送¥${amount}红包`, '🧧');
        
        // 🔥 通知AI
        if (window.VirtualPhone?.settings?.onlineMode) {
            await this.notifyAI(`用户通过微信给你发了一个¥${amount}的红包，祝福语：${wish}`);
        }
        
        setTimeout(() => this.app.render(), 1000);
    });
}

// 🎨 添加自定义表情弹窗
showAddCustomEmojiDialog() {
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-add-emoji">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">添加表情</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <div style="background: #fff; border-radius: 12px; padding: 25px; text-align: center;">
                    <div style="font-size: 14px; color: #999; margin-bottom: 15px;">点击选择图片</div>
                    
                    <!-- 预览区 -->
                    <div id="emoji-preview" style="
                        width: 120px;
                        height: 120px;
                        border-radius: 12px;
                        border: 2px dashed #ccc;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 60px;
                        color: #ccc;
                        cursor: pointer;
                        overflow: hidden;
                    ">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    
                    <input type="file" id="emoji-image-upload" accept="image/*" style="display: none;">
                    
                    <!-- 名字输入 -->
                    <div style="text-align: left; margin-bottom: 20px;">
                        <div style="font-size: 13px; color: #999; margin-bottom: 8px;">表情名字（方便AI识别）</div>
                        <input type="text" id="emoji-name-input" placeholder="例如：开心、哭泣、比心" maxlength="10" style="
                            width: 100%;
                            padding: 12px;
                            border: 1.5px solid #e5e5e5;
                            border-radius: 8px;
                            font-size: 15px;
                            box-sizing: border-box;
                        ">
                    </div>
                    
                    <button id="save-custom-emoji" style="
                        width: 100%;
                        padding: 14px;
                        background: #07c160;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                    ">保存</button>
                </div>
            </div>
        </div>
    `;
    
    this.app.phoneShell.setContent(html);
    
    let selectedImage = null;
    
    document.getElementById('back-from-add-emoji')?.addEventListener('click', () => {
        this.app.render();
    });
    
    document.getElementById('emoji-preview')?.addEventListener('click', () => {
        document.getElementById('emoji-image-upload').click();
    });
    
    document.getElementById('emoji-image-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                this.app.phoneShell.showNotification('提示', '图片太大，请选择小于1MB的图片', '⚠️');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImage = e.target.result;
                const preview = document.getElementById('emoji-preview');
                preview.innerHTML = `<img src="${selectedImage}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('save-custom-emoji')?.addEventListener('click', () => {
        const name = document.getElementById('emoji-name-input').value.trim();
        
        if (!selectedImage) {
            this.app.phoneShell.showNotification('提示', '请选择图片', '⚠️');
            return;
        }
        
        if (!name) {
            this.app.phoneShell.showNotification('提示', '请输入表情名字', '⚠️');
            return;
        }
        
        this.app.wechatData.addCustomEmoji({
            name: name,
            image: selectedImage
        });
        
        this.app.phoneShell.showNotification('添加成功', `表情"${name}"已添加`, '✅');
        this.emojiTab = 'custom';
        setTimeout(() => this.app.render(), 1000);
    });
}

// 🔔 通用AI通知方法
async notifyAI(message) {
    if (!window.VirtualPhone?.settings?.onlineMode) return;
    
    try {
        const context = window.SillyTavern?.getContext?.();
        if (!context) return;
        
        const prompt = `${context.name1 || '用户'}${message}`;
        
        // 静默调用AI
        await this.sendToAIHidden(prompt, context);
        
        console.log('✅ 已通知AI:', message);
    } catch (error) {
        console.error('❌ 通知AI失败:', error);
    }
  }
}
