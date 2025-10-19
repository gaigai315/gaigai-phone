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
        contactId: chatInfo.contactId,  // ← 添加这一行
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
    
    // ✅ 获取角色卡信息
    const charName = context.name2 || context.name || '角色';
    const charDesc = context.description || '';
    const scenario = context.scenario || '';
    const personality = context.personality || '';
    
    // ✅ 获取用户信息（新增）
    const userName = context.name1 || '用户';
    const userPersona = context.user_persona || context.persona_description || '';
    
    // ✅ 获取聊天记录
    const chatHistory = [];
    // ... 保持原样
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
        
        const prompt = this.buildAIPrompt(charName, charDesc, scenario, personality, userName, userPersona, chatHistory);
        
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
            const chatId = `group_${Date.now()}_${Math.random()}`;
            
            // 创建群聊
            this.data.chats.push({
                id: chatId,
                name: group.name,
                type: 'group',
                avatar: group.avatar || '👥',
                lastMessage: '',  // ← 先设为空
                time: '刚刚',
                unread: 0,
                members: group.members || []
            });
            
            // 🎯 如果有lastMessage，创建对应的消息
            if (group.lastMessage) {
                this.addMessage(chatId, {
                    from: group.members?.[0] || '群成员',
                    content: group.lastMessage,
                    time: '刚刚',
                    type: 'text',
                    avatar: '👤'
                });
            }
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
    
buildAIPrompt(charName, charDesc, scenario, personality, userName, userPersona, chatHistory) {
    const chatText = chatHistory.length > 0 
        ? chatHistory.map(c => `${c.speaker}: ${c.message}`).join('\n')
        : '（暂无聊天记录）';
    
    return `
你是一个智能助手，现在需要根据提供的信息生成微信联系人列表。

# 角色卡信息
- **角色名：** ${charName}
- **描述：** ${charDesc || '无'}
- **场景设定：** ${scenario || '无'}
- **性格特征：** ${personality || '无'}

# 用户信息
- **用户名：** ${userName}
- **用户设定：** ${userPersona || '无'}

# 聊天记录（最近50条）
${chatText}

---

# 任务要求
1. 分析角色卡、用户信息和聊天记录，推测出可能的人物关系
2. 生成5-10个合理的联系人（家人、朋友、同事、同学等）
3. 如果有多人场景，生成1-3个群聊
4. **严格按照以下JSON格式返回**，不要有任何其他文字或解释

# 返回格式（必须严格遵守）
{
  "contacts": [
    {"name": "李明", "avatar": "👨", "relation": "同事"},
    {"name": "小红", "avatar": "👩", "relation": "朋友"}
  ],
  "groups": [
    {"name": "家庭群", "avatar": "👨‍👩‍👧", "members": ["妈妈", "爸爸"], "lastMessage": "今晚回家吃饭吗？"}
  ]
}

**注意：**
- 只返回JSON对象，不要用markdown代码块包裹
- 不要添加任何解释文字
- name必须是中文或英文名字
- avatar使用emoji表情
- relation描述关系（如：母亲、父亲、同事、朋友、同学等）

开始生成：`;
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
        console.log('🔍 AI原始返回:', text);
        
        // 1️⃣ 尝试提取JSON代码块
        let jsonText = text;
        
        // 移除markdown代码块
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
        }
        
        // 2️⃣ 尝试提取花括号内容
        const braceMatch = jsonText.match(/\{[\s\S]*\}/);
        if (braceMatch) {
            jsonText = braceMatch[0];
        }
        
        // 3️⃣ 清理可能的干扰字符
        jsonText = jsonText
            .replace(/^[^{]*/, '')  // 删除开头的非JSON字符
            .replace(/[^}]*$/, '')  // 删除结尾的非JSON字符
            .trim();
        
        console.log('🔍 提取的JSON:', jsonText);
        
        // 4️⃣ 解析JSON
        const data = JSON.parse(jsonText);
        
        // 5️⃣ 验证数据结构
        if (!data.contacts || !Array.isArray(data.contacts)) {
            throw new Error('缺少contacts字段');
        }
        
        console.log('✅ 成功解析，联系人数量:', data.contacts.length);
        return data;
        
    } catch (e) {
        console.error('❌ JSON解析失败:', e);
        console.log('尝试容错解析...');
        return this.fallbackParse(text);
    }
}
    
fallbackParse(text) {
    console.warn('⚠️ 使用容错解析模式');
    
    const contacts = [];
    const groups = [];
    
    // 提取联系人信息（支持多种格式）
    const lines = text.split('\n');
    
    lines.forEach(line => {
        // 匹配格式：李明 - 同事  或  李明：同事
        const match = line.match(/["']?([^"'\s:：-]+)["']?\s*[-:：]\s*["']?([^"'\n]+)["']?/);
        if (match && match[1].length < 10) {  // 名字不超过10个字
            const name = match[1].trim();
            const relation = match[2].trim();
            
            // 排除明显不是名字的内容
            if (!name.includes('联系人') && !name.includes('contacts')) {
                contacts.push({
                    name: name,
                    avatar: this.guessAvatar(name, relation),
                    relation: relation
                });
            }
        }
    });
    
    // 如果一个都没解析出来，创建默认联系人
    if (contacts.length === 0) {
        console.warn('⚠️ 无法解析，使用默认联系人');
        contacts.push(
            { name: '朋友A', avatar: '👤', relation: '朋友' },
            { name: '朋友B', avatar: '👤', relation: '朋友' },
            { name: '同事', avatar: '👔', relation: '同事' }
        );
    }
    
    console.log(`✅ 容错解析成功，生成${contacts.length}个联系人`);
    return { contacts, groups };
}

// 🎨 根据名字和关系猜测头像
guessAvatar(name, relation) {
    const relationMap = {
        '妈妈': '👩', '母亲': '👩', 
        '爸爸': '👨', '父亲': '👨',
        '哥哥': '👨', '弟弟': '👨', '姐姐': '👩', '妹妹': '👩',
        '老师': '👨‍🏫', '教授': '👨‍🏫',
        '同事': '👔', '上司': '💼', '老板': '💼',
        '朋友': '👤', '同学': '🎓',
        '医生': '👨‍⚕️', '护士': '👩‍⚕️'
    };
    
    for (const [key, emoji] of Object.entries(relationMap)) {
        if (relation.includes(key)) {
            return emoji;
        }
    }
    
    // 根据性别猜测
    if (name.includes('女') || name.includes('小红') || name.includes('小芳')) {
        return '👩';
    }
    if (name.includes('男') || name.includes('小明') || name.includes('小刚')) {
        return '👨';
    }
    
    return '👤';  // 默认
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
}
