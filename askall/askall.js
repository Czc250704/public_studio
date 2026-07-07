document.addEventListener('DOMContentLoaded', function() {
    
    // 实时时间
    function updateTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    }
    updateTime();
    setInterval(updateTime, 1000);

    // 夜间模式切换
    const toggleBtn = document.getElementById('toggle-theme-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '日间模式' : '夜间模式';
        });
    }

    // 模拟论坛数据
    const postsData = [
        { title: '对于自研 PDF 阅读器的一点技术心得', excerpt: '在脱离 iframe 和内置插件进行 PDF 渲染的过程中，遇到了很多关于 Canvas 绘制的坑...', author: '小橙子', time: '2026-07-06', comments: 12 },
        { title: '液态玻璃效果在网页中的实际应用', excerpt: '最近尝试在导航栏和卡片中加入 backdrop-filter，视觉效果提升明显...', author: '前端小能手', time: '2026-07-05', comments: 8 },
        { title: '基于 JSON 动态生成书库列表的最佳实践', excerpt: '将书籍元数据隔离到独立的 JSON 文件中，前后端分离非常彻底...', author: '架构师小明', time: '2026-07-04', comments: 23 }
    ];

    const postList = document.getElementById('post-list-container');
    postsData.forEach(function(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = function() { window.location.href = 'askpost/askpost.html'; };
        card.innerHTML = `
            <div class="post-title">${post.title}</div>
            <div class="post-excerpt">${post.excerpt}</div>
            <div class="post-meta">
                <span>作者：${post.author}</span>
                <span>发布时间：${post.time}</span>
                <span>回复：${post.comments}</span>
            </div>
        `;
        postList.appendChild(card);
    });

    // 搜索过滤
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
});