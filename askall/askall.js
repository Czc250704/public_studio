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

    // 3. 数据管理核心 （使用本地存储 localStorage）
    let postsData = JSON.parse(localStorage.getItem('ask_posts_data'));
    if (!postsData || postsData.length === 0) {
        // 默认数据
        postsData = [
            { id: 1, title: '对于自研 PDF 阅读器的一点技术心得', excerpt: '在脱离 iframe 和内置插件进行 PDF 渲染的过程中...', author: '小橙子', time: '2026-07-06', comments: [] },
            { id: 2, title: '液态玻璃效果在网页中的实际应用', excerpt: '最近尝试在导航栏和卡片中加入 backdrop-filter...', author: '前端小能手', time: '2026-07-05', comments: [] },
            { id: 3, title: '基于 JSON 动态生成书库列表的最佳实践', excerpt: '将书籍元数据隔离到独立的 JSON 文件中...', author: '架构师小明', time: '2026-07-04', comments: [] }
        ];
        localStorage.setItem('ask_posts_data', JSON.stringify(postsData));
    }

    // 渲染列表函数
    function renderPosts() {
        const container = document.getElementById('post-list-container');
        const countDisplay = document.getElementById('post-count');
        container.innerHTML = '';
        countDisplay.textContent = '共 ' + postsData.length + ' 篇讨论';

        postsData.forEach(function(post, index) {
            const card = document.createElement('div');
            card.className = 'post-card';
            // 【关键修复】：点击跳转时，只把 帖子 ID 传给 URL
            card.onclick = function() {
                window.location.href = 'askpost/askpost.html?id=' + post.id;
            };
            card.innerHTML = `
                <div class="post-title">${post.title}</div>
                <div class="post-excerpt">${post.excerpt}</div>
                <div class="post-meta">
                    <span>作者：${post.author}</span>
                    <span>发布时间：${post.time}</span>
                    <span>回复：${post.comments.length}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }
    renderPosts();

    // 4. 搜索过滤功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const keyword = this.value.toLowerCase().trim();
            document.querySelectorAll('.post-card').forEach(function(card) {
                const title = card.querySelector('.post-title').textContent.toLowerCase();
                card.style.display = title.includes(keyword) ? 'block' : 'none';
            });
        });
    }

    // 5. 新增“发布新帖”模态框交互
    const modal = document.getElementById('post-modal');
    const openBtn = document.getElementById('open-post-modal-btn');
    const closeBtns = document.querySelectorAll('.close-modal-btn, .cancel-btn');
    const submitBtn = document.getElementById('submit-post-btn');

    openBtn.onclick = function() { modal.style.display = 'flex'; };
    closeBtns.forEach(function(btn) {
        btn.onclick = function() { modal.style.display = 'none'; };
    });
    window.onclick = function(event) {
        if (event.target === modal) { modal.style.display = 'none'; }
    };

    // 6. 发帖逻辑
    submitBtn.onclick = function() {
        const titleInput = document.getElementById('post-title-input');
        const contentInput = document.getElementById('post-content-input');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('请填写完整标题和内容！');
            return;
        }

        const newPost = {
            id: Date.now(), // 使用时间戳作为唯一的数字 ID
            title: title,
            excerpt: content.length > 60 ? content.substring(0, 60) + '...' : content,
            author: '访客用户',
            time: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}),
            comments: []
        };

        postsData.unshift(newPost);
        localStorage.setItem('ask_posts_data', JSON.stringify(postsData));
        
        titleInput.value = '';
        contentInput.value = '';
        modal.style.display = 'none';
        renderPosts();
    };
});