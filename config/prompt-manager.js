// 提示词管理器 - 核心架构
export class PromptManager {
    constructor(storage) {
        this.storage = storage;
        this.prompts = this.loadPrompts();
        this.expandedStates = {}; // 记录折叠状态
    }
    
    // 加载提示词配置
    loadPrompts() {
        const saved = this.storage.get('phone-prompts', true);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('❌ 提示词加载失败，使用默认配置');
            }
        }
        return this.getDefaultPrompts();
    }
    
    // 默认提示词（从你现有的提示词迁移）
    getDefaultPrompts() {
        return {
            // 系统核心提示词（必须启用）
            core: {
                enabled: true,
                name: '📌 核心系统规则',
                description: '手机标签格式和基础规则',
                content: `# 虚拟手机系统 - 核心规则

## 手机标签格式
所有手机相关内容必须使用 <phone> 标签包裹的 JSON 格式：

<phone>
{
  "type": "消息类型",
  "contact": "联系人",
  "messages": [],
  "notification": "通知内容"
}
</phone>

## 时间规则
- 使用24小时制
- 基于剧情时间，不是现实时间
- 多条消息递增1-2分钟`,
                order: 1
            },
            
            // 微信APP提示词
            wechat: {
                chat: {
                    enabled: true,
                    name: '💬 微信聊天',
                    description: '一对一聊天和群聊规则',
                    content: `## 微信聊天场景判断

✅ 必须使用手机标签的场景：
1. 角色明确拿出手机发消息
2. 角色和用户不在同一地点
3. 剧情描写"手机震动"、"收到消息"

⚠️ 不使用手机标签的场景：
1. 面对面对话（返回空标签）
2. 角色在用户身边

示例格式：
<phone>
{
  "type": "wechat_message",
  "contact": "联系人名",
  "avatar": "👤",
  "messages": [
    {"content": "消息内容", "time": "21:31", "type": "text"}
  ]
}
</phone>`,
                    order: 2
                },
                
                moments: {
                    enabled: false, // 默认禁用
                    name: '📸 朋友圈',
                    description: '朋友圈动态生成规则',
                    content: `## 朋友圈功能

生成朋友圈动态时使用：
<phone>
{
  "type": "wechat_moments",
  "posts": [
    {
      "author": "发布者",
      "content": "动态内容",
      "images": [],
      "likes": ["点赞者1", "点赞者2"],
      "comments": [],
      "time": "3小时前"
    }
  ]
}
</phone>`,
                    order: 3
                },
                
                call: {
                    enabled: true,
                    name: '📞 语音/视频通话',
                    description: '通话决策和对话规则',
                    content: `## 通话功能

当用户发起通话时，决定是否接听：
- 根据剧情和角色状态判断
- 可以拒绝（正在忙/不方便）
- 接听后可以有简短对话`,
                    order: 4
                },
                
                loadContacts: {
                    enabled: true,
                    name: '🤖 智能加载联系人',
                    description: '从角色卡生成联系人',
                    content: `## 智能加载联系人

根据角色卡、世界书、记忆表格生成联系人列表。
返回格式：
{
  "contacts": [
    {"name": "联系人名", "avatar": "😊", "relation": "关系"}
  ]
}`,
                    order: 5
                }
            },
            
            // 未来扩展：其他APP
            sms: {
                enabled: false,
                name: '📱 短信功能',
                content: '短信功能提示词...'
            }
        };
    }
    
    // 获取某个功能的开关状态
    isEnabled(app, feature) {
        if (app === 'core') return true; // 核心始终启用
        return this.prompts[app]?.[feature]?.enabled || false;
    }
    
    // 切换功能开关
    toggleFeature(app, feature) {
        if (app === 'core') return; // 核心不能禁用
        
        if (this.prompts[app]?.[feature]) {
            this.prompts[app][feature].enabled = !this.prompts[app][feature].enabled;
            this.savePrompts();
            console.log(`${this.prompts[app][feature].enabled ? '✅' : '❌'} ${app}.${feature} 已${this.prompts[app][feature].enabled ? '启用' : '禁用'}`);
        }
    }
    
    // 更新提示词内容
    updatePrompt(app, feature, content) {
        if (app === 'core') {
            this.prompts.core.content = content;
        } else if (this.prompts[app]?.[feature]) {
            this.prompts[app][feature].content = content;
        }
        this.savePrompts();
    }
    
    // 获取启用的提示词（发送给AI）
    getEnabledPromptsForChat() {
        const sections = [];
        
        // 1. 核心提示词
        if (this.prompts.core.enabled) {
            sections.push(this.prompts.core.content);
        }
        
        // 2. 微信聊天相关（如果启用）
        if (this.isEnabled('wechat', 'chat')) {
            sections.push(this.prompts.wechat.chat.content);
        }
        
        // 3. 朋友圈（如果启用）
        if (this.isEnabled('wechat', 'moments')) {
            sections.push(this.prompts.wechat.moments.content);
        }
        
        return sections.join('\n\n---\n\n');
    }
    
    // 获取特定功能的提示词
    getPromptForFeature(app, feature) {
        if (app === 'core') {
            return this.prompts.core.content;
        }
        return this.prompts[app]?.[feature]?.content || '';
    }
    
    // 保存配置
    savePrompts() {
        this.storage.set('phone-prompts', JSON.stringify(this.prompts), true);
        console.log('💾 提示词配置已保存');
    }
    
    // 导出配置
    exportConfig() {
        return JSON.stringify(this.prompts, null, 2);
    }
    
    // 导入配置
    importConfig(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.prompts = imported;
            this.savePrompts();
            return true;
        } catch (e) {
            console.error('❌ 配置导入失败:', e);
            return false;
        }
    }
}
