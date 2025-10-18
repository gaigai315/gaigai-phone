// 朋友圈视图
export class MomentsView {
    constructor(wechatApp) {
        this.app = wechatApp;
        this.newPostText = '';
    }
    
    render() {
        const moments = this.app.data.getMoments();
        const userInfo = this.app.data.getUserInfo();
        
        const html = `
            <div class="wechat-moments">
                <!-- 顶部栏 -->
                <div class="moments-header">
                    <button class="moments-back" id="moments-back">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <span class="moments-title">朋友圈</span>
                    <button class="moments-camera" id="moments-post">
                        <i class="fa-solid fa-camera"></i>
                    </button>
                </div>
                
                <!-- 封面 -->
                <div class="moments-cover">
                    <img src="${userInfo.coverImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"%3E%3Cdefs%3E%3ClinearGradient id="a" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea"%3E%3C/stop%3E%3Cstop offset="100%25" style="stop-color:%23764ba2"%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="1200" height="400" fill="url(%23a)"%3E%3C/rect%3E%3C/svg%3E'}" alt="封面">
                    <div class="cover-info">
                        <div class="cover-name">${userInfo.name || '用户'}</div>
                        <div class="cover-avatar">${userInfo.avatar || '😊'}</div>
                    </div>
                </div>
                
                <!-- 朋友圈列表 -->
                <div class="moments-list">
                    ${moments.length === 0 ? `
                        <div class="moments-empty">
                            <i class="fa-solid fa-camera" style="font-size: 48px; color: #ccc;"></i>
                            <p>朋友圈空空如也</p>
                            <p style="font-size: 12px; color: #999;">快来发布第一条朋友圈吧</p>
                        </div>
                    ` : moments.map(moment => this.renderMoment(moment)).join('')}
                </div>
                
                <!-- 发布弹窗 -->
                <div class="post-modal" id="post-modal" style="display: none;">
                    <div class="post-content">
                        <div class="post-header">
                            <button class="post-cancel" id="post-cancel">取消</button>
                            <span>发布朋友圈</span>
                            <button class="post-send" id="post-send">发布</button>
                        </div>
                        <div class="post-body">
                            <textarea class="post-input" id="post-input" 
                                     placeholder="这一刻的想法..."></textarea>
                            <div class="post-images">
                                <div class="add-image">
                                    <i class="fa-solid fa-plus"></i>
                                </div>
                            </div>
                            <div class="post-options">
                                <div class="post-option">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <span>所在位置</span>
                                </div>
                                <div class="post-option">
                                    <i class="fa-solid fa-users"></i>
                                    <span>谁可以看</span>
                                </div>
                                <div class="post-option">
                                    <i class="fa-solid fa-at"></i>
                                    <span>提醒谁看</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.app.phoneShell.setContent(html);
        this.bindEvents();
    }
    
    renderMoment(moment) {
        return `
            <div class="moment-item">
                <div class="moment-header">
                    <div class="moment-avatar">${moment.avatar || '👤'}</div>
                    <div class="moment-info">
                        <div class="moment-name">${moment.name}</div>
                        <div class="moment-time">${moment.time}</div>
                    </div>
                </div>
                
                <div class="moment-content">
                    ${moment.text ? `<div class="moment-text">${moment.text}</div>` : ''}
                    ${moment.images && moment.images.length > 0 ? `
                        <div class="moment-images grid-${Math.min(moment.images.length, 3)}">
                            ${moment.images.map(img => `
                                <img src="${img}" class="moment-image">
                            `).join('')}
                        </div>
                    ` : ''}
                    ${moment.link ? `
                        <div class="moment-link">
                            <img src="${moment.link.cover}" class="link-cover">
                            <div class="link-title">${moment.link.title}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="moment-actions">
                    <button class="action-btn" data-action="like" data-moment="${moment.id}">
                        <i class="fa-${moment.liked ? 'solid' : 'regular'} fa-heart" 
                           style="color: ${moment.liked ? '#e74c3c' : '#999'}"></i>
                        ${moment.likes > 0 ? moment.likes : ''}
                    </button>
                    <button class="action-btn" data-action="comment" data-moment="${moment.id}">
                        <i class="fa-regular fa-comment"></i>
                        ${moment.comments > 0 ? moment.comments : ''}
                    </button>
                </div>
                
                ${moment.likeList && moment.likeList.length > 0 ? `
                    <div class="moment-likes">
                        <i class="fa-solid fa-heart" style="color: #e74c3c; font-size: 12px;"></i>
                        ${moment.likeList.join('、')}
                    </div>
                ` : ''}
                
                ${moment.commentList && moment.commentList.length > 0 ? `
                    <div class="moment-comments">
                        ${moment.commentList.map(comment => `
                            <div class="comment-item">
                                <span class="comment-name">${comment.name}:</span>
                                <span class="comment-text">${comment.text}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    bindEvents() {
        // 返回按钮
        document.getElementById('moments-back')?.addEventListener('click', () => {
            this.app.currentView = 'discover';
            this.app.render();
        });
        
        // 发布按钮
        document.getElementById('moments-post')?.addEventListener('click', () => {
            document.getElementById('post-modal').style.display = 'block';
        });
        
        // 取消发布
        document.getElementById('post-cancel')?.addEventListener('click', () => {
            document.getElementById('post-modal').style.display = 'none';
            document.getElementById('post-input').value = '';
        });
        
        // 发布朋友圈
        document.getElementById('post-send')?.addEventListener('click', () => {
            const text = document.getElementById('post-input').value;
            if (text.trim()) {
                this.postMoment(text);
            }
        });
        
        // 点赞和评论
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const momentId = btn.dataset.moment;
                
                if (action === 'like') {
                    this.toggleLike(momentId);
                } else if (action === 'comment') {
                    this.showCommentInput(momentId);
                }
            });
        });
    }
    
    postMoment(text) {
        const userInfo = this.app.data.getUserInfo();
        const moment = {
            id: Date.now().toString(),
            name: userInfo.name,
            avatar: userInfo.avatar,
            text: text,
            time: '刚刚',
            likes: 0,
            comments: 0,
            liked: false
        };
        
        this.app.data.addMoment(moment);
        document.getElementById('post-modal').style.display = 'none';
        document.getElementById('post-input').value = '';
        this.render();
        
        this.app.phoneShell.showNotification('朋友圈', '发布成功！', '✅');
    }
    
    toggleLike(momentId) {
        const moment = this.app.data.getMoment(momentId);
        if (moment) {
            moment.liked = !moment.liked;
            moment.likes = moment.liked ? (moment.likes || 0) + 1 : Math.max(0, (moment.likes || 1) - 1);
            
            const userInfo = this.app.data.getUserInfo();
            if (!moment.likeList) moment.likeList = [];
            
            if (moment.liked) {
                moment.likeList.push(userInfo.name);
            } else {
                const index = moment.likeList.indexOf(userInfo.name);
                if (index > -1) moment.likeList.splice(index, 1);
            }
            
            this.app.data.saveData();
            this.render();
        }
    }
    
    showCommentInput(momentId) {
        const comment = prompt('请输入评论：');
        if (comment) {
            const moment = this.app.data.getMoment(momentId);
            if (moment) {
                if (!moment.commentList) moment.commentList = [];
                const userInfo = this.app.data.getUserInfo();
                
                moment.commentList.push({
                    name: userInfo.name,
                    text: comment
                });
                moment.comments = moment.commentList.length;
                
                this.app.data.saveData();
                this.render();
            }
        }
    }
}
