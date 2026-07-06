document.addEventListener('DOMContentLoaded', function() {
    
    // 实时时间展示功能
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('current-time').textContent = hours + ':' + minutes;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // 夜间模式切换逻辑
    const toggleBtn = document.getElementById('toggle-theme-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // 为 body 切换暗色模式类名，触发 css 替换
            document.body.classList.toggle('dark-mode');
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '日间模式' : '夜间模式';
        });
    }

    // 模拟真实书籍数据，您只需在工程中的 public_studio/book/pdfs/ 文件夹里放置对应的 pdf 文件即可
    const booksData = [
        { title: 'JavaScript 高级程序设计', pages: 748, words: '102万', score: '9.3', readers: '12.4万', pdf: '../pdfs/javascript_advanced.pdf' },
        { title: '深入理解计算机系统', pages: 687, words: '89万', score: '9.8', readers: '8.7万', pdf: '../pdfs/cs_app.pdf' },
        { title: '算法导论', pages: 1312, words: '195万', score: '9.4', readers: '6.1万', pdf: '../pdfs/algorithms_intro.pdf' },
        { title: '设计模式：可复用面向对象', pages: 389, words: '45万', score: '9.1', readers: '5.2万', pdf: '../pdfs/design_patterns.pdf' }
    ];

    // 获取容器并清空初始占位内容，使用 JavaScript 动态渲染 HTML
    const container = document.getElementById('book-card-container');
    container.innerHTML = ''; 

    booksData.forEach(function(book) {
        // 构建卡片 HTML 字符串，点击卡片时拼接并跳转到阅读页，携带 pdf 路径参数
        const cardHtml = `
            <div class="book-card" onclick="window.location.href='../bookreadright/bookread.html?pdf=${encodeURIComponent(book.pdf)}'">
                <div class="book-card-top">
                    <div class="book-img-placeholder">书本图片</div>
                    <div class="book-info">
                        <div class="info-item">书名：${book.title}</div>
                        <div class="info-item">页数：${book.pages}</div>
                        <div class="info-item">字数：${book.words}</div>
                        <div class="info-item">豆瓣评分：${book.score}</div>
                        <div class="info-item">阅读人数：${book.readers}</div>
                    </div>
                </div>
                <div class="book-comment">点击卡片立即阅读本书</div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });

    // 搜索栏实时过滤书籍功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const keyword = this.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.book-card');
            cards.forEach(function(card) {
                // 获取信息中第一行书名的文字，进行匹配
                const titleElement = card.querySelector('.info-item');
                const title = titleElement ? titleElement.textContent.toLowerCase() : '';
                card.style.display = title.includes(keyword) ? 'flex' : 'none';
            });
        });
    }
});