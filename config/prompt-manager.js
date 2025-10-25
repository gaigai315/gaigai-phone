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

## 🔥 重要：手机消息优先级
⚠️ 当提示词中出现【📱 手机活动记录】区块时：
1. **手机消息的优先级 > 面对面对话**
2. 手机消息反映角色的**真实状态和位置**
3. 如果手机消息显示角色在加班 → 角色**不可能**同时在用户身边
4. 如果手机消息显示角色在回家路上 → 回复应体现这个状态
5. 严格遵守手机消息中的时间和剧情线

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
- 多条消息递增1-2分钟

## 🎯 状态冲突处理示例
错误示例：
- 手机消息：林晓雨 21:30 "我还在加班，可能要很晚"
- AI回复：林晓雨坐在你身边，轻声说... ❌ **矛盾！**

正确示例：
- 手机消息：林晓雨 21:30 "我还在加班，可能要很晚"
- AI回复：
  正文：你独自在家等待...
  <phone>
  {
    "type": "wechat_message",
    "contact": "林晓雨",
    "messages": [{"content": "再等我一会儿，马上忙完了", "time": "21:35"}]
  }
  </phone>`,
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

## 🔵 模式1：手机聊天模式（用户在手机微信上）

**⚠️ 重要识别**：如果提示词中出现"用户正在手机微信上和你聊天"，说明这是手机聊天模式！

**严格回复要求**：
1. ✅ **只返回纯文本对话内容**（像真实的微信聊天一样）
2. ❌ **不要任何描写、动作、心理活动**
3. ❌ **不要使用 <phone> 标签或 JSON 格式**
4. ❌ **不要使用引号、星号、括号等特殊符号**
5. ✅ **简短、自然、符合微信聊天习惯**

**正确示例（手机聊天模式）**：
\`\`\`
在呢
怎么了？
\`\`\`

**错误示例（不要这样）**：
\`\`\`
❌ "在呢。"我回复道
❌ *拿起手机* 在呢
❌ 我看了看手机，微笑着回复...
❌ <phone>{"messages":[{"content":"在呢"}]}</phone>
❌ { "type": "wechat_message", "messages": [...] }
\`\`\`

---

## 🟢 模式2：剧情中使用手机（AI主动发手机消息）

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

## 📋 JSON格式规范（仅用于模式2）

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
    content: `【数据提取任务】你是一个数据分析助手，不是角色扮演AI。

# 基础信息
{{charInfo}}
{{userInfo}}

# 已识别的人名
{{namesList}}

# 世界书和记忆内容（包含NPC信息）
{{allNPCInfo}}

# 聊天历史
{{chatHistory}}

---

# 任务
根据上述信息，生成5-10个微信联系人的JSON数据。

# 要求
1. 第一个联系人必须是"{{charName}}"
2. 优先使用"已识别的人名"
3. 从"世界书和记忆内容"中提取更多NPC
4. 不要使用这些词：时代、天气、地点、年龄、全局时间、待办、区域、方位、主线剧情、支线追踪、角色状态、物品、服装
5. 如果人名不够，使用通用中文名（张伟、李娜、王强、陈静）

# 输出格式（只返回JSON，不要任何解释、旁白或其他文字）
\`\`\`json
{
  "contacts": [
    {"name": "{{charName}}", "avatar": "⭐", "relation": "主角", "remark": ""},
    {"name": "具体人名", "avatar": "👨", "relation": "关系", "remark": ""}
  ],
  "groups": [],
  "initialTime": {
    "date": "2044年10月28日",
    "time": "21:30",
    "weekday": "星期一",
    "period": "晚上"
  }
}
\`\`\`

# 关于 initialTime（初始时间）
1. 根据上述信息推断故事开始的时间
2. 如果世界书/角色卡中明确了时间，使用明确的时间
3. 如果没有明确，根据故事氛围推断（例如：校园故事→早上8点，都市故事→晚上8点）
4. period 可选值：凌晨、早上、上午、中午、下午、傍晚、晚上、深夜

**重要**：你是数据提取助手，不要进行角色扮演，不要输出剧情或对话，只返回JSON格式的联系人列表。`,
    order: 5
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
