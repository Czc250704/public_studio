document.addEventListener('DOMContentLoaded', function() {
    
    // 配置 PDF.js 的 Worker 路径，用于解析底层 PDF
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // 声明变量
    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 0;
    let isRendering = false;
    let pendingPage = null;

    const canvas = document.getElementById('pdf-render-canvas');
    const ctx = canvas.getContext('2d');
    const pageDisplay = document.getElementById('current-page');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const chapterListContainer = document.getElementById('chapter-list-container');
    const chapterSelect = document.getElementById('chapter-select');

    // 实时时间更新
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('current-time').textContent = hours + ':' + minutes;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // 夜间模式切换（解决切换功能问题）
    const toggleBtn = document.getElementById('toggle-theme-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '日间模式' : '夜间模式';
        });
    }

    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('file'); // 获取书籍 id

    if (!fileId) {
        document.querySelector('.center-panel').innerHTML = '<p style="color:#999;margin-top:50px;">未选择任何书籍，请返回主界面重试</p>';
        return;
    }

    const pdfPath = `../pdfs/${fileId}.pdf`;
    const chapterJsonPath = `../pdfs/${fileId}_chapters.json`;

    // ---------- 自定义 PDF 渲染核心逻辑 ----------
    function renderPage(num) {
        if (isRendering) {
            pendingPage = num;
            return;
        }
        isRendering = true;
        pageDisplay.textContent = `当前页码：加载中`;

        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = { canvasContext: ctx, viewport: viewport };
            const renderTask = page.render(renderContext);
            
            return renderTask.promise.then(function() {
                isRendering = false;
                currentPage = num;
                pageDisplay.textContent = `当前页码：${currentPage}/${totalPages}`;
                
                if (pendingPage !== null) {
                    renderPage(pendingPage);
                    pendingPage = null;
                }
            });
        }).catch(function(error) {
            console.error("PDF 渲染出错:", error);
            isRendering = false;
            pageDisplay.textContent = `当前页码：加载失败`;
        });
    }

    function queueRenderPage(num) {
        if (num < 1) num = 1;
        if (num > totalPages) num = totalPages;
        renderPage(num);
    }

    // 绑定翻页按钮
    prevBtn.addEventListener('click', function() { queueRenderPage(currentPage - 1); });
    nextBtn.addEventListener('click', function() { queueRenderPage(currentPage + 1); });

    // ---------- 加载 PDF 文件和目录 JSON ----------
    async function loadPdfAndChapters() {
        try {
            // 1. 加载并解析 PDF (不使用 iframe，全靠 PDF.js 解析到 Canvas)
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;
            pageDisplay.textContent = `当前页码：1/${totalPages}`;
            renderPage(1);

            // 2. 加载对应的目录 JSON
            const response = await fetch(chapterJsonPath);
            if (!response.ok) throw new Error("目录文件不存在");
            const chapters = await response.json();
            
            // 成功获取后，渲染目录与下拉框
            chapterListContainer.innerHTML = '';
            chapterSelect.innerHTML = '<option value="">搜索章节跳转</option>';

            chapters.forEach((chapter) => {
                // 渲染左侧目录
                const li = document.createElement('li');
                li.textContent = chapter.title;
                li.dataset.page = chapter.page;
                li.addEventListener('click', function() {
                    jumpToPage(this, chapter.page);
                });
                chapterListContainer.appendChild(li);

                // 渲染顶部下拉框
                const option = document.createElement('option');
                option.value = chapter.page;
                option.textContent = chapter.title;
                chapterSelect.appendChild(option);
            });

            // 下拉框跳转联动
            chapterSelect.addEventListener('change', function() {
                const targetPage = parseInt(this.value);
                if (targetPage > 0) {
                    const targetLi = Array.from(chapterListContainer.children).find(
                        li => parseInt(li.dataset.page) === targetPage
                    );
                    if (targetLi) jumpToPage(targetLi, targetPage);
                }
            });

        } catch (error) {
            console.warn("加载出错:", error.message);
            // 彻底消除截图里莫名其妙的 "测试"，用明确的状态提示代替
            chapterListContainer.innerHTML = '<li class="empty-msg">此书本暂无目录文件</li>';
            chapterSelect.innerHTML = '<option>无章节</option>';
        }
    }

    // ---------- 核心联动函数：页码跳转与颜色高亮 ----------
    function jumpToPage(element, pageNum) {
        // 移除所有列表项的高亮类
        document.querySelectorAll('.chapter-list li').forEach(li => li.classList.remove('active'));
        
        // 给当前元素添加高亮类（颜色变化）
        if (element) {
            element.classList.add('active');
        }

        // 调用自定义的渲染系统直接跳转页面
        queueRenderPage(pageNum);
        
        // 下拉框同步当前值
        chapterSelect.value = pageNum;
    }

    // 执行全部初始化
    loadPdfAndChapters();

    // 退出页面时的清理
    window.addEventListener('beforeunload', function() {
        if (pdfDoc) {
            pdfDoc.destroy();
        }
    });
});