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
    
// 🔧 构建联系人生成提示词（完整版：角色卡+记忆表格）
buildContactPrompt(context) {
    const charName = context.name2 || context.name || '角色';
    const userName = context.name1 || '用户';
    
    console.log('📝 [联系人生成] 开始构建提示词...');
    
    // ========================================
    // 1️⃣ 获取角色卡信息
    // ========================================
    let charPersonality = '';
    let charScenario = '';
    
    if (context.characters && context.characterId !== undefined) {
        const char = context.characters[context.characterId];
        if (char) {
            charPersonality = char.personality || '';
            charScenario = char.scenario || '';
            
            console.log('✅ [联系人生成] 角色信息:', {
                personality: charPersonality ? `${charPersonality.length}字` : '无',
                scenario: charScenario ? `${charScenario.length}字` : '无'
            });
        }
    }
    
    // ========================================
    // 2️⃣ 获取记忆表格
    // ========================================
    let memoryTableData = '';
    
    if (window.Gaigai && window.Gaigai.m && Array.isArray(window.Gaigai.m.s)) {
        const memoryLines = [];
        
        window.Gaigai.m.s.forEach((section) => {
            if (Array.isArray(section.r) && section.r.length > 0) {
                memoryLines.push(`## ${section.n}`);
                
                section.r.forEach((row) => {
                    const values = Object.values(row).filter(v => v && typeof v === 'string');
                    if (values.length > 0) {
                        memoryLines.push(values.join(' | '));
                    }
                });
            }
        });
        
        if (memoryLines.length > 0) {
            memoryTableData = '\n**记忆表格（NPC和剧情）：**\n' + memoryLines.join('\n') + '\n';
            console.log('✅ [联系人生成] 记忆表格:', memoryLines.length, '行');
        }
    } else {
        console.log('⚠️ [联系人生成] 未找到记忆表格');
    }
    
    // ========================================
    // 3️⃣ 获取聊天记录
    // ========================================
    const chatHistory = [];
    if (context.chat && Array.isArray(context.chat)) {
        const recentChats = context.chat.slice(-30);
        recentChats.forEach(msg => {
            if (msg.mes && msg.mes.trim()) {
                const speaker = msg.is_user ? userName : charName;
                const content = msg.mes
                    .replace(/<[^>]*>/g, '')
                    .replace(/\*.*?\*/g, '')
                    .substring(0, 300);
                
                if (content.trim()) {
                    chatHistory.push(`${speaker}: ${content}`);
                }
            }
        });
    }
    
    const chatText = chatHistory.length > 0 
        ? chatHistory.join('\n')
        : '（暂无聊天记录）';
    
    console.log('✅ [联系人生成] 聊天记录:', chatHistory.length, '条');
    
    // ========================================
    // 4️⃣ 构建提示词
    // ========================================
    return `你是一个数据生成助手。请根据以下信息，生成微信联系人列表。

# 角色信息
- **角色名：** ${charName}
- **用户名：** ${userName}

${charPersonality ? `**性格和背景：**\n${charPersonality}\n` : ''}
${charScenario ? `**场景：**\n${charScenario}\n` : ''}
${memoryTableData}

# 聊天历史（最近30条）
${chatText}

---

# 任务要求
根据上述信息，分析出**5-10个**可能存在的联系人（朋友、家人、同事等），以及**0-3个**可能的微信群聊。

**重点**：
- 从性格背景中提取关系人物
- 从记忆表格中提取NPC
- **必须添加主角色 ${charName} 作为联系人**

# 输出格式（严格按此JSON格式，不要任何其他文字）
\`\`\`json
{
  "contacts": [
    {
      "name": "${charName}",
      "avatar": "⭐",
      "relation": "主角",
      "remark": "主要角色"
    },
    {
      "name": "张三",
      "avatar": "👨",
      "relation": "朋友",
      "remark": "好友"
    }
  ],
  "groups": [
    {
      "name": "家庭群",
      "avatar": "👨‍👩‍👧",
      "members": ["妈妈", "爸爸", "${charName}"]
    }
  ]
}
\`\`\`

**注意：**
1. 只返回JSON，不要解释
2. 联系人名字要符合角色背景
3. 头像用emoji表情（👨👩👤👔⭐等）
4. relation字段写明关系（朋友/家人/同事/主角等）
5. **第一个联系人必须是 ${charName} 本人**

现在请生成：`;
}
    
// 📤 完全静默调用AI（直接隐藏聊天容器）
async sendToAI(prompt) {
    return new Promise((resolve, reject) => {
        try {
            const context = this.storage.getContext();
            if (!context) {
                throw new Error('无法获取SillyTavern上下文');
            }

            console.log('🚀 [联系人生成] 开始完全静默调用AI...');

            const textarea = document.querySelector('#send_textarea');
            if (!textarea) {
                throw new Error('找不到聊天输入框');
            }

            const chatContainer = document.getElementById('chat');
            if (!chatContainer) {
                throw new Error('找不到聊天容器');
            }

            const originalValue = textarea.value;
            
            // 🔥 直接隐藏整个聊天容器
            const originalDisplay = chatContainer.style.display;
            chatContainer.style.display = 'none';
            
            console.log('🙈 [联系人生成] 已隐藏聊天容器');

            let responded = false;

            const timeout = setTimeout(() => {
                if (!responded) {
                    responded = true;
                    chatContainer.style.display = originalDisplay;
                    textarea.value = originalValue;
                    this.cleanupSilentMessages(context);
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

                        const aiText = lastMsg.mes || lastMsg.swipes?.[lastMsg.swipe_id || 0] || '';

                        chat.splice(chat.length - 2, 2);
                        
                        chatContainer.style.display = originalDisplay;
                        textarea.value = originalValue;

                        context.eventSource.removeListener(
                            context.event_types.CHARACTER_MESSAGE_RENDERED,
                            messageHandler
                        );

                        console.log('✅ [联系人生成] 静默调用成功');
                        resolve(aiText);
                    }
                } catch (e) {
                    responded = true;
                    clearTimeout(timeout);
                    chatContainer.style.display = originalDisplay;
                    textarea.value = originalValue;
                    this.cleanupSilentMessages(context);
                    reject(e);
                }
            };

            context.eventSource.on(
                context.event_types.CHARACTER_MESSAGE_RENDERED,
                messageHandler
            );

            textarea.value = prompt;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            setTimeout(() => {
                if (!responded) {
                    const sendBtn = document.querySelector('#send_but');
                    if (sendBtn) {
                        sendBtn.click();
                        console.log('📤 [联系人生成] 已发送（聊天容器已隐藏）');
                    } else {
                        responded = true;
                        clearTimeout(timeout);
                        chatContainer.style.display = originalDisplay;
                        textarea.value = originalValue;
                        reject(new Error('找不到发送按钮'));
                    }
                }
            }, 200);

        } catch (error) {
            console.error('❌ [联系人生成] 静默调用失败:', error);
            reject(error);
        }
    });
}

// 🔧 清理静默消息
cleanupSilentMessages(context) {
    try {
        if (context.chat && context.chat.length >= 2) {
            context.chat.splice(context.chat.length - 2, 2);
        }
        document.querySelectorAll('.mes.phone-hidden-contact').forEach(el => el.remove());
        document.getElementById('phone-silent-contact')?.remove();
        console.log('🗑️ [联系人生成] 已清理消息');
    } catch (e) {
        console.error('清理失败:', e);
    }
}
    
// 📥 解析AI返回（增强版）
parseAIResponse(text) {
    try {
        console.log('🔍 AI原始返回（前500字符）:', text.substring(0, 500));
        
        let jsonText = text;
        
        // 1. 移除markdown代码块
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
            console.log('✅ 提取到markdown代码块');
        }
        
        // 2. 提取花括号内容
        const braceMatch = jsonText.match(/\{[\s\S]*\}/);
        if (braceMatch) {
            jsonText = braceMatch[0];
            console.log('✅ 提取到JSON对象');
        }
        
        // 3. 清理干扰字符
        jsonText = jsonText
            .replace(/^[^{]*/, '')
            .replace(/[^}]*$/, '')
            .trim();
        
        console.log('🔍 清理后的JSON:', jsonText.substring(0, 200));
        
        // 4. 解析JSON
        const data = JSON.parse(jsonText);
        
        // 5. 验证数据结构
        if (!data.contacts || !Array.isArray(data.contacts)) {
            console.warn('⚠️ 缺少contacts字段，使用空数组');
            data.contacts = [];
        }
        
        if (!data.groups || !Array.isArray(data.groups)) {
            data.groups = [];
        }
        
        console.log(`✅ 成功解析，联系人:${data.contacts.length}个，群聊:${data.groups.length}个`);
        return data;
        
    } catch (e) {
        console.error('❌ JSON解析失败:', e.message);
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
