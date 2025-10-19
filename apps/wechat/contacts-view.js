// 通讯录视图
export class ContactsView {
    constructor(wechatApp) {
        this.app = wechatApp;
        this.searchText = '';
    }
    
    render() {
        const contacts = this.app.data.getContacts();
        const grouped = this.groupContacts(contacts);
        
        return `
            <div class="wechat-contacts">
                <!-- 搜索框 -->
                <div class="contacts-search">
                    <input type="text" placeholder="搜索" class="search-input" id="contacts-search">
                </div>
                
                <!-- 功能入口 -->
                <div class="contacts-functions">
                    <div class="function-item" data-func="new-friends">
                        <div class="function-icon" style="background: #ffa502;">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <div class="function-name">新的朋友</div>
                    </div>
                    <div class="function-item" data-func="groups">
                        <div class="function-icon" style="background: #2ed573;">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div class="function-name">群聊</div>
                    </div>
                    <div class="function-item" data-func="tags">
                        <div class="function-icon" style="background: #5f9fd8;">
                            <i class="fa-solid fa-tags"></i>
                        </div>
                        <div class="function-name">标签</div>
                    </div>
                    <div class="function-item" data-func="official">
                        <div class="function-icon" style="background: #00b894;">
                            <i class="fa-solid fa-newspaper"></i>
                        </div>
                        <div class="function-name">公众号</div>
                    </div>
                </div>
                
                <!-- 联系人列表 -->
                <div class="contacts-list">
                    ${Object.keys(grouped).sort().map(letter => `
                        <div class="contacts-group">
                            <div class="group-letter">${letter}</div>
                            ${grouped[letter].map(contact => `
                                <div class="contact-item" data-contact-id="${contact.id}">
                                    <div class="contact-avatar">
                                        ${contact.avatar || '👤'}
                                    </div>
                                    <div class="contact-name">${contact.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                
                <!-- 字母索引 -->
                <div class="letter-index">
                    ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').map(letter => `
                        <span class="letter-item" data-letter="${letter}">${letter}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    groupContacts(contacts) {
        const grouped = {};
        
        contacts.forEach(contact => {
            // 获取拼音首字母（这里简化处理）
            const firstLetter = this.getFirstLetter(contact.name);
            if (!grouped[firstLetter]) {
                grouped[firstLetter] = [];
            }
            grouped[firstLetter].push(contact);
        });
        
        return grouped;
    }
    
    getFirstLetter(name) {
        // 简单的拼音首字母获取（实际应该用拼音库）
        const letterMap = {
            '张': 'Z', '王': 'W', '李': 'L', '赵': 'Z', '刘': 'L',
            '陈': 'C', '杨': 'Y', '黄': 'H', '周': 'Z', '吴': 'W'
        };
        
        const firstChar = name[0];
        if (/[a-zA-Z]/.test(firstChar)) {
            return firstChar.toUpperCase();
        }
        return letterMap[firstChar] || '#';
    }
    
    bindEvents() {
        // 搜索
        document.getElementById('contacts-search')?.addEventListener('input', (e) => {
            this.searchText = e.target.value;
            this.filterContacts();
        });
        
        // 字母索引点击
        document.querySelectorAll('.letter-item').forEach(item => {
            item.addEventListener('click', () => {
                const letter = item.dataset.letter;
                this.scrollToLetter(letter);
            });
        });
        
        // 联系人点击
        document.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const contactId = item.dataset.contactId;
                this.openContactChat(contactId);
            });
        });
        
        // 功能入口点击
        document.querySelectorAll('.function-item').forEach(item => {
            item.addEventListener('click', () => {
                const func = item.dataset.func;
                this.handleFunction(func);
            });
        });
    }
    
    filterContacts() {
        // 实现搜索过滤
        console.log('搜索:', this.searchText);
    }
    
   scrollToLetter(letter) {
    // 滚动到指定字母
    const contactsList = document.querySelector('.contacts-list');
    const groups = document.querySelectorAll('.group-letter');
    
    for (const group of groups) {
        if (group.textContent.trim() === letter) {
            // 计算目标位置（相对于列表容器）
            const targetTop = group.offsetTop - contactsList.offsetTop;
            contactsList.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            break;
        }
    }
}
    
    openContactChat(contactId) {
    const contact = this.app.data.getContact(contactId);
    if (contact) {
        // 创建或打开聊天
        let chat = this.app.data.getChatByContactId(contactId);
        
        if (!chat) {
            chat = this.app.data.createChat({
                id: `chat_${contactId}`,
                contactId: contactId,  // ← 保留 contactId
                name: contact.name,
                type: 'single',
                avatar: contact.avatar
            });
        }
        
        // ❌ 删除自动添加欢迎消息的逻辑
        // 如果没有消息就是空的，有消息就显示已有的
        
        this.app.currentChat = chat;
        this.app.currentView = 'chats';
        this.app.render();
    }
}
    
    handleFunction(func) {
        switch (func) {
            case 'new-friends':
                this.showNewFriends();
                break;
            case 'groups':
                this.showGroups();
                break;
            case 'tags':
                this.showTags();
                break;
            case 'official':
                this.showOfficialAccounts();
                break;
        }
    }
    
    showNewFriends() {
        this.app.phoneShell.showNotification('新的朋友', '暂无新好友请求', '👥');
    }
    
    showGroups() {
        this.app.phoneShell.showNotification('群聊', '你加入了3个群聊', '👥');
    }
    
    showTags() {
        this.app.phoneShell.showNotification('标签', '管理联系人标签', '🏷️');
    }
    
    showOfficialAccounts() {
        this.app.phoneShell.showNotification('公众号', '关注的公众号列表', '📰');
    }
}
