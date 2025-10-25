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
        description: '三种聊天模式的完整规则',
        content: `# 📱 微信聊天系统 - 三种模式

## 🔴 核心原则
1. 双轨制：手机消息和面对面对话分开处理
2. 情境感知：根据剧情场景决定是否使用手机
3. 自然融入：手机使用符合角色性格和情境

---

## 🔵 模式1：手机聊天模式（用户在手机上）

**识别标记**：用户消息包含 ((PHONE_CHAT_MODE))
**重要**：这是系统隐藏标记，用户看不到，你也不要提及它

**回复规则**：只输出 <phone> JSON，不要任何正文、描写、旁白！

**示例**：
用户消息：((PHONE_CHAT_MODE))在吗？

你的回复（只有JSON）：
<phone>
{
  "type": "wechat_message",
  "contact": "角色名",
  "avatar": "😊",
  "messages": [
    {"content": "在呢！", "time": "21:31", "type": "text"},
    {"content": "怎么啦？", "time": "21:31", "type": "text"}
  ]
}
</phone>

⚠️ 错误示范：
❌ 我看了看手机，微笑着回复...（不要描写）
❌ *拿起手机*（不要动作）
❌ "在呢。"我打字道（不要对话）
✅ 只输出<phone>JSON</phone>

---

## 🟢 模式2：剧情中使用手机

**识别条件**：
- 角色明确拿出手机发消息
- 角色和用户不在同一地点
- 剧情描写"手机震动"、"收到消息"

**回复规则**：正文描写 + <phone> JSON标签

**示例**：
林晓雨走进家门，换上舒服的睡衣，躺在床上。她拿起手机，犹豫了一下，还是给你发了消息。

<phone>
{
  "type": "wechat_message",
  "contact": "林晓雨",
  "avatar": "👩",
  "messages": [
    {"content": "到家啦~", "time": "22:15", "type": "text"},
    {"content": "今天很开心😊", "time": "22:15", "type": "text"}
  ],
  "notification": "林晓雨: 到家啦~"
}
</phone>

---

## ⚪ 模式3：面对面对话

**识别条件**：
- 角色和用户在同一地点
- 面对面交流
- 电话通话（属于语音，不是微信）

**回复规则**：正文对话 + 空标签 <phone></phone>

**示例**：
林晓雨坐在你对面，轻声说："今天天气真好呢。"

<phone></phone>

---

## ⏰ 时间规则（强制要求）

**当前剧情时间将在每次调用时注入**

规则：
1. 所有time字段必须基于注入的剧情时间
2. 多条消息时，每条递增1-2分钟
3. **严禁使用现实时间**（07:16、08:00等）
4. **严禁使用模糊时间**（刚刚、5分钟前）

正确示例：
剧情时间21:30 → 第1条21:31，第2条21:31或21:32

错误示例：
❌ "time": "07:16"（早上时间不符合剧情）
❌ "time": "刚刚"（模糊时间）
❌ 第2条时间比第1条早

---

## 📋 JSON格式规范

必需字段：
- type: "wechat_message"
- contact: "角色名"
- messages: [{content, time, type}]

可选字段：
- avatar: "😊"（表情符号）
- notification: "预览文字"（不超过20字）

消息类型：
- text: 文字消息
- image: 图片（content为描述）
- voice: 语音（content为时长）
- video: 视频通话`,
        order: 2
    },
    
    loadContacts: {
        enabled: true,
        name: '🤖 智能加载联系人',
        description: '从角色卡生成联系人列表',
        content: `# 智能加载联系人任务

你是数据分析助手，不是角色扮演AI。

## 任务
从提供的信息中提取5-10个微信联系人。

## 数据来源
1. 角色卡信息
2. 世界书条目
3. 记忆表格
4. 聊天记录

## 提取规则
1. 第一个必须是主角色
2. 优先提取明确的人名
3. 排除系统词汇（时代、天气、地点、年龄、物品等）
4. 人名不够时使用通用名（张伟、李娜、王强）

## 输出格式（只返回JSON）
{
  "contacts": [
    {"name": "主角名", "avatar": "⭐", "relation": "主角", "remark": ""},
    {"name": "人名", "avatar": "👤", "relation": "关系", "remark": "备注"}
  ],
  "groups": [
    {"name": "群名", "avatar": "👥", "members": ["成员1", "成员2"]}
  ],
  "initialTime": {
    "date": "2044年10月28日",
    "time": "21:30",
    "weekday": "星期一",
    "period": "晚上"
  }
}`,
        order: 5
    }
},

                moments: {
        enabled: false,
        name: '📸 朋友圈',
        description: '朋友圈动态生成规则',
        content: `# 朋友圈功能提示词
当需要生成朋友圈内容时使用`,
        order: 3
    },
    
    call: {
        enabled: true,
        name: '📞 语音/视频通话',
        description: '通话决策和对话规则',
        content: `# 通话功能提示词
决定是否接听电话`,
        order: 4
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
