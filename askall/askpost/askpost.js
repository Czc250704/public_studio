document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 实时时钟
    function updateTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    }
    updateTime(); setInterval(updateTime, 1000);

    // 2. 夜间模式切换（独立配套）
    const toggleBtn = document.getElementById('toggle-theme-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '日间模式' : '夜间模式';
        });
    }

    // 3. 读取从主页传递过来的帖子数据（sessionStorage）
    const currentPostStr = sessionStorage.getItem('current_ask_post');
    if (!currentPostStr) {
        document.querySelector('.post-detail-header').innerHTML = '<h1 style="color:#999;text-align:center;">未找到帖子，请返回列表重新点击</h1>';
        return;
    }
    const currentPost = JSON.parse(currentPostStr);

    // 4. 渲染帖子信息
    document.getElementById('detail-title').textContent = currentPost.title;
    document.getElementById('detail-author').textContent = currentPost.author;
    document.getElementById('detail-time').textContent = currentPost.time;
    document.getElementById('detail-content').textContent = currentPost.excerpt;

    // 渲染评论函数
    function renderComments(comments) {
        const container = document.getElementById('comment-list-container');
        const countDisplay = document.getElementById('comment-count');
        container.innerHTML = '';
        countDisplay.textContent = comments.length;

        if (comments.length === 0) {
            container.innerHTML = '<div style="color:#999;font-size:14px;text-align:center;padding:20px;">还没有评论，快来抢沙发吧！</div>';
            return;
        }

        comments.forEach(function(com) {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.style.cssText = 'background: var(--nav-bg); padding: 15px; border-radius: 8px; margin-top: 15px;';
            item.innerHTML = `
                <div style="font-weight: bold; color: var(--header-bg);">${com.author}</div>
                <div style="font-size: 14px; margin-top: 5px; color: #555; word-break: break-all;">${com.content}</div>
                <div style="font-size: 12px; margin-top: 5px; color: #999;">发表于 ${com.time}</div>
            `;
            container.appendChild(item);
        });
    }
    renderComments(currentPost.comments);

    // 5. 新增评论提交逻辑
    const submitBtn = document.getElementById('submit-comment-btn');
    const nicknameInput = document.getElementById('comment-nickname');
    const contentInput = document.getElementById('comment-input');

    submitBtn.onclick = function() {
        const nickname = nicknameInput.value.trim() || '匿名访客';
        const content = contentInput.value.trim();

        if (!content) {
            alert('评论内容不能为空！');
            return;
        }

        // 构建评论数据
        const newComment = {
            author: nickname,
            content: content,
            time: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'})
        };

        // 添加到本地数组
        currentPost.comments.push(newComment);
        // 更新 sessionStorage
        sessionStorage.setItem('current_ask_post', JSON.stringify(currentPost));

        // 同步更新全局 localStorage (让主页的评论数也能正确显示)
        let allPosts = JSON.parse(localStorage.getItem('ask_posts_data'));
        const foundIndex = allPosts.findIndex(p => p.id === currentPost.id);
        if (foundIndex !== -1) {
            allPosts[foundIndex] = currentPost;
            localStorage.setItem('ask_posts_data', JSON.stringify(allPosts));
        }

        // 清空输入并刷新评论列表
        contentInput.value = '';
        renderComments(currentPost.comments);
    };
});