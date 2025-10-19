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
            contactId: chatInfo.contactId,
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
    
    // ✅ 智能加载联系人（调用AI）
    async loadContactsFromCharacter() {
        try {
            const context = typeof SillyTavern !== 'undefined' && SillyTavern.getContext 
                ? SillyTavern.getContext() 
                : null;
            
            if (!context) {
                return { success: false, message: '❌ 无法获取SillyTavern上下文' };
            }
            
            console.log('📖 准备调用AI生成联系人...');
            
            // ✅ 构建AI提示词
            const prompt = this.buildContactPrompt(context);
            
            console.log('📤 发送给AI的提示词长度:', prompt.length);
            
            // ✅ 调用AI
            const aiResponse = await this.sendToAI(prompt);
            
            if (!aiResponse) {
                throw new Error('AI未返回数据');
            }
            
            console.log('📥 AI返回:', aiResponse);
            
            // ✅ 解析AI返回
            const generatedData = this.parseAIResponse(aiResponse);
            
            if (!generatedData || !generatedData.contacts) {
                throw new Error('AI返回的数据格式错误');
            }
            
            // ✅ 添加联系人
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
            
            // ✅ 添加群聊
            if (generatedData.groups && generatedData.groups.length > 0) {
                generatedData.groups.forEach(group => {
                    const exists = this.data.chats.find(c => c.name === group.name);
                    if (!exists) {
                        const chatId = `group_${Date.now()}_${Math.random()}`;
                        this.data.chats.push({
                            id: chatId,
                            name: group.name,
                            type: 'group',
                            avatar: group.avatar || '👥',
                            lastMessage: '',
                            time: '刚刚',
                            unread: 0,
                            members: group.members || []
                        });
                        
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
                message: `✅ 成功生成${addedCount}个联系人`
            };
            
        } catch (error) {
            console.error('❌ AI生成失败:', error);
            return {
                success: false,
                message: `生成失败: ${error.message}`
            };
        }
    }
    
    // 🔧 构建AI提示词
    buildContactPrompt(context) {
        const charName = context.name2 || context.name || '角色';
        const userName = context.name1 || '用户';
        
        // 从聊天记录提取
        const chatHistory = [];
        if (context.chat && Array.isArray(context.chat)) {
            const recentChats = context.chat.slice(-30);
            recentChats.forEach(msg => {
                if (msg.mes && msg.mes.trim()) {
                    chatHistory.push({
                        speaker: msg.is_user ? userName : charName,
                        message: msg.mes.substring(0, 300)
                    });
                }
            });
        }
        
        const chatText = chatHistory.length > 0 
            ? chatHistory.map(c => `${c.speaker}: ${c.message}`).join('\n')
            : '（暂无聊天记录）';
        
        // 尝试从 worldInfo 获取
        let worldInfoText = '';
        if (context.worldInfoData && Array.isArray(context.worldInfoData)) {
            worldInfoText = context.worldInfoData
                .map(w => w.content || '')
                .join('\n')
                .substring(0, 1000);
        }
        
        return `你是一个智能助手，根据提供的信息生成微信联系人列表。

## 📋 当前角色
**角色名：** ${charName}
**用户名：** ${userName}

## 💬 聊天记录（最近30条）
${chatText}

${worldInfoText ? `## 🌍 世界设定\n${worldInfoText}\n` : ''}

---

## ✅ 任务要求
1. **深度分析** 聊天记录中提到的人物关系（家人、朋友、同事等）
2. 生成 **5-10个** 合理的联系人
3. 如果有群体场景，生成 **1-3个** 群聊
4. **严格按JSON格式返回**，不要任何解释

## 📤 返回格式（必须严格遵守）
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
- 只返回JSON对象
- 不要用markdown代码块包裹
- name必须是真实的人名
- avatar使用emoji
- relation描述具体关系

开始生成：`;
    }
    
     // 📤 发送给AI（隐藏消息）
async sendToAI(prompt) {
    return new Promise((resolve, reject) => {
        const context = this.storage.getContext();
        
        if (!context) {
            reject(new Error('无法获取上下文'));
            return;
        }
        
        // ✅ 直接调用生成API，不通过输入框
        let responded = false;
        
        const handler = (messageId) => {
            if (responded) return;
            
            try {
                const chat = context.chat;
                if (!chat || chat.length === 0) return;
                
                const lastMsg = chat[chat.length - 1];
                
                // 只处理AI的回复
                if (lastMsg && !lastMsg.is_user) {
                    responded = true;
                    
                    const aiText = lastMsg.mes || lastMsg.swipes?.[lastMsg.swipe_id || 0] || '';
                    
                    // ✅ 删除用户消息和AI消息
                    setTimeout(() => {
                        // 删除最后两条消息（用户+AI）
                        if (chat.length >= 2) {
                            chat.splice(chat.length - 2, 2);
                            
                            // 刷新聊天显示
                            if (typeof context.saveChat === 'function') {
                                context.saveChat();
                            }
                            
                            // 隐藏DOM元素
                            const allMessages = document.querySelectorAll('.mes');
                            if (allMessages.length >= 2) {
                                allMessages[allMessages.length - 2].remove();
                                allMessages[allMessages.length - 1].remove();
                            }
                        }
                    }, 1000);
                    
                    context.eventSource.removeListener(
                        context.event_types.CHARACTER_MESSAGE_RENDERED,
                        handler
                    );
                    
                    resolve(aiText);
                }
            } catch (e) {
                console.error('处理AI回复失败:', e);
                reject(e);
            }
        };
        
        // 监听AI回复
        context.eventSource.on(
            context.event_types.CHARACTER_MESSAGE_RENDERED,
            handler
        );
        
        // ✅ 手动构建请求，绕过输入框
        setTimeout(async () => {
            try {
                // 手动添加用户消息到聊天记录
                const userMsg = {
                    name: context.name1 || 'You',
                    is_user: true,
                    is_system: false,
                    send_date: new Date().toISOString(),
                    mes: prompt,
                    extra: {}
                };
                
                context.chat.push(userMsg);
                
                // 触发生成
                if (typeof context.generate === 'function') {
                    await context.generate();
                } else if (typeof Generate === 'function') {
                    await Generate();
                } else {
                    // 最后手段：点击发送按钮
                    const sendBtn = document.querySelector('#send_but');
                    if (sendBtn) {
                        const textarea = document.querySelector('#send_textarea');
                        if (textarea) {
                            textarea.value = prompt;
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            setTimeout(() => sendBtn.click(), 100);
                        }
                    }
                }
                
            } catch (e) {
                console.error('发送失败:', e);
                reject(e);
            }
        }, 100);
        
        // 60秒超时
        setTimeout(() => {
            if (!responded) {
                responded = true;
                context.eventSource.removeListener(
                    context.event_types.CHARACTER_MESSAGE_RENDERED,
                    handler
                );
                reject(new Error('AI响应超时（60秒）'));
            }
        }, 60000);
    });
}
    
    // 📥 解析AI返回
    parseAIResponse(text) {
        try {
            console.log('🔍 AI原始返回:', text);
            
            let jsonText = text;
            
            // 移除markdown代码块
            const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                jsonText = codeBlockMatch[1];
            }
            
            // 提取花括号内容
            const braceMatch = jsonText.match(/\{[\s\S]*\}/);
            if (braceMatch) {
                jsonText = braceMatch[0];
            }
            
            // 清理干扰字符
            jsonText = jsonText
                .replace(/^[^{]*/, '')
                .replace(/[^}]*$/, '')
                .trim();
            
            console.log('🔍 提取的JSON:', jsonText);
            
            const data = JSON.parse(jsonText);
            
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
    
    // 🔧 容错解析
    fallbackParse(text) {
        console.warn('⚠️ 使用容错解析模式');
        
        const contacts = [];
        const lines = text.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/["']?([^"'\s:：-]+)["']?\s*[-:：]\s*["']?([^"'\n]+)["']?/);
            if (match && match[1].length < 10) {
                const name = match[1].trim();
                const relation = match[2].trim();
                
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
        return { contacts, groups: [] };
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
        
        return '👤';
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
