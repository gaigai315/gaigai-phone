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
        
        // 🔥 修复1：增加严格的空值检查
        if (saved && saved.trim() !== '') {
            try {
                const data = JSON.parse(saved);
                console.log('📂 已加载微信数据');
                return data;
            } catch (parseError) {
                // 🔥 修复2：JSON解析失败时，记录错误并清空损坏数据
                console.error('❌ JSON解析失败:', parseError.message);
                console.warn('⚠️ 损坏的数据:', saved.substring(0, 200));
                
                // 清空损坏的数据
                this.storage.set(key, null, false);
                console.warn('⚠️ 已清空损坏的数据，将创建新数据');
            }
        }
    } catch (e) {
        console.error('❌ 加载微信数据失败:', e);
        console.error('错误堆栈:', e.stack);
    }
    
    // 🔥 修复3：无论如何都返回有效数据
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
        moments: [],
        customEmojis: []
    };
}
    
    getStorageKey() {
    // 🔥 修复：这个方法只应该返回数据类型，而不是完整的键。
    // 完整的键由 storage.js 统一构建。
    return this.storageKey; // this.storageKey 在构造函数中定义为 'wechat_data'
}
    
    async saveData() {
    try {
        // 🔥 验证数据有效性
        if (!this.data) {
            console.error('❌ 无效的数据，无法保存');
            return;
        }
        
        const key = this.getStorageKey();
        const jsonStr = JSON.stringify(this.data);
        
        // 🔥 验证 JSON 字符串
        if (!jsonStr || jsonStr === 'null' || jsonStr === 'undefined') {
            console.error('❌ JSON序列化失败:', jsonStr);
            return;
        }
        
        await this.storage.set(key, jsonStr, false);
        console.log('💾 微信数据已保存 (大小:', jsonStr.length, '字节)');
    } catch (e) {
        console.error('❌ 保存微信数据失败:', e);
        console.error('错误堆栈:', e.stack);
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
    
    // 🔥 记录消息在酒馆对话中的位置
try {
    const context = typeof SillyTavern !== 'undefined' && SillyTavern.getContext 
        ? SillyTavern.getContext() 
        : null;
    
    if (context && context.chat && Array.isArray(context.chat)) {
        // 🔥 统计真实对话数量（只计算用户和AI的对话）
        let messageCount = 0;
        for (let i = 0; i < context.chat.length; i++) {
            if (context.chat[i].is_user !== undefined) {
                messageCount++;
            }
        }
        
        // 🔥 记录：这条手机消息发生在第几句对话之后
        message.tavernMessageIndex = messageCount;
        message.realTimestamp = Date.now();
        
        console.log(`📍 [手机消息] 位置标记: 第${messageCount}句对话后 (酒馆消息总数=${context.chat.length})`);
    } else {
        // 如果无法获取上下文，标记为0（对话开始前）
        message.tavernMessageIndex = 0;
        message.realTimestamp = Date.now();
        console.warn('⚠️ 无法获取酒馆上下文，标记为对话开始前(0)');
    }
} catch (e) {
    console.error('❌ 记录索引失败:', e);
    message.tavernMessageIndex = 0;
    message.realTimestamp = Date.now();
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
        // 🔑 定义 context
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

        // 🔥 保存初始时间（如果有）
        if (generatedData.initialTime) {
            this.storage.set('story-initial-time', JSON.stringify(generatedData.initialTime), true);
            console.log('⏰ 已保存剧情初始时间:', generatedData.initialTime);
        }

        await this.saveData();
        
        return {
            success: true,
            count: addedCount,
            time: generatedData.initialTime || null,
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
    
// 🔧 构建联系人生成提示词（完整版 - 基于真实数据结构）
buildContactPrompt(context) {
    const charName = context.name2 || context.name || '角色';
    const userName = context.name1 || '用户';

    // 🔥🔥🔥 新增：从 PromptManager 获取联系人生成提示词 🔥🔥🔥
    const promptManager = window.VirtualPhone?.promptManager;
    let useTemplate = false;
    let templateContent = '';
    
    // 尝试获取模板
    if (promptManager) {
        try {
            if (promptManager.isEnabled('wechat', 'loadContacts')) {
                templateContent = promptManager.getPromptForFeature('wechat', 'loadContacts');
                useTemplate = true;
                console.log('✅ [联系人生成] 使用提示词模板');
            } else {
                console.log('⚠️ [联系人生成] 功能已禁用，使用内置提示词');
            }
        } catch (e) {
            console.warn('⚠️ [联系人生成] 获取模板失败:', e);
        }
    }
    
    console.log('📝 [联系人生成] 开始收集数据...');
    
    let allNPCInfo = '';
    const extractedNames = new Set();
    
    // ========================================
    // 1️⃣ 角色卡
    // ========================================
    let charInfo = '';
    if (context.characters && context.characterId !== undefined) {
        const char = context.characters[context.characterId];
        if (char) {
            charInfo = `角色：${char.name}\n`;
            if (char.personality) {
                charInfo += `性格：${char.personality.substring(0, 500)}\n`;
            }
            console.log('✅ [角色卡] 已加载');
        }
    }
    
    // ========================================
    // 2️⃣ 用户角色卡
    // ========================================
    let userInfo = '';
    const personaTextarea = document.getElementById('persona_description');
    if (personaTextarea && personaTextarea.value) {
        userInfo = `用户：${userName}\n${personaTextarea.value.substring(0, 300)}\n`;
        console.log('✅ [用户角色卡] 已加载');
    }
    
    // ========================================
    // 3️⃣ 世界书（从角色数据读取）
    // ========================================
    if (context.characters && context.characterId !== undefined) {
        const char = context.characters[context.characterId];
        if (char?.data?.character_book?.entries) {
            const entries = char.data.character_book.entries;
            console.log('✅ [世界书] 找到', entries.length, '条');
            
            entries.forEach(entry => {
                if (entry.content) {
                    allNPCInfo += `【${entry.comment || 'NPC'}】\n${entry.content}\n\n`;
                    
                    // 尝试从content提取人名
                    const lines = entry.content.split('\n');
                    lines.forEach(line => {
                        // 匹配 "姓名：XXX" 或 "名字：XXX"
                        const nameMatch = line.match(/(?:姓名|名字|Name)[：:]\s*([^\s，。,\.]+)/);
                        if (nameMatch && nameMatch[1]) {
                            extractedNames.add(nameMatch[1].trim());
                        }
                    });
                }
            });
        }
    }
    
    // ========================================
    // 4️⃣ 记忆表格（记忆总结）
    // ========================================
    if (window.Gaigai && window.Gaigai.m && Array.isArray(window.Gaigai.m.s)) {
        const memorySection = window.Gaigai.m.s.find(s => s.n === '记忆总结');
        if (memorySection && memorySection.r) {
            console.log('✅ [记忆表格] 找到', memorySection.r.length, '行');
            
            memorySection.r.forEach(row => {
                const content = row['1'] || row[1];
                if (content) {
                    allNPCInfo += content.substring(0, 500) + '\n\n';
                }
            });
        }
    }
    
    // ========================================
    // 5️⃣ 聊天记录
    // ========================================
    let chatHistory = '';
    if (context.chat && context.chat.length > 0) {
        const recent = context.chat.slice(-10);
        chatHistory = recent.map(msg => {
            const speaker = msg.is_user ? userName : charName;
            const text = msg.mes ? msg.mes.substring(0, 200) : '';
            return `${speaker}: ${text}`;
        }).join('\n');
        console.log('✅ [聊天记录] 提取', recent.length, '条');
    }
    
    // 移除主角和用户名
    extractedNames.delete(charName);
    extractedNames.delete(userName);
    
    const namesList = Array.from(extractedNames).filter(name => 
        name && name.length >= 2 && name.length <= 10
    );
    
    console.log('📊 [汇总] 提取到的人名:', namesList);
    console.log('📊 [汇总] NPC信息长度:', allNPCInfo.length, '字符');
    
    // ========================================
    // 6️⃣ 构建提示词
    // ========================================
    
    // 从 PromptManager 获取模板
    if (useTemplate && templateContent) {
        // 准备数据
        const namesListText = namesList.length > 0 
            ? namesList.map(n => `- ${n}`).join('\n') 
            : '（未识别到具体人名）';
        
        // 替换所有占位符
        const finalPrompt = templateContent
            .replace(/\{\{charName\}\}/g, charName)
            .replace(/\{\{userName\}\}/g, userName)
            .replace(/\{\{charInfo\}\}/g, charInfo)
            .replace(/\{\{userInfo\}\}/g, userInfo)
            .replace(/\{\{namesList\}\}/g, namesListText)
            .replace(/\{\{allNPCInfo\}\}/g, allNPCInfo.substring(0, 1500))
            .replace(/\{\{chatHistory\}\}/g, chatHistory || '（暂无聊天记录）');
        
        console.log('✅ 使用提示词模板，最终长度:', finalPrompt.length);
        return finalPrompt;
    }
    
    // 如果没有模板或功能禁用，返回错误
    console.error('❌ 智能加载联系人功能未启用或提示词缺失');
    throw new Error('智能加载联系人功能未启用，请在微信设置中启用');
}

// 🔧 辅助方法：判断是否可能是人名
isPossibleName(str) {
    if (!str || typeof str !== 'string') return false;
    
    const s = str.trim();
    
    // 长度检查
    if (s.length < 2 || s.length > 10) return false;
    
    // 排除系统字段
    if (this.isSystemField(s)) return false;
    
    // 排除纯数字
    if (/^\d+$/.test(s)) return false;
    
    // 排除包含特殊符号的
    if (/[【】\{\}\[\]<>\/\\]/.test(s)) return false;
    
    // 中文名字规则（2-4个汉字）
    if (/^[\u4e00-\u9fa5]{2,4}$/.test(s)) return true;
    
    // 称呼类
    if (['妈妈', '爸爸', '爷爷', '奶奶', '老师', '同学', '朋友', '同事', '老板'].includes(s)) return true;
    
    // 带姓氏的可能性更大
    const commonSurnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
    if (commonSurnames.some(surname => s.startsWith(surname))) return true;
    
    return false;
}

// 🔧 辅助方法：判断是否是系统字段
isSystemField(str) {
    if (!str) return true;
    
    const systemKeywords = [
        '时代', '天气', '地点', '年龄', '全局时间', '待办', '区域', '方位', 
        '生理', '物品', '静态', '动态', '状态', '数值', '日期', '时间',
        '服装', '服饰', '佩戴', '位置', '当前', '主角', '用户', 'NPC'
    ];
    
    return systemKeywords.some(keyword => str.includes(keyword));
}
    
// ✅ 正确的AI调用方法（使用 context.generateRaw）
async sendToAI(prompt) {
    try {
        console.log('📡 [AI调用] 开始静默调用...');
        
        const context = typeof SillyTavern !== 'undefined' && SillyTavern.getContext 
            ? SillyTavern.getContext() 
            : null;
        
        if (!context || typeof context.generateRaw !== 'function') {
            throw new Error('❌ 无法获取 SillyTavern.getContext 或 generateRaw 方法');
        }
        
        // ✅ 使用正确的对象参数格式
        const result = await context.generateRaw({
            prompt: prompt,
            quietToLoud: false,  // 🔥 关键：不显示在聊天窗口
            instructOverride: false,
            systemPrompt: '你是一个数据分析助手。严格按要求返回JSON格式数据，不要进行角色扮演。'
        });
        
        console.log('✅ [AI调用] 成功，回复长度:', result?.length || 0);
        return result;
        
    } catch (error) {
        console.error('❌ [AI调用] 失败:', error);
        throw error;
    }
}

// 🔥 新增：jQuery备用方案
async jqueryFallback(prompt) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/api/backends/chat-completions/generate',
            type: 'POST',
            data: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: '你是一个数据分析助手。严格按要求返回JSON格式数据，不要进行角色扮演。'
                    },
                    {
                        role: 'user', 
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
                stream: false,
                quiet: true
            }),
            contentType: 'application/json',
            success: function(data) {
                const result = 
                    data.choices?.[0]?.message?.content ||
                    data.response ||
                    data.message?.content ||
                    '';
                console.log('✅ jQuery方案成功');
                resolve(result);
            },
            error: function(xhr, status, error) {
                console.error('❌ jQuery方案失败:', error);
                reject(new Error(`jQuery请求失败: ${error}`));
            }
        });
    });
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

    // ========================================
    // 🆕 群聊管理（新增）
    // ========================================
    
    // 创建群聊
    createGroupChat(groupInfo) {
        const chatId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const groupChat = {
            id: chatId,
            name: groupInfo.name || '群聊',
            type: 'group',
            avatar: groupInfo.avatar || '👥',
            lastMessage: '',
            time: '刚刚',
            unread: 0,
            members: groupInfo.members || [],
            createdAt: new Date().toISOString()
        };
        
        this.data.chats.push(groupChat);
        
        // 🔥 添加系统消息：谁创建了群聊
        this.addMessage(chatId, {
            from: 'system',
            content: `你创建了群聊"${groupInfo.name}"`,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            type: 'system',
            avatar: '📢'
        });
        
        this.saveData();
        console.log('✅ 已创建群聊:', groupInfo.name);
        return groupChat;
    }
    
    // 添加群成员
    addGroupMember(chatId, memberId) {
        const chat = this.getChat(chatId);
        if (chat && chat.type === 'group') {
            if (!chat.members.includes(memberId)) {
                chat.members.push(memberId);
                this.saveData();
            }
        }
    }
    
    // 移除群成员
    removeGroupMember(chatId, memberId) {
        const chat = this.getChat(chatId);
        if (chat && chat.type === 'group') {
            chat.members = chat.members.filter(id => id !== memberId);
            this.saveData();
        }
    }    
    
// ========================================
// 🎨 自定义表情管理
// ========================================

// 获取所有自定义表情
getCustomEmojis() {
    if (!this.data.customEmojis) {
        this.data.customEmojis = [];
    }
    return this.data.customEmojis;
}

// 获取单个自定义表情
getCustomEmoji(emojiId) {
    return this.data.customEmojis?.find(e => e.id === emojiId);
}

// 添加自定义表情
addCustomEmoji(emojiData) {
    if (!this.data.customEmojis) {
        this.data.customEmojis = [];
    }
    
    const emoji = {
        id: `emoji_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: emojiData.name,
        image: emojiData.image,
        createdAt: new Date().toISOString()
    };
    
    this.data.customEmojis.push(emoji);
    this.saveData();
    
    console.log('✅ 已添加自定义表情:', emoji.name);
    return emoji;
}

// 删除自定义表情
deleteCustomEmoji(emojiId) {
    if (!this.data.customEmojis) return;
    
    this.data.customEmojis = this.data.customEmojis.filter(e => e.id !== emojiId);
    this.saveData();
    
    console.log('🗑️ 已删除自定义表情:', emojiId);
   }
}
