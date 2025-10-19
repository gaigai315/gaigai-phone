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
        
        // ✅ 新用户：空数据
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
    
    // 获取用户信息
    getUserInfo() {
        return this.data.userInfo;
    }
    
    updateUserInfo(info) {
        Object.assign(this.data.userInfo, info);
        this.saveData();
    }
    
    // 聊天列表
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
    
    // 消息
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
        
        // 更新聊天列表的最后消息
        const chat = this.getChat(chatId);
        if (chat) {
            chat.lastMessage = message.content || '[图片]';
            chat.time = message.time;
        }
        
        this.saveData();
    }
    
    // 联系人
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
    
    // 朋友圈
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
    
    // ✅ 智能加载联系人（从角色卡生成）
    async loadContactsFromCharacter() {
        const context = this.storage.getContext();
        
        if (!context) {
            return { success: false, message: '无法获取角色卡信息' };
        }
        
        const charName = context.name2 || '角色';
        const charAvatar = '🤖';
        const charDesc = context.description || '';
        const scenario = context.scenario || '';
        
        console.log('📖 分析角色卡:', charName);
        
        // 分析角色信息
        const info = this.analyzeCharacterInfo(charName, charDesc, scenario);
        
        // 生成联系人
        const newContacts = this.generateContactsFromInfo(info, charAvatar);
        
        // 合并到现有数据
        let addedCount = 0;
        newContacts.forEach(contact => {
            const exists = this.data.contacts.find(c => c.id === contact.id);
            if (!exists) {
                this.data.contacts.push(contact);
                addedCount++;
            }
        });
        
        // 生成初始聊天
        if (newContacts.length > 0 && addedCount > 0) {
            const mainContact = newContacts[0];
            
            const chatExists = this.data.chats.find(c => c.id === mainContact.id);
            
            if (!chatExists) {
                this.data.chats.push({
                    id: mainContact.id,
                    name: mainContact.name,
                    type: 'single',
                    avatar: mainContact.avatar,
                    lastMessage: '你好！',
                    time: '刚刚',
                    unread: 1,
                    contactId: mainContact.id
                });
                
                this.data.messages[mainContact.id] = [{
                    from: mainContact.name,
                    content: `你好！我是${mainContact.name}`,
                    time: '刚刚',
                    type: 'text',
                    avatar: mainContact.avatar
                }];
            }
        }
        
        await this.saveData();
        
        return {
            success: true,
            count: addedCount,
            contacts: newContacts
        };
    }
    
    // 分析角色信息
    analyzeCharacterInfo(name, desc, scenario) {
        const text = (desc + ' ' + scenario).toLowerCase();
        
        const info = {
            mainCharName: name,
            type: 'modern',
            relationships: []
        };
        
        // 判断背景
        if (text.includes('学校') || text.includes('学生') || text.includes('同学')) {
            info.type = 'school';
        } else if (text.includes('公司') || text.includes('同事') || text.includes('职场')) {
            info.type = 'work';
        } else if (text.includes('古代') || text.includes('皇') || text.includes('江湖')) {
            info.type = 'historical';
        } else if (text.includes('魔法') || text.includes('异世界') || text.includes('精灵')) {
            info.type = 'fantasy';
        }
        
        // 提取关系
        const patterns = {
            '妹妹': '👧', '姐姐': '👩', '哥哥': '👨', '弟弟': '👦',
            '妈妈': '👩‍🦱', '母亲': '👩‍🦱', '爸爸': '👨‍🦱', '父亲': '👨‍🦱'
        };
        
        for (const [keyword, avatar] of Object.entries(patterns)) {
            if (text.includes(keyword)) {
                info.relationships.push({ name: keyword, avatar });
            }
        }
        
        return info;
    }
    
    // 从分析结果生成联系人
    generateContactsFromInfo(info, mainAvatar) {
        const contacts = [];
        
        // 主角色
        contacts.push({
            id: 'char_main',
            name: info.mainCharName,
            avatar: mainAvatar,
            remark: '',
            letter: this.getFirstLetter(info.mainCharName)
        });
        
        // 添加关系人物
        info.relationships.forEach((rel, index) => {
            contacts.push({
                id: `rel_${index}`,
                name: rel.name,
                avatar: rel.avatar,
                remark: '',
                letter: this.getFirstLetter(rel.name)
            });
        });
        
        return contacts;
    }
    
    // 拼音首字母
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
