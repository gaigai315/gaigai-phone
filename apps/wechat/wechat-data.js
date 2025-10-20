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
    moments: [],
    customEmojis: [] // ← 新增：自定义表情数组
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
    
// 🔧 构建联系人生成提示词（智能版3.0：精准提取人名）
buildContactPrompt(context) {
    const charName = context.name2 || context.name || '角色';
    const userName = context.name1 || '用户';
    
    console.log('📝 [联系人生成] 开始构建提示词...');
    
    // ========================================
    // 🎯 收集所有可能的人名
    // ========================================
    const potentialNames = new Set(); // 使用Set避免重复
    
    // ========================================
    // 1️⃣ 从角色卡提取
    // ========================================
    let charPersonality = '';
    let charScenario = '';
    
    if (context.characters && context.characterId !== undefined) {
        const char = context.characters[context.characterId];
        if (char) {
            charPersonality = char.personality || '';
            charScenario = char.scenario || '';
            
            // 🔥 使用正则提取可能的人名
            const fullText = (charPersonality + ' ' + charScenario);
            
            // 查找中文人名（2-4个字）
            const chineseNames = fullText.match(/[\u4e00-\u9fa5]{2,4}(?:老师|同学|朋友|哥|姐|弟|妹|爸|妈|叔|姨|姑|舅)/g);
            if (chineseNames) {
                chineseNames.forEach(name => {
                    const cleanName = name.replace(/(老师|同学|朋友|哥|姐|弟|妹|爸|妈|叔|姨|姑|舅)$/, '');
                    if (cleanName.length >= 2) {
                        potentialNames.add(cleanName);
                    }
                });
            }
            
            console.log('✅ [联系人生成] 角色卡信息已加载');
        }
    }
    
    // ========================================
    // 2️⃣ 从记忆表格智能提取（重点改进）
    // ========================================
    if (window.Gaigai && window.Gaigai.m && Array.isArray(window.Gaigai.m.s)) {
        console.log('🔍 [联系人生成] 开始解析记忆表格...');
        
        // 遍历所有部分
        window.Gaigai.m.s.forEach((section, sectionIdx) => {
            console.log(`  检查部分 ${sectionIdx}: ${section.n}`);
            
            if (Array.isArray(section.r) && section.r.length > 0) {
                // 获取列名（第一行的键）
                const columns = Object.keys(section.r[0] || {});
                console.log(`    列名:`, columns);
                
                // 查找可能包含人名的列
                const nameColumns = columns.filter(col => {
                    const colLower = col.toLowerCase();
                    return colLower.includes('name') || 
                           colLower.includes('名') ||
                           colLower.includes('npc') ||
                           colLower.includes('人物') ||
                           colLower.includes('角色');
                });
                
                // 遍历每一行
                section.r.forEach((row, rowIdx) => {
                    // 优先从人名列提取
                    if (nameColumns.length > 0) {
                        nameColumns.forEach(col => {
                            const value = row[col];
                            if (value && typeof value === 'string') {
                                const cleaned = value.trim();
                                if (this.isPossibleName(cleaned)) {
                                    potentialNames.add(cleaned);
                                    console.log(`    ✓ 从${col}列提取: ${cleaned}`);
                                }
                            }
                        });
                    } else {
                        // 如果没有明确的人名列，检查所有值
                        Object.entries(row).forEach(([key, value]) => {
                            if (typeof value === 'string' && value.trim()) {
                                const cleaned = value.trim();
                                // 跳过列名本身和系统字段
                                if (!this.isSystemField(key) && this.isPossibleName(cleaned)) {
                                    potentialNames.add(cleaned);
                                    console.log(`    ✓ 从${key}提取: ${cleaned}`);
                                }
                            }
                        });
                    }
                });
            }
        });
        
        console.log('✅ [联系人生成] 记忆表格解析完成');
    }
    
    // ========================================
    // 3️⃣ 从世界书提取
    // ========================================
    if (context?.worldInfoData && Array.isArray(context.worldInfoData)) {
        console.log('🔍 [联系人生成] 开始解析世界书...');
        
        context.worldInfoData.forEach(entry => {
            // 从标题提取
            if (entry.comment && this.isPossibleName(entry.comment)) {
                potentialNames.add(entry.comment.trim());
                console.log(`  ✓ 从世界书标题提取: ${entry.comment}`);
            }
            
            // 从关键词提取
            if (entry.key && Array.isArray(entry.key)) {
                entry.key.forEach(k => {
                    if (this.isPossibleName(k)) {
                        potentialNames.add(k.trim());
                        console.log(`  ✓ 从世界书关键词提取: ${k}`);
                    }
                });
            }
            
            // 从内容提取（查找明确标记的人名）
            if (entry.content) {
                // 查找"名字："或类似标记后的内容
                const namePatterns = [
                    /(?:名字|姓名|称呼|叫做|名为)[：:]\s*([^\s，。,\.]+)/g,
                    /(?:他叫|她叫|名叫)\s*([^\s，。,\.]+)/g
                ];
                
                namePatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(entry.content)) !== null) {
                        if (match[1] && this.isPossibleName(match[1])) {
                            potentialNames.add(match[1].trim());
                            console.log(`  ✓ 从世界书内容提取: ${match[1]}`);
                        }
                    }
                });
            }
        });
        
        console.log('✅ [联系人生成] 世界书解析完成');
    }
    
    // ========================================
    // 4️⃣ 从聊天记录提取
    // ========================================
    if (context.chat && Array.isArray(context.chat)) {
        console.log('🔍 [联系人生成] 开始解析聊天记录...');
        
        context.chat.slice(-50).forEach(msg => {
            if (msg.mes) {
                // 查找对话中提到的人
                const patterns = [
                    /(?:和|跟|与|给|找|叫|喊)([^\s，。,\.]{2,4})(?:说|讲|聊|玩)/g,
                    /([^\s，。,\.]{2,4})(?:老师|同学|朋友)/g
                ];
                
                patterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(msg.mes)) !== null) {
                        if (match[1] && this.isPossibleName(match[1])) {
                            potentialNames.add(match[1].trim());
                        }
                    }
                });
            }
        });
        
        console.log('✅ [联系人生成] 聊天记录解析完成');
    }
    
    // ========================================
    // 5️⃣ 过滤并整理人名
    // ========================================
    
    // 移除主角和用户名
    potentialNames.delete(charName);
    potentialNames.delete(userName);
    
    // 转换为数组
    const validNames = Array.from(potentialNames).filter(name => {
        return name && 
               name.length >= 2 && 
               name.length <= 10 &&
               !this.isSystemField(name);
    });
    
    console.log('📊 [联系人生成] 最终提取到的人名:', validNames);
    
    // ========================================
    // 6️⃣ 构建提示词
    // ========================================
    return `你是一个微信联系人生成助手。

# 角色信息
- 主角色：${charName}
- 用户：${userName}

# 已识别的相关人物
${validNames.length > 0 ? validNames.map(n => `- ${n}`).join('\n') : '（未识别到具体人物）'}

# 角色背景（参考）
${charPersonality ? charPersonality.substring(0, 300) + '...' : '无'}

# 任务
生成5-10个微信联系人列表。

# 规则
1. 第一个联系人必须是"${charName}"
2. 如果上面有"已识别的相关人物"，优先使用这些名字
3. 如果人物不够，根据角色背景添加合理的联系人（如：同学、同事、家人）
4. 如果没有任何信息，使用通用中文名字（如：张伟、李娜、王强、陈静）

# ⚠️ 禁止使用
不要把这些当成人名：时代、天气、地点、全局时间、待办、区域、方位、生理、物品、静态、动态、年龄、日期、状态

# 输出JSON格式
\`\`\`json
{
  "contacts": [
    {
      "name": "${charName}",
      "avatar": "⭐",
      "relation": "主角",
      "remark": ""
    },
    {
      "name": "真实的人名",
      "avatar": "👨或👩",
      "relation": "关系类型",
      "remark": "备注"
    }
  ],
  "groups": [
    {
      "name": "群名",
      "avatar": "👥",
      "members": ["成员1", "成员2", "${charName}"]
    }
  ]
}
\`\`\``;
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

// 🔥 智能检测API类型（修复版）
detectAPIType(context) {
    // 🔑 关键修复：正确获取选中的API类型
    let main_api = document.getElementById('main_api')?.value;
    
    console.log('🔍 [联系人生成] 当前选择的API:', main_api);
    
    // 如果没有获取到，尝试从全局变量获取
    if (!main_api && typeof window.main_api === 'string') {
        main_api = window.main_api;
    }
    
    // 如果还是没有，尝试从context获取
    if (!main_api && context?.main_api) {
        main_api = context.main_api;
    }
    
    // 根据API类型返回
    if (main_api === 'openai') {
        console.log('✅ [联系人生成] 使用OpenAI兼容接口');
        return 'openai';
    } else if (main_api === 'claude') {
        console.log('✅ [联系人生成] 使用Claude');
        return 'claude';
    } else if (main_api === 'textgenerationwebui' || main_api === 'kobold' || main_api === 'ooba') {
        console.log('✅ [联系人生成] 使用TextGen');
        return 'textgen';
    }
    
    // 兜底检测：检查配置
    if (window.oai_settings?.reverse_proxy || window.oai_settings?.api_url_scale) {
        console.log('✅ [联系人生成] 检测到OpenAI兼容配置（反向代理）');
        return 'openai';
    }
    
    console.warn('⚠️ [联系人生成] 无法确定API类型，默认使用OpenAI');
    return 'openai';
}
    
// 📤 调用酒馆的生成API（适配新版酒馆）
async sendToAI(prompt) {
    try {
        console.log('🚀 [手机AI调用] 开始静默调用...');
        
        // 获取上下文
        const context = typeof SillyTavern !== 'undefined' && SillyTavern.getContext 
            ? SillyTavern.getContext() 
            : null;
        
        if (!context) {
            throw new Error('无法获取SillyTavern上下文，请确保在聊天界面');
        }
        
        // ========================================
        // 🔥 使用 context.generate（新版酒馆标准方法）
        // ========================================
        if (typeof context.generate === 'function') {
            console.log('📡 使用 context.generate（新版酒馆）...');
            
            try {
                // 调用静默生成
                const response = await context.generate(prompt, {
                    quiet: true,           // 静默模式
                    quietToLoud: false,    // 不转为正常消息
                    skipWIAN: false,       // 不跳过世界书
                    force_name2: false,    // 不强制角色名
                    isQuiet: true          // 额外的静默标记
                });
                
                console.log('✅ [手机AI调用] 成功，回复长度:', response?.length || 0);
                return response || '';
                
            } catch (genError) {
                console.warn('⚠️ context.generate 失败，尝试备用方案:', genError.message);
                
                // 🔧 备用方案：临时消息法
                return await this.fallbackGenerate(context, prompt);
            }
        }
        
        // 如果连 context.generate 都没有，抛出错误
        throw new Error('当前酒馆版本不支持AI生成，请更新到最新版');
        
    } catch (error) {
        console.error('❌ [手机AI调用] 失败:', error);
        
        // 🎯 友好的错误提示
        if (error.message.includes('上下文')) {
            throw new Error('请先选择一个角色并开始聊天');
        } else if (error.message.includes('不支持')) {
            throw new Error(error.message);
        } else {
            throw new Error('AI调用失败: ' + error.message);
        }
    }
}

// 🔧 备用生成方法（当 context.generate 失败时使用）
async fallbackGenerate(context, prompt) {
    console.log('📡 使用备用方案：临时消息法...');
    
    if (!context.chat || !Array.isArray(context.chat)) {
        throw new Error('当前没有活跃的聊天，请先发送一条消息');
    }
    
    // 保存当前聊天长度
    const originalLength = context.chat.length;
    
    // 添加临时用户消息
    const tempMessage = {
        name: context.name1 || '用户',
        is_user: true,
        mes: prompt,
        send_date: Date.now(),
        extra: {
            isQuiet: true,
            isTemporary: true
        }
    };
    
    context.chat.push(tempMessage);
    
    try {
        // 等待AI回复
        const aiResponse = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('AI生成超时（30秒）'));
            }, 30000);
            
            let checkCount = 0;
            const maxChecks = 300; // 最多检查30秒
            
            const checkForReply = () => {
                checkCount++;
                
                // 检查是否有新消息
                if (context.chat.length > originalLength + 1) {
                    const lastMsg = context.chat[context.chat.length - 1];
                    
                    // 确认是AI的回复
                    if (!lastMsg.is_user) {
                        clearTimeout(timeout);
                        
                        // 提取回复内容
                        const reply = lastMsg.mes || lastMsg.swipes?.[lastMsg.swipe_id || 0] || '';
                        
                        // 🔥 立即删除临时消息（用户消息 + AI回复）
                        context.chat.splice(originalLength, 2);
                        
                        resolve(reply);
                        return;
                    }
                }
                
                // 超过最大检查次数
                if (checkCount >= maxChecks) {
                    clearTimeout(timeout);
                    reject(new Error('AI生成超时'));
                    return;
                }
                
                // 继续检查
                setTimeout(checkForReply, 100);
            };
            
            // 🔥 触发AI生成（调用 context.generate）
            context.generate().catch(reject);
            
            // 延迟开始检查（给AI一点反应时间）
            setTimeout(checkForReply, 500);
        });
        
        console.log('✅ [备用方案] 生成成功');
        return aiResponse;
        
    } catch (error) {
        // 🧹 清理：如果失败，删除临时消息
        if (context.chat.length > originalLength) {
            context.chat.splice(originalLength);
        }
        
        throw error;
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
