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

    // 夜间模式切换
    const toggleBtn = document.getElementById('toggle-theme-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '日间模式' : '夜间模式';
        });
    }

    async function loadBooks() {
        try {
            const response = await fetch('../pdfs/books_meta.json');
            if (!response.ok) throw new Error('加载失败');
            const booksData = await response.json();
            renderBooks(booksData);
        } catch (error) {
            console.error('出错:', error);
            document.getElementById('book-card-container').innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #999;">书籍列表加载失败，请检查服务器环境。</div>`;
        }
    }

    function renderBooks(booksData) {
        const container = document.getElementById('book-card-container');
        container.innerHTML = ''; 

        booksData.forEach(function(book) {
            // 核心改动：将书籍的 id 作为参数传递给阅读页
            const cardHtml = `
                <div class="book-card" onclick="window.location.href='../bookreadright/bookread.html?file=${encodeURIComponent(book.id)}'">
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
        bindSearchFilter();
    }

    function bindSearchFilter() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.replaceWith(searchInput.cloneNode(true));
            const newSearchInput = document.getElementById('search-input');
            newSearchInput.addEventListener('input', function() {
                const keyword = this.value.toLowerCase().trim();
                const cards = document.querySelectorAll('.book-card');
                cards.forEach(function(card) {
                    const titleElement = card.querySelector('.info-item');
                    const title = titleElement ? titleElement.textContent.toLowerCase() : '';
                    card.style.display = title.includes(keyword) ? 'flex' : 'none';
                });
            });
        }
    }
    loadBooks();
});