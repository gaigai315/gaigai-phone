// 微信APP主程序
import { ChatView } from './chat-view.js';
import { ContactsView } from './contacts-view.js';
import { MomentsView } from './moments-view.js';
import { WechatData } from './wechat-data.js';

export class WechatApp {
    constructor(phoneShell, storage) {
    this.phoneShell = phoneShell;
    this.storage = storage;
    this.wechatData = new WechatData(storage);
    this.currentView = 'chats';
    this.currentChat = null;
        
        // 初始化视图
        this.chatView = new ChatView(this);
        this.contactsView = new ContactsView(this);
        this.momentsView = new MomentsView(this);
        
        // 加载样式
        this.loadStyles();
    }
    
    loadStyles() {
    if (!document.getElementById('wechat-styles')) {
        const style = document.createElement('style');
        style.id = 'wechat-styles';
        style.textContent = `
/* ========================================
   微信APP完整样式 - 高仿版
   ======================================== */

.wechat-app {
    width: 100%;
    height: 100%;
    background: #ededed;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

/* ========================================
   顶部栏样式
   ======================================== */

.wechat-header {
    background: #ededed;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    border-bottom: 0.5px solid #d8d8d8;
    flex-shrink: 0;
    position: relative;
}

.wechat-header-left {
    width: 60px;
}

.wechat-back-btn {
    background: none;
    border: none;
    color: #576b95;
    font-size: 16px;
    padding: 8px;
    cursor: pointer;
}

.wechat-header-title {
    font-size: 17px;
    font-weight: 600;
    color: #000;
    flex: 1;
    text-align: center;
}

/* 正在输入动画 */
.typing-status {
    display: block;
    font-size: 12px;
    color: #999;
    font-weight: normal;
    margin-top: 2px;
}

.typing-dots {
    display: inline-block;
    animation: typing 1.4s infinite;
}

@keyframes typing {
    0%, 60%, 100% { opacity: 1; }
    30% { opacity: 0.3; }
}

.header-badge {
    color: #576b95;
    font-size: 14px;
}

.wechat-header-right {
    width: 60px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.wechat-header-btn {
    background: none;
    border: none;
    color: #000;
    font-size: 18px;
    cursor: pointer;
}

/* ========================================
   内容区样式
   ======================================== */

.wechat-content {
    flex: 1;
    overflow-y: auto;
    background: #fff;
    position: relative;
}

/* ========================================
   底部导航栏
   ======================================== */

.wechat-tabbar {
    height: 50px;
    background: #f7f7f7;
    border-top: 0.5px solid #d8d8d8;
    display: flex;
    flex-shrink: 0;
}

.wechat-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    color: #999;
    font-size: 10px;
}

.wechat-tab.active {
    color: #07c160;
}

.wechat-tab i {
    font-size: 22px;
    margin-bottom: 2px;
}

.tab-badge {
    position: absolute;
    top: 3px;
    right: calc(50% - 20px);
    background: #ff3b30;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
}

/* ========================================
   聊天列表样式
   ======================================== */

.wechat-chat-list {
    background: #fff;
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 0.5px solid #e5e5e5;
    cursor: pointer;
    background: #fff;
    transition: background 0.2s;
}

.chat-item:active {
    background: #ececec;
}

.chat-avatar-wrapper {
    margin-right: 12px;
    flex-shrink: 0;
}

.chat-avatar {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
}

.chat-info {
    flex: 1;
    min-width: 0;
}

.chat-name {
    font-size: 17px;
    color: #000;
    margin-bottom: 5px;
    font-weight: 500;
}

.group-count {
    font-size: 13px;
    color: #999;
}

.chat-last-msg {
    font-size: 14px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chat-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    flex-shrink: 0;
}

.chat-time {
    font-size: 12px;
    color: #b2b2b2;
    margin-bottom: 5px;
}

.chat-badge {
    background: #ff3b30;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 10px;
}

/* ========================================
   聊天室样式 - 高仿微信
   ======================================== */

.chat-room {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ededed;
}

.chat-messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

/* 时间戳分组 */
.message-time-divider {
    text-align: center;
    margin: 15px 0;
}

.time-divider-text {
    display: inline-block;
    padding: 3px 10px;
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
    font-size: 12px;
    border-radius: 4px;
}

/* 聊天消息 */
.chat-message {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;
}

.message-left {
    justify-content: flex-start;
}

.message-right {
    justify-content: flex-end;
}

.message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.2s;
}

.message-avatar:hover {
    transform: scale(1.05);
}

.message-left .message-avatar {
    margin-right: 10px;
}

.message-right .message-avatar {
    margin-left: 10px;
}

.message-content {
    max-width: 70%;
    position: relative;
}

.message-text {
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 15px;
    line-height: 1.5;
    word-wrap: break-word;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-left .message-text {
    background: #fff;
    color: #000;
}

.message-right .message-text {
    background: #95ec69;
    color: #000;
}

/* 聊天气泡小尾巴 */
.message-text::before {
    content: '';
    position: absolute;
    top: 10px;
    width: 0;
    height: 0;
    border-style: solid;
}

.message-left .message-text::before {
    left: -5px;
    border-width: 6px 6px 6px 0;
    border-color: transparent #fff transparent transparent;
}

.message-right .message-text::before {
    right: -5px;
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent #95ec69;
}

.message-time {
    font-size: 11px;
    color: #999;
    margin-top: 3px;
    text-align: right;
}

.message-left .message-time {
    text-align: left;
}

/* 特殊消息类型 */
.message-image {
    max-width: 100%;
    border-radius: 8px;
    cursor: pointer;
}

.message-voice {
    padding: 10px 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 80px;
    cursor: pointer;
}

.message-left .message-voice {
    background: #fff;
}

.message-right .message-voice {
    background: #95ec69;
}

.message-transfer {
    background: linear-gradient(135deg, #ff9500 0%, #ff8c00 100%);
    color: #fff;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
}

/* 🧧 红包消息样式 */
.message-redpacket {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: #fff;
    padding: 15px;
    border-radius: 10px;
    min-width: 200px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    transition: transform 0.2s;
}

.message-redpacket:active {
    transform: scale(0.95);
}

.redpacket-icon {
    font-size: 40px;
    text-align: center;
    margin-bottom: 10px;
}

.redpacket-wish {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 8px;
    color: #fff;
}

.redpacket-amount {
    font-size: 14px;
    text-align: center;
    opacity: 0.9;
}

.transfer-icon {
    font-size: 32px;
}

.transfer-amount {
    font-size: 20px;
    font-weight: 600;
}

.transfer-desc {
    font-size: 12px;
    margin-top: 3px;
    opacity: 0.9;
}

/* ========================================
   输入区样式
   ======================================== */

.chat-input-area {
    background: #f7f7f7;
    border-top: 0.5px solid #d8d8d8;
}

.chat-input-bar {
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 8px;
}

.chat-input {
    flex: 1;
    max-width: calc(100% - 180px); /* ← 新增：限制最大宽度，确保按钮可见 */
    min-width: 120px; /* ← 新增：最小宽度 */
    background: #fff;
    border: 0.5px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
}

@media (max-width: 500px) {
    .chat-input {
        max-width: calc(100% - 150px);
        font-size: 16px; /* 防止iOS自动缩放 */
    }
}

.chat-input:focus {
    border-color: #07c160;
}

.input-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    padding: 5px;
    cursor: pointer;
    transition: color 0.2s;
}

.input-btn:hover {
    color: #07c160;
}

.input-btn:active {
    transform: scale(0.9);
}

.send-btn {
    background: #07c160;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
}

.send-btn:hover {
    background: #06a752;
}

.send-btn:active {
    transform: scale(0.95);
}

/* ========================================
   表情面板样式
   ======================================== */

.emoji-panel {
    padding: 10px;
    background: #fff;
    border-top: 0.5px solid #ddd;
    max-height: 200px;
    overflow-y: auto;
}

.emoji-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 5px;
}

/* ======================================== 
   表情面板标签样式（新增）
   ======================================== */

.emoji-tabs {
    display: flex;
    border-bottom: 1px solid #e5e5e5;
    margin-bottom: 10px;
}

.emoji-tab {
    flex: 1;
    padding: 8px;
    text-align: center;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
}

.emoji-tab.active {
    color: #07c160;
    border-bottom-color: #07c160;
    font-weight: 600;
}

.emoji-tab:hover {
    background: #f8f8f8;
}

/* 自定义表情样式 */
.custom-emoji-item {
    width: 40px;
    height: 40px;
    padding: 0;
    overflow: hidden;
    border-radius: 4px;
}

.custom-emoji-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.emoji-add {
    border: 2px dashed #ccc;
    color: #999;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.emoji-add:hover {
    border-color: #07c160;
    color: #07c160;
    background: #f0f9f4;
}

.emoji-item {
    font-size: 26px;
    text-align: center;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: background 0.2s;
}

.emoji-item:hover {
    background: #f0f0f0;
}

.emoji-item:active {
    background: #e0e0e0;
}

/* ========================================
   更多功能面板样式
   ======================================== */

.more-panel {
    padding: 12px; /* ← 缩小内边距 */
    background: #fff;
    border-top: 0.5px solid #ddd;
    max-height: 250px; /* ← 新增：限制高度 */
    overflow-y: auto;
}

.more-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* ← 固定4列 */
    gap: 10px; /* ← 缩小间距 */
    max-width: 100%;
}


.more-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 5px; /* ← 新增 */
}

.more-icon {
    width: 50px; /* ← 缩小 10px */
    height: 50px;
    background: #fff;
    border: 0.5px solid #e5e5e5;
    border-radius: 10px; /* ← 缩小圆角 */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px; /* ← 缩小字体 */
    color: #666;
    margin-bottom: 4px; /* ← 缩小间距 */
    transition: all 0.2s;
}

.more-item:hover .more-icon {
    background: #f8f8f8;
    transform: scale(1.05);
}

.more-item:active .more-icon {
    background: #f0f0f0;
    transform: scale(0.95);
}

.more-name {
    font-size: 11px; /* ← 缩小字体 */
    color: #666;
    text-align: center;
    line-height: 1.2;
}

@media (max-width: 500px) {
    .more-grid {
        gap: 8px;
    }
    
    .more-icon {
        width: 46px;
        height: 46px;
        font-size: 20px;
    }
    
    .more-name {
        font-size: 10px;
    }
}
/* ========================================
   头像设置弹窗
   ======================================== */

.avatar-settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.avatar-settings-content {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    width: 90%;
    max-width: 300px;
}

.avatar-settings-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    text-align: center;
}

.avatar-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    background: #f0f0f0;
    margin: 0 auto 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-upload-btn {
    display: block;
    width: 100%;
    padding: 10px;
    background: #f0f0f0;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 10px;
}

.remark-input {
    width: 100%;
    padding: 10px;
    border: 0.5px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 15px;
    outline: none;
}

.remark-input:focus {
    border-color: #07c160;
}

.avatar-settings-buttons {
    display: flex;
    gap: 10px;
}

.avatar-settings-buttons button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}

.save-avatar-btn {
    background: #07c160;
    color: #fff;
}

.cancel-avatar-btn {
    background: #f0f0f0;
    color: #666;
}

/* ========================================
   空状态优化
   ======================================== */

.wechat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    color: #b2b2b2;
}

.wechat-empty i {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 15px;
}

/* ========================================
   滚动条美化
   ======================================== */

.wechat-content::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
    width: 4px;
}

.wechat-content::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
}

.wechat-content::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
    background: transparent;
}

/* ========================================
   个人页样式优化 - 高端设计
   ======================================== */

.wechat-profile {
    background: linear-gradient(to bottom, #ededed 0%, #f5f5f5 100%);
    min-height: 100%;
    padding-bottom: 20px;
}

/* 个人信息卡片 */
.profile-card {
    background: #fff;
    padding: 30px 20px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
}

.profile-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    flex-shrink: 0;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.profile-avatar-large:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.profile-avatar-large:active {
    transform: scale(0.95);
}

/* 头像编辑提示 */
.avatar-edit-hint {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 14px;
    padding: 4px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.profile-avatar-large:hover .avatar-edit-hint {
    opacity: 1;
}

.profile-avatar-large img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
}

.profile-user-info {
    flex: 1;
}

.profile-username {
    font-size: 22px;
    font-weight: 600;
    color: #000;
    margin-bottom: 8px;
}

.profile-signature {
    font-size: 14px;
    color: #888;
    margin-bottom: 6px;
    line-height: 1.4;
}

.profile-wxid {
    font-size: 13px;
    color: #b2b2b2;
}

/* 分隔线 */
.profile-divider {
    height: 10px;
    background: transparent;
}

/* 功能列表 */
.profile-functions {
    background: #fff;
}

.profile-function-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 0.5px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
}

.profile-function-item:last-child {
    border-bottom: none;
}

.profile-function-item:active {
    background: #f8f8f8;
}

.function-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 22px;
    flex-shrink: 0;
    margin-right: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.function-content {
    flex: 1;
}

.function-title {
    font-size: 16px;
    font-weight: 500;
    color: #000;
    margin-bottom: 3px;
}

.function-desc {
    font-size: 12px;
    color: #999;
}

.function-arrow {
    color: #c8c8c8;
    font-size: 14px;
    margin-left: 10px;
}

/* 数据统计 */
.profile-stats {
    background: #fff;
    display: flex;
    padding: 20px 0;
}

.stat-item {
    flex: 1;
    text-align: center;
}

.stat-number {
    font-size: 24px;
    font-weight: 600;
    color: #07c160;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 13px;
    color: #888;
}

/* 编辑资料弹窗优化 */
.profile-edit-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.profile-edit-content {
    background: #fff;
    border-radius: 16px;
    padding: 25px;
    width: 90%;
    max-width: 320px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s;
}

@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.profile-edit-title {
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 20px;
    color: #000;
}

.profile-edit-avatar {
    width: 90px;
    height: 90px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 45px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transition: transform 0.2s;
}

.profile-edit-avatar:hover {
    transform: scale(1.05);
}

.profile-edit-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-edit-input {
    width: 100%;
    padding: 12px 15px;
    border: 1.5px solid #e5e5e5;
    border-radius: 8px;
    font-size: 15px;
    margin-bottom: 12px;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.profile-edit-input:focus {
    outline: none;
    border-color: #07c160;
}

.profile-edit-upload-btn {
    display: block;
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 15px;
    transition: transform 0.2s, box-shadow 0.3s;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.profile-edit-upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.profile-edit-upload-btn:active {
    transform: translateY(0);
}

.profile-edit-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
}

.profile-save-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    background: #07c160;
    color: #fff;
    transition: background 0.2s;
}

.profile-save-btn:hover {
    background: #06a752;
}

.profile-cancel-btn {
    flex: 1;
    padding: 12px;
    border: 1.5px solid #e5e5e5;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    background: #fff;
    color: #666;
    transition: background 0.2s;
}

.profile-cancel-btn:hover {
    background: #f8f8f8;
}

/* ========================================
   📇 通讯录美化
   ======================================== */

.wechat-contacts {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    overflow: hidden;
}

.contacts-search {
    padding: 10px 15px;
    background: #ededed;
    flex-shrink: 0;
}

.contacts-scrollable {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
}

.search-input {
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: #fff;
    font-size: 14px;
    outline: none;
}

.contacts-functions {
    background: #fff;
    padding: 10px 0;
    margin-bottom: 10px;
}

.function-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    cursor: pointer;
    transition: background 0.2s;
}

.function-item:active {
    background: #f0f0f0;
}

.function-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    margin-right: 12px;
}

.function-name {
    font-size: 15px;
    color: #000;
}

.contacts-list {
    background: #fff;
    /* 🔥 删除这行（如果有）：overflow-y: auto; */
}
.contacts-group {
    position: relative;
}

.group-letter {
    position: sticky;
    top: 0;
    background: #f5f5f5;
    padding: 5px 15px;
    font-size: 13px;
    font-weight: 600;
    color: #666;
    z-index: 10;
}

.contact-item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 0.5px solid #e5e5e5;
    cursor: pointer;
    transition: background 0.2s;
}

.contact-item:active {
    background: #f0f0f0;
}

.contact-avatar {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-right: 12px;
    flex-shrink: 0;
}

.contact-name {
    font-size: 16px;
    color: #000;
    font-weight: 500;
}

.letter-index {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 1px;
    z-index: 100;
    padding: 4px 0;
}

.letter-item {
    font-size: 10px;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 4px;
    transition: all 0.2s;
}

.letter-item:active {
    background: #667eea;
    color: #fff;
    border-radius: 50%;
}

/* 聊天背景支持 */
.chat-room {
    background-size: cover !important;
    background-position: center !important;
}

/* ========================================
   ⚙️ 设置页面开关样式
   ======================================== */

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 28px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
    background-color: #07c160;
}

.toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(22px);
}

/* ========================================
   其他组件样式保持原样
   ======================================== */

/* 这里保留原有的发现页、个人页、通讯录、朋友圈等样式... */
        `;
        document.head.appendChild(style);
        console.log('✅ 微信样式已内联加载（优化版）');
    }
}
    
    render() {
        const chatList = this.wechatData.getChatList();
        const unreadCount = chatList.reduce((sum, chat) => sum + chat.unread, 0);
        
        const html = `
            <div class="wechat-app">
                <!-- 顶部栏 -->
                <div class="wechat-header">
                    <div class="wechat-header-left">
                        <button class="wechat-back-btn" id="wechat-back">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="wechat-header-title">
                        ${this.currentChat ? this.currentChat.name : '微信'}
                        ${unreadCount > 0 && !this.currentChat ? `<span class="header-badge">(${unreadCount})</span>` : ''}
                    </div>
                    <div class="wechat-header-right">
                        ${this.currentChat ? `
                            <button class="wechat-header-btn" id="chat-info">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                        ` : `
                            <button class="wechat-header-btn" id="wechat-search">
                                <i class="fa-solid fa-search"></i>
                            </button>
                            <button class="wechat-header-btn" id="wechat-add">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        `}
                    </div>
                </div>
                
                <!-- 内容区 -->
                <div class="wechat-content" id="wechat-content">
                    ${this.renderContent()}
                </div>
                
                <!-- 底部导航（主页才显示）-->
                ${!this.currentChat ? `
                    <div class="wechat-tabbar">
                        <div class="wechat-tab ${this.currentView === 'chats' ? 'active' : ''}" data-view="chats">
                            <i class="fa-solid fa-comment"></i>
                            <span>微信</span>
                            ${unreadCount > 0 ? `<span class="tab-badge">${unreadCount}</span>` : ''}
                        </div>
                        <div class="wechat-tab ${this.currentView === 'contacts' ? 'active' : ''}" data-view="contacts">
                            <i class="fa-solid fa-address-book"></i>
                            <span>通讯录</span>
                        </div>
                        <div class="wechat-tab ${this.currentView === 'discover' ? 'active' : ''}" data-view="discover">
                            <i class="fa-solid fa-compass"></i>
                            <span>发现</span>
                        </div>
                        <div class="wechat-tab ${this.currentView === 'me' ? 'active' : ''}" data-view="me">
                            <i class="fa-solid fa-user"></i>
                            <span>我</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.phoneShell.setContent(html);
        this.bindEvents();
    }
    
    renderContent() {
        if (this.currentChat) {
            return this.chatView.renderChatRoom(this.currentChat);
        }
        
        switch (this.currentView) {
            case 'chats':
                return this.renderChatList();
            case 'contacts':
                return this.contactsView.render();
            case 'discover':
                return this.renderDiscover();
            case 'me':
                return this.renderProfile();
            default:
                return this.renderChatList();
        }
    }
    
    renderChatList() {
        const chats = this.wechatData.getChatList();
        
        if (chats.length === 0) {
            return `
                <div class="wechat-empty">
                    <i class="fa-solid fa-comments" style="font-size: 48px; color: #ccc;"></i>
                    <p>暂无聊天</p>
                </div>
            `;
        }
        
        return `
            <div class="wechat-chat-list">
                ${chats.map(chat => `
                    <div class="chat-item" data-chat-id="${chat.id}">
                        <div class="chat-avatar">
                            ${chat.avatar || (chat.type === 'group' ? '👥' : '👤')}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">
                                ${chat.name}
                                ${chat.type === 'group' ? `<span class="group-count">(${chat.members?.length || 2})</span>` : ''}
                            </div>
                            <div class="chat-last-msg">${chat.lastMessage || '暂无消息'}</div>
                        </div>
                        <div class="chat-meta">
                            <div class="chat-time">${chat.time || '刚刚'}</div>
                            ${chat.unread > 0 ? `<span class="chat-badge">${chat.unread > 99 ? '99+' : chat.unread}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderDiscover() {
        return `
            <div class="wechat-discover">
                <div class="discover-item" id="moments-btn">
                    <div class="discover-icon" style="background: #ff6b6b;">
                        <i class="fa-solid fa-circle-nodes"></i>
                    </div>
                    <div class="discover-name">朋友圈</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-divider"></div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #4ecdc4;">
                        <i class="fa-solid fa-video"></i>
                    </div>
                    <div class="discover-name">视频号</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #95e1d3;">
                        <i class="fa-solid fa-tv"></i>
                    </div>
                    <div class="discover-name">直播</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-divider"></div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #f38181;">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                    <div class="discover-name">扫一扫</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="discover-item">
                    <div class="discover-icon" style="background: #aa96da;">
                        <i class="fa-solid fa-shake"></i>
                    </div>
                    <div class="discover-name">摇一摇</div>
                    <div class="discover-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderProfile() {
    const userInfo = this.wechatData.getUserInfo();
    return `
        <div class="wechat-profile">
            <!-- 🎨 个人信息卡片 -->
            <div class="profile-card">
                <div class="profile-avatar-large" id="edit-avatar-btn">
                    ${userInfo.avatar || '😊'}
                    <div class="avatar-edit-hint">
                        <i class="fa-solid fa-camera"></i>
                    </div>
                </div>
                <div class="profile-user-info">
                    <div class="profile-username">${userInfo.name || '用户'}</div>
                    <div class="profile-signature">${userInfo.signature || '设置个性签名'}</div>
                    <div class="profile-wxid">微信号：${userInfo.wxid || 'wx_user001'}</div>
                </div>
            </div>
            
            <div class="profile-divider"></div>
            
            <!-- 🔧 功能区 -->
            <div class="profile-functions">
                <div class="profile-function-item" id="smart-load-contacts">
                    <div class="function-icon-wrapper" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <i class="fa-solid fa-user-group"></i>
                    </div>
                    <div class="function-content">
                        <div class="function-title">智能加载联系人</div>
                        <div class="function-desc">从角色卡和聊天记录生成</div>
                    </div>
                    <div class="function-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-function-item" id="edit-profile-btn">
                    <div class="function-icon-wrapper" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <i class="fa-solid fa-user-pen"></i>
                    </div>
                    <div class="function-content">
                        <div class="function-title">编辑个人资料</div>
                        <div class="function-desc">修改昵称、头像、签名</div>
                    </div>
                    <div class="function-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="profile-function-item" id="wechat-settings-btn">
                    <div class="function-icon-wrapper" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <i class="fa-solid fa-gear"></i>
                    </div>
                    <div class="function-content">
                        <div class="function-title">设置</div>
                        <div class="function-desc">通用、隐私、数据管理</div>
                    </div>
                    <div class="function-arrow">
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </div>
            </div>
            
            <!-- 📊 数据统计（可选显示） -->
            <div class="profile-divider"></div>
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-number">${this.wechatData.getContacts().length}</div>
                    <div class="stat-label">联系人</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.wechatData.getChatList().length}</div>
                    <div class="stat-label">聊天</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${this.wechatData.getMoments().length}</div>
                    <div class="stat-label">朋友圈</div>
                </div>
            </div>
        </div>
    `;
}
    
bindEvents() {
    // 返回按钮
    document.getElementById('wechat-back')?.addEventListener('click', () => {
        if (this.currentChat) {
            this.currentChat = null;
            this.render();
        } else {
            window.dispatchEvent(new CustomEvent('phone:goHome'));
        }
    });
    
    // 底部导航切换
    document.querySelectorAll('.wechat-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            this.currentView = tab.dataset.view;
            this.render();
            
            // ← 新增：如果切换到通讯录，绑定事件
            if (this.currentView === 'contacts') {
                setTimeout(() => {
                    this.contactsView.bindEvents();
                }, 100);
            }
        });
    });
    
    // 聊天列表点击
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.dataset.chatId;
            this.openChat(chatId);
        });
    });
    
    // 朋友圈入口
    document.getElementById('moments-btn')?.addEventListener('click', () => {
        this.openMoments();
    });
    
    // 绑定聊天界面事件
    if (this.currentChat) {
        this.chatView.bindEvents();
    }

    // 🎨 头像点击 - 快捷编辑
    document.getElementById('edit-avatar-btn')?.addEventListener('click', () => {
        this.showEditProfile();
    });

    // 🔧 智能加载联系人
    document.getElementById('smart-load-contacts')?.addEventListener('click', () => {
        this.showLoadContactsConfirm();
    });

    // 🔧 编辑个人资料
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
        this.showEditProfile();
    });

    // 🔧 设置按钮
    document.getElementById('wechat-settings-btn')?.addEventListener('click', () => {
        this.showSettings();
    });

    // 🔧 聊天设置按钮（三个点）
    document.getElementById('chat-info')?.addEventListener('click', () => {
        this.chatView.showChatMenu();
    });
}
    
openChat(chatId) {
    const chat = this.wechatData.getChat(chatId);
    if (chat) {
        chat.unread = 0; // 清空未读
        this.currentChat = chat;
        this.render();
    }
}
    
    openMoments() {
        this.momentsView.render();
    }
    
    // 接收新消息（从AI）
    receiveMessage(data) {
        const chatId = data.chatId || data.from || 'ai_chat';
        
        // 确保聊天存在
        let chat = this.wechatData.getChat(chatId);
        if (!chat) {
            chat = this.wechatData.createChat({
                id: chatId,
                name: data.from || 'AI助手',
                type: 'single',
                avatar: data.avatar || '🤖'
            });
        }
        
        // 添加消息
        if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach(msg => {
                this.wechatData.addMessage(chatId,{
                    from: data.from || 'AI',
                    content: msg.text || msg.message,
                    time: msg.timestamp || '刚刚',
                    type: 'text'
                });
            });
            
            // 如果不在当前聊天，增加未读
            if (!this.currentChat || this.currentChat.id !== chatId) {
                chat.unread = (chat.unread || 0) + data.messages.length;
            }
        } else if (data.message) {
            this.wechatData.addMessage(chatId, {
                from: data.from || 'AI',
                content: data.message,
                time: data.timestamp || '刚刚',
                type: 'text'
            });
            
            if (!this.currentChat || this.currentChat.id !== chatId) {
                chat.unread = (chat.unread || 0) + 1;
            }
        }
        
        // 刷新界面
        if (this.currentChat && this.currentChat.id === chatId) {
            this.render();
        }
        
        this.wechatData.saveData();
    }

/// ✅ 编辑个人资料（手机内部界面，不用弹窗）
showEditProfile() {
    const userInfo = this.wechatData.getUserInfo();
    
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-profile-edit">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">编辑个人资料</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <!-- 头像区域 -->
                <div style="background: #fff; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #999; margin-bottom: 15px;">点击头像更换</div>
                    <div id="user-avatar-preview" style="
                        width: 90px;
                        height: 90px;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 45px;
                        cursor: pointer;
                        overflow: hidden;
                        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                        transition: transform 0.2s;
                    ">${userInfo.avatar || '😊'}</div>
                    <input type="file" id="user-avatar-upload" accept="image/*" style="display: none;">
                    <button id="upload-user-avatar-btn" style="
                        width: 100%;
                        padding: 12px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        cursor: pointer;
                    ">
                        <i class="fa-solid fa-camera"></i> 更换头像
                    </button>
                </div>
                
                <!-- 资料输入 -->
                <div style="background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                    <div style="color: #999; font-size: 13px; margin-bottom: 8px;">昵称</div>
                    <input type="text" id="user-name-input" placeholder="输入昵称" 
                           value="${userInfo.name || ''}" maxlength="20" style="
                        width: 100%;
                        padding: 12px;
                        border: 1.5px solid #e5e5e5;
                        border-radius: 8px;
                        font-size: 15px;
                        box-sizing: border-box;
                        margin-bottom: 15px;
                    ">
                    
                    <div style="color: #999; font-size: 13px; margin-bottom: 8px;">个性签名</div>
                    <input type="text" id="user-signature-input" placeholder="输入个性签名" 
                           value="${userInfo.signature || ''}" maxlength="50" style="
                        width: 100%;
                        padding: 12px;
                        border: 1.5px solid #e5e5e5;
                        border-radius: 8px;
                        font-size: 15px;
                        box-sizing: border-box;
                    ">
                </div>
                
                <!-- 保存按钮 -->
                <button id="save-user-profile" style="
                    width: 100%;
                    padding: 14px;
                    background: #07c160;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                ">保存</button>
            </div>
        </div>
    `;
    
    this.phoneShell.setContent(html);
    
    // 返回按钮
    document.getElementById('back-from-profile-edit')?.addEventListener('click', () => {
        this.render();
    });
    
    // 上传头像按钮
    document.getElementById('upload-user-avatar-btn')?.addEventListener('click', () => {
        document.getElementById('user-avatar-upload').click();
    });
    
    // 头像上传
    document.getElementById('user-avatar-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                this.phoneShell.showNotification('提示', '图片太大，请选择小于2MB的图片', '⚠️');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('user-avatar-preview');
                preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
                this.wechatData.updateUserInfo({ avatar: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 保存按钮
    document.getElementById('save-user-profile')?.addEventListener('click', () => {
        const newName = document.getElementById('user-name-input').value.trim();
        const newSignature = document.getElementById('user-signature-input').value.trim();
        
        if (!newName) {
            this.phoneShell.showNotification('提示', '请输入昵称', '⚠️');
            return;
        }
        
       this.wechatData.updateUserInfo({
            name: newName,
            signature: newSignature
        });
        
        this.phoneShell.showNotification('保存成功', '个人资料已更新', '✅');
        setTimeout(() => this.render(), 1000);
    });
}

showSettings() {
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-settings">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">微信设置</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <!-- 在线模式 -->
                <div style="background: #fff; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 16px; font-weight: 500; color: #000;">在线模式</div>
                            <div style="font-size: 12px; color: #999; margin-top: 4px;">开启后，手机消息会发送给AI</div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="online-mode-toggle" 
                                   ${window.VirtualPhone?.settings?.onlineMode ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <!-- 数据管理 -->
                <div style="background: #fff3cd; border-radius: 12px; padding: 15px; margin-bottom: 15px; border: 1px solid #ffc107;">
                    <div style="font-size: 14px; font-weight: 600; color: #856404; margin-bottom: 12px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> 数据管理
                    </div>
                    <button id="clear-wechat-data" style="
                        width: 100%;
                        padding: 12px;
                        background: #fff;
                        border: 1px solid #ffc107;
                        border-radius: 8px;
                        color: #856404;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        margin-bottom: 8px;
                    ">清空当前角色微信数据</button>
                    <div style="font-size: 11px; color: #856404;">⚠️ 将删除所有聊天记录和联系人</div>
                </div>
            </div>
        </div>
    `;
    
    this.phoneShell.setContent(html);
    
    // 返回按钮
    document.getElementById('back-from-settings')?.addEventListener('click', () => {
        this.render();
    });
    
    // 在线模式开关
    const checkbox = document.getElementById('online-mode-toggle');
    checkbox?.addEventListener('change', () => {
        if (window.VirtualPhone?.settings) {
            window.VirtualPhone.settings.onlineMode = checkbox.checked;
            window.VirtualPhone.storage.saveSettings(window.VirtualPhone.settings);
            
            this.phoneShell.showNotification(
                checkbox.checked ? '已开启' : '已关闭',
                checkbox.checked ? '手机消息将发送给AI' : '手机消息不会发送给AI',
                '✅'
            );
        }
    });
    
// 清空数据按钮
document.getElementById('clear-wechat-data')?.addEventListener('click', () => {
    this.showClearDataConfirm();
});
}

    // 📋 显示智能加载联系人确认界面
showLoadContactsConfirm() {
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-load">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">智能加载联系人</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <div style="background: #fff; border-radius: 12px; padding: 30px; text-align: center;">
                    <i class="fa-solid fa-robot" style="font-size: 48px; color: #667eea; margin-bottom: 20px;"></i>
                    <div style="font-size: 18px; font-weight: 600; color: #000; margin-bottom: 10px;">使用AI生成联系人</div>
                    <div style="font-size: 14px; color: #999; margin-bottom: 30px; line-height: 1.6;">
                        将使用AI分析当前角色卡和聊天记录，智能生成联系人。<br><br>
                        ⚠️ 这会向AI发送一条系统消息（不会显示在聊天窗口）
                    </div>
                    
                    <button id="confirm-load" style="
                        width: 100%;
                        padding: 14px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-bottom: 10px;
                    ">开始生成</button>
                    
                    <button id="cancel-load" style="
                        width: 100%;
                        padding: 14px;
                        background: #f0f0f0;
                        color: #666;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">取消</button>
                </div>
            </div>
        </div>
    `;
    
    this.phoneShell.setContent(html);
    
    document.getElementById('back-from-load')?.addEventListener('click', () => {
        this.render();
    });
    
    document.getElementById('cancel-load')?.addEventListener('click', () => {
        this.render();
    });
    
    document.getElementById('confirm-load')?.addEventListener('click', async () => {
        this.phoneShell.showNotification('AI分析中', '请稍候，正在生成联系人...', '⏳');
        
        try {
            const result = await this.wechatData.loadContactsFromCharacter();
            
            if (result.success) {
    this.phoneShell.showNotification('✅ 生成成功', result.message, '✅');
    
    // 🔥 修复：先切换视图，再渲染，最后绑定事件
    setTimeout(() => {
        this.currentView = 'contacts';
        this.render();
        
        // 确保通讯录事件绑定
        setTimeout(() => {
            if (this.contactsView && typeof this.contactsView.bindEvents === 'function') {
                this.contactsView.bindEvents();
                console.log('✅ 通讯录事件已重新绑定');
            }
        }, 100);
    }, 1000);
}
            } else {
                this.phoneShell.showNotification('❌ 生成失败', result.message, '❌');
                setTimeout(() => this.render(), 2000);
            }
        } catch (error) {
            console.error('加载联系人失败:', error);
            this.phoneShell.showNotification('❌ 错误', error.message || '未知错误', '❌');
            setTimeout(() => this.render(), 2000);
        }
    });
}
    // 🗑️ 显示清空数据确认界面
showClearDataConfirm() {
    const html = `
        <div class="wechat-app">
            <div class="wechat-header">
                <div class="wechat-header-left">
                    <button class="wechat-back-btn" id="back-from-clear">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                </div>
                <div class="wechat-header-title">清空数据</div>
                <div class="wechat-header-right"></div>
            </div>
            
            <div class="wechat-content" style="background: #ededed; padding: 20px;">
                <div style="background: #fff; border-radius: 12px; padding: 30px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 64px; color: #ff3b30; margin-bottom: 20px;"></i>
                    <div style="font-size: 20px; font-weight: 600; color: #000; margin-bottom: 15px;">确定要清空所有微信数据吗？</div>
                    <div style="font-size: 14px; color: #999; margin-bottom: 10px; line-height: 1.6;">
                        此操作将删除：<br>
                        • 所有聊天记录<br>
                        • 所有联系人<br>
                        • 朋友圈内容<br>
                    </div>
                    <div style="font-size: 16px; color: #ff3b30; font-weight: 600; margin-bottom: 30px;">
                        ⚠️ 此操作不可恢复！
                    </div>
                    
                    <button id="confirm-clear-data" style="
                        width: 100%;
                        padding: 14px;
                        background: #ff3b30;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        margin-bottom: 10px;
                    ">确定清空</button>
                    
                    <button id="cancel-clear-data" style="
                        width: 100%;
                        padding: 14px;
                        background: #f0f0f0;
                        color: #666;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                    ">取消</button>
                </div>
            </div>
        </div>
    `;
    
    this.phoneShell.setContent(html);
    
    document.getElementById('back-from-clear')?.addEventListener('click', () => {
        this.showSettings();
    });
    
    document.getElementById('cancel-clear-data')?.addEventListener('click', () => {
        this.showSettings();
    });
    
   document.getElementById('confirm-clear-data')?.addEventListener('click', () => {
    this.wechatData.data = {
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
        customEmojis: [] // ← 新增
    };
    this.wechatData.saveData();
    this.phoneShell.showNotification('已清空', '微信数据已重置', '✅');
    setTimeout(() => {
        this.currentView = 'chats';
        this.render();
    }, 1000);
});
}
}
