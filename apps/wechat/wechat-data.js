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
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('加载微信数据失败:', e);
        }
        
        // 根据角色动态生成数据
        return this.generateDataForCharacter();
    }
    
    getStorageKey() {
        const context = this.storage.getContext();
        const charId = context?.characterId || 'default';
        const chatId = context?.chatId || 'default';
        return `${this.storageKey}_${charId}_${chatId}`;
    }
    
    generateDataForCharacter() {
        const context = this.storage.getContext();
        const charName = context?.name2 || context?.characterId || 'AI助手';
        const charPersonality = context?.description || '';
        const scenario = context?.scenario || '';
        const charAvatar = context?.avatar || '🤖';
        
        // 分析角色信息
        const characterInfo = this.analyzeCharacter(charName, charPersonality, scenario);
        characterInfo.avatar = this.getCharacterEmoji(characterInfo);
        
        // 生成数据
        const contacts = this.generateContacts(characterInfo);
        const chats = this.generateChats(characterInfo, contacts);
        const messages = this.generateMessages(characterInfo, chats);
        const moments = this.generateMoments(characterInfo, contacts);
        
        return {
            userInfo: {
                name: '我',
                wxid: 'wxid_' + Math.random().toString(36).substr(2, 9),
                avatar: '😊',
                coverImage: null
            },
            chats: chats,
            contacts: contacts,
            messages: messages,
            moments: moments
        };
    }
    
    analyzeCharacter(name, personality, scenario) {
        const info = {
            name: name,
            type: 'modern',
            age: 'adult',
            occupation: '',
            relationships: [],
            interests: [],
            avatar: '🤖'
        };
        
        const text = (personality + ' ' + scenario).toLowerCase();
        
        // 判断时代背景和类型
        if (text.includes('学校') || text.includes('学生') || text.includes('同学') || 
            text.includes('校园') || text.includes('教室') || text.includes('班级')) {
            info.type = 'school';
            info.age = 'teen';
            info.occupation = '学生';
        } else if (text.includes('公司') || text.includes('同事') || text.includes('上班') || 
                   text.includes('工作') || text.includes('职场') || text.includes('办公')) {
            info.type = 'work';
            info.age = 'adult';
            info.occupation = '职员';
        } else if (text.includes('古代') || text.includes('王朝') || text.includes('皇') || 
                   text.includes('侠') || text.includes('武林') || text.includes('江湖')) {
            info.type = 'historical';
        } else if (text.includes('魔法') || text.includes('异世界') || text.includes('精灵') || 
                   text.includes('龙') || text.includes('魔王') || text.includes('冒险')) {
            info.type = 'fantasy';
        }
        
        // 提取关系
        if (text.includes('妹妹') || text.includes('妹')) {
            info.relationships.push({ type: 'sister', name: '妹妹', avatar: '👧' });
        }
        if (text.includes('姐姐') || text.includes('姐')) {
            info.relationships.push({ type: 'sister', name: '姐姐', avatar: '👩' });
        }
        if (text.includes('哥哥') || text.includes('兄')) {
            info.relationships.push({ type: 'brother', name: '哥哥', avatar: '👨' });
        }
        if (text.includes('弟弟')) {
            info.relationships.push({ type: 'brother', name: '弟弟', avatar: '👦' });
        }
        if (text.includes('母亲') || text.includes('妈妈')) {
            info.relationships.push({ type: 'mother', name: '妈妈', avatar: '👩‍🦱' });
        }
        if (text.includes('父亲') || text.includes('爸爸')) {
            info.relationships.push({ type: 'father', name: '爸爸', avatar: '👨‍🦱' });
        }
        
        return info;
    }
    
    getCharacterEmoji(info) {
        // 根据角色类型返回合适的emoji
        if (info.type === 'fantasy') {
            const emojis = ['🧙‍♀️', '🧚‍♀️', '🧝‍♀️', '🦄', '🐉', '⚔️'];
            return emojis[Math.floor(Math.random() * emojis.length)];
        } else if (info.type === 'historical') {
            return '🏯';
        } else if (info.type === 'school') {
            return info.age === 'teen' ? '👨‍🎓' : '👨‍🏫';
        } else if (info.type === 'work') {
            return '👔';
        }
        return '🌟';
    }
    
    generateContacts(info) {
        const contacts = [];
        
        // 添加主角色
        contacts.push({
            id: 'char_main',
            name: info.name,
            avatar: info.avatar,
            letter: this.getFirstLetter(info.name)
        });
        
        // 添加关系人物
        info.relationships.forEach((rel, index) => {
            contacts.push({
                id: `rel_${index}`,
                name: rel.name,
                avatar: rel.avatar,
                letter: this.getFirstLetter(rel.name)
            });
        });
        
        // 根据背景添加其他联系人
        if (info.type === 'school') {
            contacts.push(
                { id: 'classmate1', name: '班长小李', avatar: '👨‍🎓', letter: 'B' },
                { id: 'classmate2', name: '同桌小美', avatar: '👩‍🎓', letter: 'T' },
                { id: 'teacher1', name: '王老师', avatar: '👨‍🏫', letter: 'W' },
                { id: 'friend1', name: '死党阿强', avatar: '😎', letter: 'S' },
                { id: 'friend2', name: '学霸小陈', avatar: '🤓', letter: 'X' }
            );
        } else if (info.type === 'work') {
            contacts.push(
                { id: 'boss', name: '李总', avatar: '👔', letter: 'L' },
                { id: 'colleague1', name: '同事小张', avatar: '👨‍💼', letter: 'T' },
                { id: 'colleague2', name: '同事小王', avatar: '👩‍💼', letter: 'T' },
                { id: 'hr', name: 'HR小刘', avatar: '👩‍💼', letter: 'H' },
                { id: 'client1', name: '客户赵总', avatar: '🤵', letter: 'K' }
            );
        } else if (info.type === 'fantasy') {
            contacts.push(
                { id: 'wizard', name: '大法师', avatar: '🧙‍♂️', letter: 'D' },
                { id: 'elf', name: '精灵公主', avatar: '🧚‍♀️', letter: 'J' },
                { id: 'warrior', name: '战士罗兰', avatar: '⚔️', letter: 'Z' },
                { id: 'merchant', name: '商人哈克', avatar: '💰', letter: 'S' }
            );
        } else if (info.type === 'historical') {
            contacts.push(
                { id: 'servant', name: '小翠', avatar: '👘', letter: 'X' },
                { id: 'guard', name: '侍卫长', avatar: '🗡️', letter: 'S' },
                { id: 'doctor', name: '华太医', avatar: '👨‍⚕️', letter: 'H' }
            );
        } else {
            // 现代背景
            contacts.push(
                { id: 'friend1', name: '好友小明', avatar: '😊', letter: 'H' },
                { id: 'friend2', name: '闺蜜小红', avatar: '👩', letter: 'G' },
                { id: 'neighbor', name: '邻居王姐', avatar: '👩‍🦰', letter: 'L' },
                { id: 'delivery', name: '外卖小哥', avatar: '🛵', letter: 'W' }
            );
        }
        
        return contacts;
    }
    
    generateChats(info, contacts) {
        const chats = [];
        
        // 主角色聊天（置顶）
        chats.push({
            id: 'char_main',
            name: info.name,
            type: 'single',
            avatar: info.avatar,
            lastMessage: this.getGreetingMessage(info),
            time: '刚刚',
            unread: 2,
            contactId: 'char_main'
        });
        
        // 家人聊天
        info.relationships.forEach((rel, index) => {
            if (rel.type === 'mother' || rel.type === 'father' || rel.type === 'sister' || rel.type === 'brother') {
                chats.push({
                    id: `rel_${index}`,
                    name: rel.name,
                    type: 'single',
                    avatar: rel.avatar,
                    lastMessage: this.getFamilyMessage(rel.type),
                    time: '上午',
                    unread: 0,
                    contactId: `rel_${index}`
                });
            }
        });
        
        // 群聊
        if (info.type === 'school') {
            chats.push({
                id: 'class_group',
                name: '高三(2)班群',
                type: 'group',
                avatar: '🎓',
                lastMessage: '班长: 明天记得交作业',
                time: '昨天',
                unread: 15,
                members: ['班长', '同桌', '我', '其他35人']
            });
            chats.push({
                id: 'study_group',
                name: '学习小组',
                type: 'group',
                avatar: '📚',
                lastMessage: '学霸: 这道题怎么解？',
                time: '下午',
                unread: 3,
                members: ['学霸', '同桌', '我', '班长']
            });
        } else if (info.type === 'work') {
            chats.push({
                id: 'work_group',
                name: '项目组',
                type: 'group',
                avatar: '💼',
                lastMessage: '李总: 明天上午开会',
                time: '下午5:30',
                unread: 3,
                members: ['李总', '小张', '小王', '我']
            });
            chats.push({
                id: 'dept_group',
                name: '部门群',
                type: 'group',
                avatar: '🏢',
                lastMessage: 'HR: 本月考勤统计',
                time: '上午',
                unread: 0,
                members: ['HR', '同事们', '我']
            });
        } else if (info.type === 'fantasy') {
            chats.push({
                id: 'adventure_group',
                name: '冒险者公会',
                type: 'group',
                avatar: '⚔️',
                lastMessage: '会长: 新的任务发布了',
                time: '昨天',
                unread: 5,
                members: ['会长', '大法师', '战士', '我']
            });
        }
        
        // 添加一些其他聊天
        if (contacts.length > 3) {
            chats.push({
                id: contacts[2].id,
                name: contacts[2].name,
                type: 'single',
                avatar: contacts[2].avatar,
                lastMessage: '在吗？',
                time: '昨天',
                unread: 0,
                contactId: contacts[2].id
            });
        }
        
        return chats;
    }
    
    generateMessages(info, chats) {
        const messages = {};
        
        // 主角色的对话
        messages['char_main'] = [
            {
                from: info.name,
                content: '你好啊！',
                time: '10:00',
                type: 'text',
                avatar: info.avatar
            },
            {
                from: 'me',
                content: '你好！最近怎么样？',
                time: '10:01',
                type: 'text',
                avatar: '😊'
            },
            {
                from: info.name,
                content: this.getGreetingMessage(info),
                time: '10:05',
                type: 'text',
                avatar: info.avatar
            }
        ];
        
        // 为其他聊天生成消息
        chats.forEach(chat => {
            if (chat.id !== 'char_main' && !messages[chat.id]) {
                messages[chat.id] = [
                    {
                        from: chat.name,
                        content: chat.lastMessage.includes(':') ? 
                            chat.lastMessage.split(':')[1].trim() : 
                            chat.lastMessage,
                        time: chat.time,
                        type: 'text',
                        avatar: chat.avatar
                    }
                ];
            }
        });
        
        return messages;
    }
    
    generateMoments(info, contacts) {
        const moments = [];
        
        // 角色发的朋友圈
        moments.push({
            id: '1',
            name: info.name,
            avatar: info.avatar,
            text: this.generateMomentText(info),
            images: [],
            time: '2小时前',
            likes: 5,
            comments: 2,
            liked: true,
            likeList: ['我', contacts[1]?.name || '朋友'],
            commentList: [
                { name: '我', text: '真不错！' },
                { name: contacts[1]?.name || '朋友', text: '赞同！' }
            ]
        });
        
        // 其他人的朋友圈
        if (contacts.length > 2) {
            moments.push({
                id: '2',
                name: contacts[1].name,
                avatar: contacts[1].avatar,
                text: this.generateRandomMoment(info.type),
                images: [],
                time: '5小时前',
                likes: 3,
                comments: 1,
                liked: false,
                likeList: [contacts[2]?.name || '某人'],
                commentList: []
            });
            
            moments.push({
                id: '3',
                name: contacts[2].name,
                avatar: contacts[2].avatar,
                text: this.getTimeBasedMoment(),
                images: [],
                time: '昨天',
                likes: 8,
                comments: 0,
                liked: false,
                likeList: [],
                commentList: []
            });
        }
        
        return moments;
    }
    
    getGreetingMessage(info) {
        const greetings = {
            'school': ['在写作业吗？', '今天的课听懂了吗？', '一起去图书馆？'],
            'work': ['项目进度怎么样？', '下班一起吃饭？', '明天的会议准备了吗？'],
            'fantasy': ['有新的任务了', '发现了一个宝藏地点', '魔力水晶在发光'],
            'historical': ['今日可有空闲？', '听闻城中有趣事', '请安'],
            'modern': ['在吗？有点事', '最近好吗？', '有空聊聊吗？']
        };
        
        const messages = greetings[info.type] || greetings['modern'];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    getFamilyMessage(type) {
        const messages = {
            'mother': '记得按时吃饭',
            'father': '最近工作怎么样？',
            'sister': '借我点钱呗',
            'brother': '周末一起打游戏'
        };
        return messages[type] || '在吗？';
    }
    
    generateMomentText(info) {
        const templates = {
            'school': [
                '今天的课好难啊😭',
                '终于放学了！开心～',
                '准备期末考试中...',
                '青春就是要努力！'
            ],
            'work': [
                '又是充实的一天',
                '项目终于完成了！撒花🎉',
                '努力工作，认真生活',
                '周末终于来了！'
            ],
            'fantasy': [
                '今天的冒险很精彩',
                '发现了新的魔法咒语',
                '公会的大家都很友善',
                '这个世界真奇妙'
            ],
            'historical': [
                '今日天气甚好',
                '品茶赏花，悠然自得',
                '江湖路远，珍重',
                '春光正好'
            ],
            'modern': [
                '生活需要仪式感',
                '今天天气真不错',
                '分享今天的美好',
                '愿一切安好'
            ]
        };
        
        const texts = templates[info.type] || templates['modern'];
        return texts[Math.floor(Math.random() * texts.length)];
    }
    
    generateRandomMoment(type) {
        const moments = {
            'school': '马上就要考试了，大家加油！💪',
            'work': '周末加班，累but充实',
            'fantasy': '今天遇到了传说中的巨龙！',
            'historical': '梅花开了，真美',
            'modern': '打卡网红餐厅～好吃😋'
        };
        return moments[type] || moments['modern'];
    }
    
    getTimeBasedMoment() {
        const hour = new Date().getHours();
        if (hour < 6) return '熬夜对身体不好，早点休息';
        if (hour < 12) return '美好的一天从早餐开始';
        if (hour < 14) return '午餐时间到！';
        if (hour < 18) return '下午茶时间☕';
        if (hour < 22) return '晚上好，今天过得怎么样？';
        return '夜深了，晚安💤';
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
    
    // 保存数据
    async saveData() {
    try {
        const key = this.getStorageKey();
        await this.storage.set(key, JSON.stringify(this.data), false);
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
}
