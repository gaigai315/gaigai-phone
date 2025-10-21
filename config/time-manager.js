// 剧情时间管理器
export class TimeManager {
    constructor(storage) {
        this.storage = storage;
    }
    
    /**
     * 🎯 核心方法：获取当前剧情时间
     * @returns {Object} { time: "14:30", date: "2044年10月28日", weekday: "星期三", timestamp: 1730102400000 }
     */
    getCurrentStoryTime() {
        const context = this.getContext();
        
        // 🔹 情况1：未选择角色，返回现实时间
        if (!context || !context.characterId) {
            return this.getRealTime();
        }
        
        // 🔹 情况2：从聊天记录提取时间（优先级最高）
        const timeFromChat = this.extractTimeFromChat(context);
        if (timeFromChat) {
            console.log('⏰ [时间管理] 从聊天记录提取:', timeFromChat);
            return timeFromChat;
        }
        
        // 🔹 情况3：智能推断时间
        const inferredTime = this.inferTimeFromLore(context);
        if (inferredTime) {
            console.log('⏰ [时间管理] 从设定推断:', inferredTime);
            return inferredTime;
        }
        
        // 🔹 情况4：默认时间
        console.log('⏰ [时间管理] 使用默认剧情时间');
        return this.getDefaultStoryTime();
    }
    
    /**
     * 🔍 从聊天记录提取时间（优先级最高）
     */
    extractTimeFromChat(context) {
        if (!context.chat || context.chat.length === 0) {
            return null;
        }
        
        // 从最后一条AI消息的状态栏提取
        for (let i = context.chat.length - 1; i >= 0; i--) {
            const msg = context.chat[i];
            if (!msg.is_user && msg.mes) {
                const statusbarTime = this.parseStatusbar(msg.mes);
                if (statusbarTime) {
                    return statusbarTime;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 🔍 解析状态栏时间
     * 支持格式：
     * - 全局时间：2044年10月28日·晚上·星期一·21:30
     * - 全局时间[：:]2044年06月11日·🍦·星期三·14:30
     */
    parseStatusbar(text) {
        const statusbarMatch = text.match(/<statusbar>([\s\S]*?)<\/statusbar>/i);
        if (!statusbarMatch) return null;
        
        const content = statusbarMatch[1];
        
        // 匹配格式：2044年10月28日·晚上·星期一·21:30
        const timeMatch = content.match(/全局时间[：:]\s*(\d{4})年(\d{1,2})月(\d{1,2})日·[^·]+·(星期[一二三四五六日])·(\d{1,2}):(\d{2})/);
        
        if (timeMatch) {
            const [_, year, month, day, weekday, hour, minute] = timeMatch;
            const date = new Date(year, parseInt(month) - 1, day, hour, minute);
            
            return {
                time: `${hour.padStart(2, '0')}:${minute}`,
                date: `${year}年${month}月${day}日`,
                weekday: weekday,
                timestamp: date.getTime(),
                year: year,
                month: month,
                day: day,
                hour: hour,
                minute: minute
            };
        }
        
        return null;
    }
    
    /**
     * 🧠 从世界书/角色卡智能推断时间
     */
    inferTimeFromLore(context) {
        let inferredYear = null;
        let inferredDate = null;
        
        // 方法1：从Gaigai表格提取（如果存在）
        if (window.Gaigai?.m?.s) {
            const sections = window.Gaigai.m.s;
            sections.forEach(section => {
                if (section.n === '主线剧情' && section.r?.[0]) {
                    const firstRow = section.r[0];
                    const dateStr = firstRow['0'] || firstRow[0]; // 日期字段
                    if (dateStr) {
                        const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
                        if (match) {
                            inferredYear = match[1];
                            inferredDate = { month: match[2], day: match[3] };
                            console.log('📊 [时间管理] 从Gaigai表格提取:', dateStr);
                        }
                    }
                }
            });
        }
        
        // 方法2：从世界书提取
        if (!inferredYear && context.characters && context.characterId !== undefined) {
            const char = context.characters[context.characterId];
            if (char?.data?.character_book?.entries) {
                char.data.character_book.entries.forEach(entry => {
                    if (!inferredYear) {
                        // 匹配：剧情时间起点:2044年
                        const yearMatch = entry.content?.match(/(?:剧情时间|时代|年份|时间起点)[：:]\s*(\d{4})年/);
                        if (yearMatch) {
                            inferredYear = yearMatch[1];
                            console.log('📚 [时间管理] 从世界书提取年份:', inferredYear);
                        }
                    }
                });
            }
        }
        
        // 构建时间对象
        if (inferredYear) {
            const now = new Date();
            const month = inferredDate ? parseInt(inferredDate.month) : (now.getMonth() + 1);
            const day = inferredDate ? parseInt(inferredDate.day) : now.getDate();
            
            const date = new Date(inferredYear, month - 1, day, 9, 0); // 默认早上9点
            
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            
            return {
                time: '09:00',
                date: `${inferredYear}年${month}月${day}日`,
                weekday: weekdays[date.getDay()],
                timestamp: date.getTime(),
                inferred: true
            };
        }
        
        return null;
    }
    
    /**
     * 🕐 获取现实时间
     */
    getRealTime() {
        const now = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        
        return {
            time: this.formatTime(now),
            date: this.formatDate(now),
            weekday: weekdays[now.getDay()],
            timestamp: now.getTime(),
            isReal: true
        };
    }
    
    /**
     * 🎲 获取默认剧情时间（当所有方法都失败时）
     */
    getDefaultStoryTime() {
        const now = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        
        return {
            time: '09:00',
            date: this.formatDate(now),
            weekday: weekdays[now.getDay()],
            timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).getTime(),
            isDefault: true
        };
    }
    
    /**
     * 🔧 辅助方法：格式化时间
     */
    formatTime(date) {
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    }
    
    getContext() {
        return (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) 
            ? SillyTavern.getContext() 
            : null;
    }
}
