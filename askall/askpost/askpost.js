document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 实时时钟
    function updateTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    }
    updateTime(); setInterval(updateTime, 1000);

    // 2. 夜间模式切换
    const toggleBtn = document.getElementById('toggle-theme-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '日间模式' : '夜间模式';
        });
    }

    // 3. 【关键修复】从 URL 的 ?id=xxx 中获取帖子 ID
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id')); // 把字符串转换为数字

    // 从全局本地数据库里找出这篇帖子
    let allPosts = JSON.parse(localStorage.getItem('ask_posts_data'));
    // 如果没有数据，给个空数组防止报错
    if (!allPosts) allPosts = [];

    // 根据 ID 找到唯一的那篇帖子
    const currentPost = allPosts.find(p => p.id === postId);

    if (!currentPost) {
        // 如果找不到（例如用户把 id 参数删了），显示您截图里的错误提示
        document.querySelector('.post-detail-header').innerHTML = '<h1 style="color:#999;text-align:center;padding:40px 0;">未找到帖子，请返回列表重新点击</h1>';
        document.querySelector('.post-content').style.display = 'none';
        document.querySelector('.comment-section').style.display = 'none';
        return;
    }

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

        // 构建评论
        const newComment = {
            author: nickname,
            content: content,
            time: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'})
        };

        // 添加到当前帖子
        currentPost.comments.push(newComment);

        // 必须重新把修改后的帖子保存回全局的 localStorage 数组里
        const allPostsUpdated = JSON.parse(localStorage.getItem('ask_posts_data'));
        const foundIndex = allPostsUpdated.findIndex(p => p.id === postId);
        if (foundIndex !== -1) {
            allPostsUpdated[foundIndex] = currentPost;
            localStorage.setItem('ask_posts_data', JSON.stringify(allPostsUpdated));
        }

        // 清空输入并刷新评论列表
        contentInput.value = '';
        renderComments(currentPost.comments);
    };
});