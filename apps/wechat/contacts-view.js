// 通讯录视图
export class ContactsView {
    constructor(wechatApp) {
        this.app = wechatApp;
        this.searchText = '';
    }
    
    render() {
        const contacts = this.app.wechatData.getContacts();  // ← 改这里
        const grouped = this.groupContacts(contacts);
        
        return `
            <div class="wechat-contacts">
                <div class="contacts-search">
                    <input type="text" class="search-input" placeholder="搜索" />
                </div>
                
                <!-- 🔥 可滚动内容区 -->
                <div class="contacts-scrollable">
                    <!-- 功能入口 -->
                    <div class="contacts-functions">
                        <div class="function-item" data-func="new-friends">
                            <div class="function-icon" style="background: linear-gradient(135deg, #ff6b6b, #ee5a6f);">
                                <i class="fa-solid fa-user-plus"></i>
                            </div>
                            <div class="function-name">新的朋友</div>
                        </div>
                        <div class="function-item" data-func="groups">
                            <div class="function-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
                                <i class="fa-solid fa-users"></i>
                            </div>
                            <div class="function-name">群聊</div>
                        </div>
                        <div class="function-item" data-func="tags">
                            <div class="function-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
                                <i class="fa-solid fa-tag"></i>
                            </div>
                            <div class="function-name">标签</div>
                        </div>
                        <div class="function-item" data-func="official">
                            <div class="function-icon" style="background: linear-gradient(135deg, #fa709a, #fee140);">
                                <i class="fa-solid fa-bullhorn"></i>
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
                </div>
                
                <!-- ✅ 字母索引移到外面，成为固定元素 -->
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
        document.querySelector('.search-input')?.addEventListener('input', (e) => {
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
        const contact = this.app.wechatData.getContact(contactId);  // ← 改这里
        if (contact) {
            // 创建或打开聊天
            let chat = this.app.wechatData.getChatByContactId(contactId);  // ← 改这里
            
            if (!chat) {
                chat = this.app.wechatData.createChat({  // ← 改这里
                    id: `chat_${contactId}`,
                    contactId: contactId,
                    name: contact.name,
                    type: 'single',
                    avatar: contact.avatar
                });
            }
            
            this.app.currentChat = chat;
            this.app.currentView = 'chats';
            this.app.render();
        }
    }
    
       handleFunction(func) {
        switch (func) {
            case 'new-friends':
                this.showAddFriendPage();
                break;
            case 'groups':
                this.showCreateGroupPage();
                break;
            case 'tags':
                this.showTags();
                break;
            case 'official':
                this.showOfficialAccounts();
                break;
        }
    }
    
    showTags() {
        this.app.phoneShell.showNotification('标签', '管理联系人标签', '🏷️');
    }
    
    showOfficialAccounts() {
        this.app.phoneShell.showNotification('公众号', '关注的公众号列表', '📰');
    }

    // ========================================
    // 🆕 手动添加好友（完整界面）
    // ========================================
    showAddFriendPage() {
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-add-friend">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">添加好友</div>
                    <div class="wechat-header-right"></div>
                </div>
                
                <div class="wechat-content" style="background: #ededed; padding: 20px;">
                    <div style="background: #fff; border-radius: 12px; padding: 25px; margin-bottom: 15px;">
                        <div style="font-size: 14px; color: #999; margin-bottom: 15px;">
                            <i class="fa-solid fa-user-plus"></i> 填写好友信息
                        </div>
                        
                        <!-- 头像选择 -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div id="friend-avatar-preview" style="
                                width: 80px;
                                height: 80px;
                                border-radius: 10px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                margin: 0 auto 12px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 40px;
                                cursor: pointer;
                            ">👤</div>
                            <input type="file" id="friend-avatar-upload" accept="image/*" style="display: none;">
                            <button id="upload-friend-avatar" style="
                                padding: 8px 16px;
                                background: #f0f0f0;
                                border: none;
                                border-radius: 6px;
                                font-size: 13px;
                                cursor: pointer;
                            ">
                                <i class="fa-solid fa-camera"></i> 选择头像
                            </button>
                        </div>
                        
                        <!-- 姓名 -->
                        <div style="margin-bottom: 15px;">
                            <div style="font-size: 13px; color: #999; margin-bottom: 8px;">好友昵称 *</div>
                            <input type="text" id="friend-name-input" placeholder="输入好友昵称" maxlength="20" style="
                                width: 100%;
                                padding: 12px;
                                border: 1.5px solid #e5e5e5;
                                border-radius: 8px;
                                font-size: 15px;
                                box-sizing: border-box;
                            ">
                        </div>
                        
                        <!-- 备注 -->
                        <div style="margin-bottom: 15px;">
                            <div style="font-size: 13px; color: #999; margin-bottom: 8px;">备注名</div>
                            <input type="text" id="friend-remark-input" placeholder="可选" maxlength="20" style="
                                width: 100%;
                                padding: 12px;
                                border: 1.5px solid #e5e5e5;
                                border-radius: 8px;
                                font-size: 15px;
                                box-sizing: border-box;
                            ">
                        </div>
                        
                        <!-- 关系 -->
                        <div style="margin-bottom: 15px;">
                            <div style="font-size: 13px; color: #999; margin-bottom: 8px;">关系/身份</div>
                            <input type="text" id="friend-relation-input" placeholder="如：朋友、同事、家人" maxlength="20" style="
                                width: 100%;
                                padding: 12px;
                                border: 1.5px solid #e5e5e5;
                                border-radius: 8px;
                                font-size: 15px;
                                box-sizing: border-box;
                            ">
                        </div>
                    </div>
                    
                    <button id="save-friend-btn" style="
                        width: 100%;
                        padding: 14px;
                        background: #07c160;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                    ">添加好友</button>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        let selectedAvatar = '👤';
        
        // 返回
        document.getElementById('back-from-add-friend')?.addEventListener('click', () => {
            this.app.currentView = 'contacts';
            this.app.render();
        });
        
        // 上传头像
        document.getElementById('upload-friend-avatar')?.addEventListener('click', () => {
            document.getElementById('friend-avatar-upload').click();
        });
        
        document.getElementById('friend-avatar-upload')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    this.app.phoneShell.showNotification('提示', '图片太大，请选择小于2MB的图片', '⚠️');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    selectedAvatar = e.target.result;
                    const preview = document.getElementById('friend-avatar-preview');
                    preview.innerHTML = `<img src="${selectedAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 保存好友
        document.getElementById('save-friend-btn')?.addEventListener('click', () => {
            const name = document.getElementById('friend-name-input').value.trim();
            const remark = document.getElementById('friend-remark-input').value.trim();
            const relation = document.getElementById('friend-relation-input').value.trim();
            
            if (!name) {
                this.app.phoneShell.showNotification('提示', '请输入好友昵称', '⚠️');
                return;
            }
            
            // 检查是否已存在
            const exists = this.app.wechatData.getContacts().find(c => c.name === name);
            if (exists) {
                this.app.phoneShell.showNotification('提示', '该好友已存在', '⚠️');
                return;
            }
            
            // 添加联系人
            this.app.wechatData.addContact({
                id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                avatar: selectedAvatar,
                remark: remark,
                relation: relation,
                letter: this.app.wechatData.getFirstLetter(name)
            });
            
            this.app.phoneShell.showNotification('添加成功', `已添加好友：${name}`, '✅');
            
            setTimeout(() => {
                this.app.currentView = 'contacts';
                this.app.render();
            }, 1000);
        });
    }
    
    // ========================================
    // 🆕 发起群聊（完整界面）
    // ========================================
    showCreateGroupPage() {
        const contacts = this.app.wechatData.getContacts();
        
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-create-group">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">
                        选择联系人 (<span id="selected-count">0</span>)
                    </div>
                    <div class="wechat-header-right">
                        <button class="wechat-header-btn" id="create-group-btn" style="color: #07c160; font-size: 14px; font-weight: 500;">
                            创建
                        </button>
                    </div>
                </div>
                
                <div class="wechat-content" style="background: #ededed;">
                    <!-- 已选择的成员 -->
                    <div id="selected-members" style="
                        background: #fff;
                        padding: 12px 15px;
                        border-bottom: 0.5px solid #e5e5e5;
                        display: none;
                        flex-wrap: wrap;
                        gap: 10px;
                    "></div>
                    
                    <!-- 联系人列表 -->
                    <div style="background: #fff; padding: 10px 0;">
                        ${contacts.map(contact => `
                            <div class="group-contact-item" data-contact-id="${contact.id}" style="
                                display: flex;
                                align-items: center;
                                padding: 10px 15px;
                                cursor: pointer;
                                transition: background 0.2s;
                            ">
                                <input type="checkbox" class="contact-checkbox" data-contact-name="${contact.name}" data-contact-avatar="${contact.avatar || '👤'}" style="
                                    width: 20px;
                                    height: 20px;
                                    margin-right: 12px;
                                    cursor: pointer;
                                ">
                                <div style="
                                    width: 44px;
                                    height: 44px;
                                    border-radius: 6px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 22px;
                                    margin-right: 12px;
                                ">${contact.avatar || '👤'}</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 16px; color: #000;">${contact.name}</div>
                                    ${contact.relation ? `<div style="font-size: 12px; color: #999;">${contact.relation}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        const selectedMembers = new Map(); // name -> avatar
        
        // 返回
        document.getElementById('back-from-create-group')?.addEventListener('click', () => {
            this.app.currentView = 'contacts';
            this.app.render();
        });
        
        // 勾选联系人
        document.querySelectorAll('.contact-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const name = e.target.dataset.contactName;
                const avatar = e.target.dataset.contactAvatar;
                
                if (e.target.checked) {
                    selectedMembers.set(name, avatar);
                } else {
                    selectedMembers.delete(name);
                }
                
                updateSelectedUI();
            });
        });
        
        // 更新已选择UI
        function updateSelectedUI() {
            const countSpan = document.getElementById('selected-count');
            const selectedDiv = document.getElementById('selected-members');
            
            countSpan.textContent = selectedMembers.size;
            
            if (selectedMembers.size > 0) {
                selectedDiv.style.display = 'flex';
                selectedDiv.innerHTML = Array.from(selectedMembers.entries()).map(([name, avatar]) => `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 60px;
                    ">
                        <div style="
                            width: 48px;
                            height: 48px;
                            border-radius: 6px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            margin-bottom: 4px;
                        ">${avatar}</div>
                        <div style="font-size: 11px; color: #666; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px;">
                            ${name}
                        </div>
                    </div>
                `).join('');
            } else {
                selectedDiv.style.display = 'none';
            }
        }
        
        // 创建群聊
        document.getElementById('create-group-btn')?.addEventListener('click', () => {
            if (selectedMembers.size === 0) {
                this.app.phoneShell.showNotification('提示', '请至少选择1个联系人', '⚠️');
                return;
            }
            
            this.showGroupNameInput(Array.from(selectedMembers.entries()));
        });
    }
    
    // 输入群名称
    showGroupNameInput(members) {
        const defaultName = members.slice(0, 3).map(([name]) => name).join('、') + (members.length > 3 ? '...' : '');
        
        const html = `
            <div class="wechat-app">
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="back-from-group-name">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">设置群聊名称</div>
                    <div class="wechat-header-right"></div>
                </div>
                
                <div class="wechat-content" style="background: #ededed; padding: 20px;">
                    <div style="background: #fff; border-radius: 12px; padding: 25px;">
                        <div style="font-size: 14px; color: #999; margin-bottom: 12px;">群聊名称</div>
                        <input type="text" id="group-name-input" placeholder="输入群聊名称" 
                               value="${defaultName}" maxlength="30" style="
                            width: 100%;
                            padding: 12px;
                            border: 1.5px solid #e5e5e5;
                            border-radius: 8px;
                            font-size: 15px;
                            box-sizing: border-box;
                            margin-bottom: 15px;
                        ">
                        
                        <div style="font-size: 12px; color: #999; margin-bottom: 20px;">
                            成员：${members.map(([name]) => name).join('、')} (共${members.length}人)
                        </div>
                        
                        <button id="confirm-create-group" style="
                            width: 100%;
                            padding: 14px;
                            background: #07c160;
                            color: #fff;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 500;
                            cursor: pointer;
                        ">创建群聊</button>
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        
        document.getElementById('back-from-group-name')?.addEventListener('click', () => {
            this.showCreateGroupPage();
        });
        
        document.getElementById('confirm-create-group')?.addEventListener('click', () => {
            const groupName = document.getElementById('group-name-input').value.trim();
            
            if (!groupName) {
                this.app.phoneShell.showNotification('提示', '请输入群聊名称', '⚠️');
                return;
            }
            
            // 创建群聊
            const group = this.app.wechatData.createGroupChat({
                name: groupName,
                avatar: '👥',
                members: members.map(([name]) => name)
            });
            
            this.app.phoneShell.showNotification('创建成功', `已创建群聊：${groupName}`, '✅');
            
            setTimeout(() => {
                // 打开群聊
                this.app.currentChat = group;
                this.app.currentView = 'chats';
                this.app.render();
            }, 1000);
        });
    }
