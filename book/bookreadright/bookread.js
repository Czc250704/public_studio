document.addEventListener('DOMContentLoaded', function() {
    
    // 实时时间更新
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

    // 获取 URL 参数中的 pdf 路径，加载进 iframe 阅读器
    const urlParams = new URLSearchParams(window.location.search);
    const pdfPath = urlParams.get('pdf');
    const pdfViewer = document.getElementById('pdf-viewer');
    
    if (pdfPath && pdfViewer) {
        // 使用 encodeURIComponent 解码后的路径，加载 PDF
        pdfViewer.src = decodeURIComponent(pdfPath);
    } else if (pdfViewer) {
        // 如果 URL 中没有携带 PDF 参数，显示友好的提示
        pdfViewer.srcdoc = '<div style="display:flex;justify-content:center;align-items:center;height:100%;font-family:sans-serif;color:#999;font-size:18px;">暂无选定的书籍，请返回书库主页点击书籍卡片进入阅读</div>';
    }

    // 模拟目录章节点击与页码刷新功能
    const chapterList = document.querySelectorAll('.chapter-list li');
    const currentPageSpan = document.getElementById('current-page');
    chapterList.forEach(function(li) {
        li.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                currentPageSpan.textContent = '当前页码：' + page + '/345';
                // 目录项点击高亮
                chapterList.forEach(l => l.style.backgroundColor = 'transparent');
                this.style.backgroundColor = 'rgba(230, 126, 34, 0.25)';
            }
        });
    });
});