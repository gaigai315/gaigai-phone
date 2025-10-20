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
        
        let result = text;
        for (let emoji in emojiMap) {
            result = result.split(emoji).join(emojiMap[emoji]);
        }
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
    const userAvatar = this.app.data.getUserInfo().avatar;
    
    // 添加用户消息到微信
    this.app.data.addMessage(this.app.currentChat.id, {
        from: 'me',
        content: this.inputText,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
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
        const wechatMessages = this.app.data.getMessages(this.app.currentChat.id);
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
            chatHistory, 
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
                this.app.data.addMessage(this.app.currentChat.id, {
                    from: charName,
                    content: msgText,
                    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
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

// 🔧 构建手机聊天提示词（完整版：主角+用户+NPC）
buildPhoneChatPrompt(context, contactName, chatHistory, userMessage) {
    const charName = context.name2 || context.name || '对方';
    const userName = context.name1 || '用户';
    
    console.log('📝 开始构建提示词...');
    
    // ========================================
    // 1️⃣ AI角色信息（主角）
    // ========================================
    const charDescription = context.description || '';
    const charPersonality = context.personality || '';
    const charScenario = context.scenario || '';
    const charFirstMes = context.firstMes || '';
    
    console.log('✅ AI角色信息:', {
        description: charDescription ? '有' : '无',
        personality: charPersonality ? '有' : '无',
        scenario: charScenario ? '有' : '无'
    });
    
    // 示例对话
    let charExamples = '';
    if (context.mesExamples) {
        charExamples = context.mesExamples
            .replace(/<START>/g, '\n---\n')
            .substring(0, 1000);
        console.log('✅ 示例对话:', charExamples.length, '字符');
    }
    
    // ========================================
    // 2️⃣ 用户信息
    // ========================================
    const userPersona = context.persona || '';
    console.log('✅ 用户角色卡:', userPersona ? `有(${userPersona.length}字符)` : '无');
    
    // ========================================
    // 3️⃣ NPC信息（世界书）
    // ========================================
    let worldBookNPCs = '';
    if (context.worldInfoData && Array.isArray(context.worldInfoData)) {
        const entries = context.worldInfoData
            .filter(entry => entry.content && entry.content.length > 0)
            .slice(0, 20); // 增加到20条
        
        if (entries.length > 0) {
            worldBookNPCs = entries
                .map(entry => `- ${entry.content}`)
                .join('\n')
                .substring(0, 4000); // 增加长度限制
            console.log('✅ 世界书条目:', entries.length, '条');
        }
    }
    
 // ========================================
// 4️⃣ NPC信息（记忆表格）- 正确的API
// ========================================
let memoryTableData = '';
if (typeof window.Gaigai !== 'undefined') {
    try {
        console.log('🔍 检测到记忆表格插件');
        
        if (window.Gaigai.m && window.Gaigai.m.summary) {
            memoryTableData = window.Gaigai.m.summary;
            console.log('✅ 记忆表格总结:', memoryTableData.length, '字符');
        } else if (window.Gaigai.data && window.Gaigai.data.summary) {
            memoryTableData = window.Gaigai.data.summary;
            console.log('✅ 从data获取记忆总结');
        } else if (window.Gaigai.m && window.Gaigai.m.tbl && Array.isArray(window.Gaigai.m.tbl)) {
            const tableRows = window.Gaigai.m.tbl
                .filter(row => row && row.length > 0)
                .slice(0, 20)
                .map(row => row.join(' | '))
                .join('\n');
            if (tableRows) {
                memoryTableData = '记忆表格:\n' + tableRows;
                console.log('✅ 从表格提取:', window.Gaigai.m.tbl.length, '行');
            }
        }
        
        if (!memoryTableData) {
            console.log('⚠️ 记忆表格无可用数据');
        }
    } catch (e) {
        console.error('❌ 获取记忆表格失败:', e);
    }
} else {
    console.log('⚠️ 记忆表格插件未加载');
}
    
    // ========================================
    // 5️⃣ 聊天历史
    // ========================================
    const recentHistory = chatHistory.slice(-40);
    const historyText = recentHistory.map(h => {
        const source = h.source === 'tavern' ? '(面对面)' : '(微信)';
        return `${h.speaker}${source}: ${h.message}`;
    }).join('\n');
    
    console.log('✅ 聊天历史:', recentHistory.length, '条');
    
    // ========================================
    // 构建最终提示词
    // ========================================
    const sections = [];
    
    sections.push(
        '# 场景：微信聊天',
        `你正在通过微信和${userName}聊天（不是面对面对话，是手机文字聊天）。`,
        '',
        '## 你的角色信息（AI角色）',
        `**名字：** ${charName}`,
        `**微信备注名：** ${contactName}`
    );
    
    if (charDescription) {
        sections.push('', `**角色描述：**`, charDescription);
    }
    
    if (charPersonality) {
        sections.push('', `**性格：**`, charPersonality);
    }
    
    if (charScenario) {
        sections.push('', `**当前场景：**`, charScenario);
    }
    
    if (charExamples) {
        sections.push('', `**对话风格参考：**`, charExamples);
    }
    
    // 用户信息
    sections.push('', `## ${userName}的角色信息（用户）`);
    if (userPersona) {
        sections.push(userPersona);
    } else {
        sections.push('（无详细设定）');
    }
    
    // NPC信息
    if (worldBookNPCs || memoryTableData) {
        sections.push('', '## NPC和剧情信息');
        
        if (memoryTableData) {
            sections.push('', '**记忆总结（包含NPC和关键剧情）：**', memoryTableData);
        }
        
        if (worldBookNPCs) {
            sections.push('', '**世界书设定：**', worldBookNPCs);
        }
    }
    
    // 聊天历史
    sections.push(
        '',
        '## 完整聊天历史（包含面对面对话和微信记录）',
        historyText,
        '',
        '## 用户刚通过微信发来的消息',
        `${userName}(微信): ${userMessage}`,
        '',
        '---',
        '',
        '## 回复要求',
        '1. 只返回你的微信回复文字，不要旁白、动作、场景描述',
        '2. 语气符合微信聊天风格（简洁、口语化）',
        '3. 可以使用emoji 😊',
        '4. 多条消息用|||分隔，例如：好的|||我马上过来|||😊',
        '5. 考虑所有对话历史（面对面+微信）',
        '6. 考虑NPC信息和剧情发展',
        '7. 禁止输出JSON、XML、标签、格式代码',
        '',
        `现在回复${userName}的微信消息：`
    );
    
    const finalPrompt = sections.join('\n');
    console.log('📤 最终提示词长度:', finalPrompt.length, '字符');
    
    return finalPrompt;
}

// 🔧 完全静默调用AI（使用MutationObserver拦截）
async sendToAIHidden(prompt, context) {
    return new Promise((resolve, reject) => {
        try {
            console.log('🚀 开始完全静默调用AI...');

            const textarea = document.querySelector('#send_textarea');
            if (!textarea) {
                throw new Error('找不到聊天输入框');
            }

            const originalValue = textarea.value;
            
            // 🔥 关键：使用MutationObserver拦截新消息
            const chatContainer = document.getElementById('chat');
            if (!chatContainer) {
                throw new Error('找不到聊天容器');
            }

            let userMsgId = null;
            let aiMsgId = null;
            let responded = false;

            // 创建观察器，拦截所有新增的消息元素
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('mes')) {
                            // 立即隐藏新消息
                            node.style.display = 'none';
                            console.log('🚫 已拦截并隐藏新消息');
                        }
                    });
                });
            });

            // 开始观察
            observer.observe(chatContainer, {
                childList: true,
                subtree: true
            });

            const timeout = setTimeout(() => {
                if (!responded) {
                    responded = true;
                    observer.disconnect();
                    textarea.value = originalValue;
                    
                    // 清理泄露的消息
                    this.cleanupLeakedMessages(context);
                    
                   reject(new Error('AI响应超时（120秒）'));
                }
            }, 120000);

            const messageHandler = () => {
                if (responded) return;
                
                try {
                    const chat = context.chat;
                    if (!chat || chat.length < 2) return;

                    const lastMsg = chat[chat.length - 1];
                    if (lastMsg && !lastMsg.is_user) {
                        responded = true;
                        clearTimeout(timeout);
                        observer.disconnect();

                        const aiText = lastMsg.mes || lastMsg.swipes?.[lastMsg.swipe_id || 0] || '';

                        // 🔥 从聊天数组删除
                        chat.splice(chat.length - 2, 2);

                        // 🔥 从DOM删除（双重保险）
                        setTimeout(() => {
                            const allMessages = document.querySelectorAll('.mes');
                            const removed = [];
                            if (allMessages.length >= 2) {
                                const userMsg = allMessages[allMessages.length - 2];
                                const aiMsg = allMessages[allMessages.length - 1];
                                if (userMsg) {
                                    userMsg.remove();
                                    removed.push('用户消息');
                                }
                                if (aiMsg) {
                                    aiMsg.remove();
                                    removed.push('AI消息');
                                }
                            }
                            console.log('🗑️ 已删除DOM元素:', removed.join(', '));
                        }, 50);

                        textarea.value = originalValue;

                        context.eventSource.removeListener(
                            context.event_types.CHARACTER_MESSAGE_RENDERED,
                            messageHandler
                        );

                        console.log('✅ 静默调用成功，完全无痕迹');
                        resolve(aiText);
                    }
                } catch (e) {
                    responded = true;
                    clearTimeout(timeout);
                    observer.disconnect();
                    textarea.value = originalValue;
                    this.cleanupLeakedMessages(context);
                    reject(e);
                }
            };

            // 注册监听器
            context.eventSource.on(
                context.event_types.CHARACTER_MESSAGE_RENDERED,
                messageHandler
            );

            // 设置提示词并发送
            textarea.value = prompt;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            setTimeout(() => {
                if (!responded) {
                    const sendBtn = document.querySelector('#send_but');
                    if (sendBtn) {
                        sendBtn.click();
                        console.log('📤 已发送，观察器已拦截显示');
                    } else {
                        responded = true;
                        clearTimeout(timeout);
                        observer.disconnect();
                        textarea.value = originalValue;
                        reject(new Error('找不到发送按钮'));
                    }
                }
            }, 200);

        } catch (error) {
            console.error('❌ 静默调用失败:', error);
            reject(error);
        }
    });
}

// 🔧 清理泄露的消息（新增）
cleanupLeakedMessages(context) {
    try {
        // 从数组删除
        if (context.chat && context.chat.length >= 2) {
            const beforeLen = context.chat.length;
            context.chat.splice(context.chat.length - 2, 2);
            console.log(`🗑️ 从数组删除2条消息（${beforeLen} → ${context.chat.length}）`);
        }
        
        // 从DOM删除
        const allMessages = document.querySelectorAll('.mes');
        if (allMessages.length >= 2) {
            allMessages[allMessages.length - 2]?.remove();
            allMessages[allMessages.length - 1]?.remove();
            console.log('🗑️ 从DOM删除2条消息');
        }
    } catch (e) {
        console.error('清理失败:', e);
    }
}
    
    handleMoreAction(action) {
        switch(action) {
            case 'photo':
                this.selectPhoto();
                break;
            case 'camera':
                this.app.phoneShell.showNotification('相机', '打开相机...', '📸');
                break;
            case 'video':
                this.startVideoCall();
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
            case 'file':
                this.app.phoneShell.showNotification('文件', '选择文件...', '📁');
                break;
            case 'contact':
                this.app.phoneShell.showNotification('名片', '选择联系人...', '👤');
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
    
    document.getElementById('confirm-transfer')?.addEventListener('click', () => {
        const amount = document.getElementById('transfer-amount').value;
        const desc = document.getElementById('transfer-desc').value || '转账给你';
        
        if (!amount || isNaN(amount) || amount <= 0) {
            this.app.phoneShell.showNotification('提示', '请输入正确的金额', '⚠️');
            return;
        }
        
        this.app.data.addMessage(this.app.currentChat.id, {
            from: 'me',
            type: 'transfer',
            amount: amount,
            desc: desc,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        
        this.app.phoneShell.showNotification('转账成功', `已向${this.app.currentChat.name}转账¥${amount}`, '✅');
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
        this.app.phoneShell.showNotification('相册', '打开相册选择...', '📷');
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
            this.app.data.saveData();
            this.app.phoneShell.showNotification('保存成功', '设置已更新', '✅');
            setTimeout(() => this.app.render(), 1000);
        }
    });
}
    
    showTypingStatus() {
        const header = document.querySelector('.wechat-header-title');
        if (header && this.app.currentChat) {
            const originalContent = header.innerHTML;
            header.innerHTML = `
                <div>${this.app.currentChat.name}</div>
                <div style="font-size: 12px; color: #999; font-weight: normal; margin-top: 2px;">对方正在输入...</div>
            `;
            
            setTimeout(() => {
                header.innerHTML = originalContent;
            }, 3000);
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
                    this.app.data.setChatBackground(this.app.currentChat.id, e.target.result);
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
                this.app.data.setChatBackground(this.app.currentChat.id, bg);
                this.app.phoneShell.showNotification('设置成功', '聊天背景已更新', '✅');
                setTimeout(() => this.app.render(), 1000);
            });
        });
    }
    
    // 🗑️ 显示消息操作菜单
    showMessageMenu(messageIndex) {
        const messages = this.app.data.getMessages(this.app.currentChat.id);
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
    this.app.data.deleteMessage(this.app.currentChat.id, messageIndex);
    this.app.render();
    this.app.phoneShell.showNotification('已删除', '消息已删除', '✅');
}
    
    // ✏️ 编辑消息
    editMessage(messageIndex) {
    const messages = this.app.data.getMessages(this.app.currentChat.id);
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
            this.app.data.editMessage(this.app.currentChat.id, messageIndex, newContent);
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
            this.app.data.deleteChat(this.app.currentChat.id);
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
            this.app.data.blockContact(this.app.currentChat.contactId);
            this.app.phoneShell.showNotification('已拉黑', `${this.app.currentChat.name}已被拉黑`, '✅');
            this.app.currentChat = null;
            this.app.currentView = 'chats';
            setTimeout(() => this.app.render(), 1000);
        });
    }
}
