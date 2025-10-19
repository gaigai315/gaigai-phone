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
            const saved = this.storage.get(key, false);
            
            if (saved) {
                const data = JSON.parse(saved);
                console.log('📂 已加载微信数据');
                return data;
            }
        } catch (e) {
            console.error('加载微信数据失败:', e);
        }
        
        console.log('🆕 新用户，创建空数据');
        return {
            userInfo: {
                name: '我',
                wxid: 'wxid_' + Math.random().toString(36).substr(2, 9),
                avatar: '😊',
                signature: '',
                coverImage: null
            },
            chats: [],
            contacts: [],
            messages: {},
            moments: []
        };
    }
    
    getStorageKey() {
        const context = this.storage.getContext();
        const charId = context?.characterId || 'default';
        const chatId = context?.chatId || 'default';
        return `${this.storageKey}_${charId}_${chatId}`;
    }
    
    async saveData() {
        try {
            const key = this.getStorageKey();
            await this.storage.set(key, JSON.stringify(this.data), false);
            console.log('💾 微信数据已保存');
        } catch (e) {
            console.error('保存微信数据失败:', e);
        }
    }
    
    getUserInfo() {
        return this.data.userInfo;
    }
    
    updateUserInfo(info) {
        Object.assign(this.data.userInfo, info);
        this.saveData();
    }
    
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
        
        const chat = this.getChat(chatId);
        if (chat) {
            chat.lastMessage = message.content || '[图片]';
            chat.time = message.time;
        }
        
        this.saveData();
    }
    
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
    
    async loadContactsFromCharacter() {
        const context = this.storage.getContext();
        
        if (!context) {
            return { success: false, message: '无法获取上下文信息' };
        }
        
        const charName = context.name2 || context.name || '角色';
        const charDesc = context.description || '';
        const scenario = context.scenario || '';
        const personality = context.personality || '';
        
        const chatHistory = [];
        if (context.chat && Array.isArray(context.chat)) {
            const recentChats = context.chat.slice(-50);
            recentChats.forEach(msg => {
                chatHistory.push({
                    speaker: msg.is_user ? '用户' : charName,
                    message: msg.mes || ''
                });
            });
        }
        
        console.log('📖 准备发送给AI:', {
            角色名: charName,
            描述长度: charDesc.length,
            聊天记录条数: chatHistory.length
        });
        
        const prompt = this.buildAIPrompt(charName, charDesc, scenario, personality, chatHistory);
        
        try {
            const aiResponse = await this.sendToAI(prompt);
            
            if (!aiResponse) {
                throw new Error('AI未返回数据');
            }
            
            const generatedData = this.parseAIResponse(aiResponse);
            
            if (!generatedData || !generatedData.contacts) {
                throw new Error('AI返回的数据格式错误');
            }
            
            let addedCount = 0;
            generatedData.contacts.forEach(contact => {
                const exists = this.data.contacts.find(c => c.name === contact.name);
                if (!exists) {
                    this.data.contacts.push({
                        id: `contact_${Date.now()}_${Math.random()}`,
                        name: contact.name,
                        avatar: contact.avatar || '👤',
                        remark: contact.remark || '',
                        letter: this.getFirstLetter(contact.name),
                        relation: contact.relation || ''
                    });
                    addedCount++;
                }
            });
            
            if (generatedData.groups && generatedData.groups.length > 0) {
                generatedData.groups.forEach(group => {
                    const exists = this.data.chats.find(c => c.name === group.name);
                    if (!exists) {
                        this.data.chats.push({
                            id: `group_${Date.now()}_${Math.random()}`,
                            name: group.name,
                            type: 'group',
                            avatar: group.avatar || '👥',
                            lastMessage: group.lastMessage || '',
                            time: '刚刚',
                            unread: 0,
                            members: group.members || []
                        });
                    }
                });
            }
            
            await this.saveData();
            
            return {
                success: true,
                count: addedCount,
                message: `成功生成${addedCount}个联系人`
            };
            
        } catch (error) {
            console.error('❌ AI生成失败:', error);
            return {
                success: false,
                message: `生成失败: ${error.message}`
            };
        }
    }
    
    buildAIPrompt(charName, desc, scenario, personality, chatHistory) {
        const chatText = chatHistory.length > 0 
            ? chatHistory.map(c => `${c.speaker}: ${c.message}`).join('\n')
            : '（暂无聊天记录）';
        
        return `
# 任务：根据角色卡和聊天记录，智能生成微信联系人和群聊

## 角色卡信息
- 角色名：${charName}
- 描述：${desc}
- 场景：${scenario}
- 性格：${personality}

## 聊天记录（最近50条）
${chatText}

---

## 要求
1. 分析角色卡和聊天记录，推测出可能的人物关系（家人、朋友、同事等）
2. 生成合理的微信联系人列表（5-10人）
3. 如果有多人互动，创建群聊（1-3个）
4. 每个联系人需要包含：name（姓名）、avatar（emoji头像）、relation（关系）
5. **必须返回纯JSON格式**，不要有任何其他文字

## 返回格式示例
\`\`\`json
{
  "contacts": [
    {"name": "妈妈", "avatar": "👩‍🦱", "relation": "母亲"},
    {"name": "李明", "avatar": "👨", "relation": "同事"}
  ],
  "groups": [
    {"name": "家庭群", "avatar": "👨‍👩‍👧", "members": ["妈妈", "爸爸"], "lastMessage": "今晚回家吃饭吗？"}
  ]
}
\`\`\`

现在开始生成：
`;
    }
    
    async sendToAI(prompt) {
        return new Promise((resolve, reject) => {
            const textarea = document.querySelector('#send_textarea');
            if (!textarea) {
                reject(new Error('找不到聊天输入框'));
                return;
            }
            
            const originalValue = textarea.value;
            
            textarea.value = prompt;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            const context = this.storage.getContext();
            let responded = false;
            
            const handler = (messageId) => {
                if (responded) return;
                responded = true;
                
                try {
                    const chat = context.chat;
                    const lastMsg = chat[chat.length - 1];
                    
                    if (lastMsg && !lastMsg.is_user) {
                        const aiText = lastMsg.mes || lastMsg.swipes?.[lastMsg.swipe_id || 0] || '';
                        
                        setTimeout(() => {
                            const allMessages = document.querySelectorAll('.mes');
                            if (allMessages.length >= 2) {
                                const userMsg = allMessages[allMessages.length - 2];
                                if (userMsg) {
                                    userMsg.style.display = 'none';
                                }
                            }
                        }, 500);
                        
                        setTimeout(() => {
                            const allMessages = document.querySelectorAll('.mes');
                            if (allMessages.length >= 1) {
                                const aiMsg = allMessages[allMessages.length - 1];
                                if (aiMsg) {
                                    aiMsg.style.display = 'none';
                                }
                            }
                        }, 800);
                        
                        textarea.value = originalValue;
                        
                        context.eventSource.removeListener(
                            context.event_types.CHARACTER_MESSAGE_RENDERED,
                            handler
                        );
                        
                        resolve(aiText);
                    }
                } catch (e) {
                    reject(e);
                }
            };
            
            context.eventSource.on(
                context.event_types.CHARACTER_MESSAGE_RENDERED,
                handler
            );
            
            setTimeout(() => {
                const sendBtn = document.querySelector('#send_but');
                if (sendBtn) {
                    sendBtn.click();
                } else {
                    reject(new Error('找不到发送按钮'));
                }
            }, 100);
            
            setTimeout(() => {
                if (!responded) {
                    responded = true;
                    textarea.value = originalValue;
                    reject(new Error('AI响应超时'));
                }
            }, 30000);
        });
    }
    
    parseAIResponse(text) {
        try {
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                             text.match(/```\s*([\s\S]*?)\s*```/) ||
                             [null, text];
            
            const jsonText = jsonMatch[1].trim();
            const data = JSON.parse(jsonText);
            
            console.log('✅ AI返回数据:', data);
            return data;
            
        } catch (e) {
            console.error('❌ 解析AI返回失败:', e);
            console.log('原始文本:', text);
            return this.fallbackParse(text);
        }
    }
    
    fallbackParse(text) {
        console.warn('⚠️ 使用容错解析');
        
        const contacts = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/([^\s-]+)\s*[-:：]\s*(.+)/);
            if (match) {
                contacts.push({
                    name: match[1].trim(),
                    avatar: '👤',
                    relation: match[2].trim()
                });
            }
        });
        
        return { contacts, groups: [] };
    }
    
    getFirstLetter(name) {
        const letterMap = {
            '张': 'Z', '王': 'W', '李': 'L', '赵': 'Z', '刘': 'L',
            '陈': 'C', '杨': 'Y', '黄': 'H', '周': 'Z', '吴': 'W',
            '徐': 'X', '孙': 'S', '马': 'M', '朱': 'Z', '胡': 'H',
            '郭': 'G', '何': 'H', '高': 'G', '林': 'L', '罗': 'L',
            '梁': 'L', '宋': 'S', '郑': 'Z', '谢': 'X', '韩': 'H',
            '唐': 'T', '冯': 'F', '于': 'Y', '董': 'D', '萧': 'X',
            '程': 'C', '曹': 'C', '袁': 'Y', '邓': 'D', '许': 'X',
            '傅': 'F', '沈': 'S', '曾': 'Z', '彭': 'P', '吕': 'L'
        };
        
                const firstChar = name[0];
        if (/[a-zA-Z]/.test(firstChar)) {
            return firstChar.toUpperCase();
        }
        if (/\d/.test(firstChar)) {
            return '#';
        }
        return letterMap[firstChar] || firstChar.toUpperCase() || '#';
    }
}

    // 🗑️ 删除消息
    deleteMessage(chatId, messageIndex) {
        if (this.data.messages[chatId] && this.data.messages[chatId][messageIndex]) {
            this.data.messages[chatId].splice(messageIndex, 1);
            this.saveData();
        }
    }
    
    // ✏️ 编辑消息
    editMessage(chatId, messageIndex, newContent) {
        if (this.data.messages[chatId] && this.data.messages[chatId][messageIndex]) {
            this.data.messages[chatId][messageIndex].content = newContent;
            this.saveData();
        }
    }
    
    // 🎨 设置聊天背景
    setChatBackground(chatId, background) {
        const chat = this.getChat(chatId);
        if (chat) {
            chat.background = background;
            this.saveData();
        }
    }
    
    // 🗑️ 删除聊天
    deleteChat(chatId) {
        this.data.chats = this.data.chats.filter(c => c.id !== chatId);
        delete this.data.messages[chatId];
        this.saveData();
    }
    
    // 🚫 拉黑联系人
    blockContact(contactId) {
        const contact = this.getContact(contactId);
        if (contact) {
            contact.blocked = true;
            this.saveData();
        }
    }
