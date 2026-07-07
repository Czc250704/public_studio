document.addEventListener('DOMContentLoaded', function() {
    
    // 配置 PDF.js 的处理线程文件
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // 基础变量
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

    // 实时时钟
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

    // 获取 URL 传递的 book ID
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('file'); 

    if (!fileId) {
        document.querySelector('.pdf-viewport').innerHTML = '<p style="color:#999;margin:50px auto;">未选择任何书籍，请返回主界面</p>';
        return;
    }

    const pdfPath = `../pdfs/${fileId}.pdf`;
    const chapterJsonPath = `../pdfs/${fileId}_chapters.json`;

    // ---------- 自定义渲染引擎 ----------
    function renderPage(num) {
        if (isRendering) {
            pendingPage = num;
            return;
        }
        isRendering = true;
        pageDisplay.textContent = '加载中...';

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
                // 渲染完毕，如果需要继续翻页
                if (pendingPage !== null) {
                    renderPage(pendingPage);
                    pendingPage = null;
                }
            });
        }).catch(function(error) {
            console.error("PDF 渲染错误:", error);
            isRendering = false;
            pageDisplay.textContent = `加载失败`;
        });
    }

    function queueRenderPage(num) {
        if (num < 1) num = 1;
        if (num > totalPages) num = totalPages;
        renderPage(num);
    }

    // 绑定箭头翻页
    prevBtn.addEventListener('click', function() { queueRenderPage(currentPage - 1); });
    nextBtn.addEventListener('click', function() { queueRenderPage(currentPage + 1); });

    // ---------- 数据与目录加载 ----------
    async function loadPdfAndChapters() {
        try {
            // 加载 PDF 底层数据
            const loadingTask = pdfjsLib.getDocument(pdfPath);
            pdfDoc = await loadingTask.promise;
            totalPages = pdfDoc.numPages;
            pageDisplay.textContent = `当前页码：1/${totalPages}`;
            renderPage(1);

            // 加载章节数据
            const response = await fetch(chapterJsonPath);
            if (!response.ok) throw new Error("未找到目录文件");
            const chapters = await response.json();
            
            chapterListContainer.innerHTML = '';
            chapterSelect.innerHTML = '<option value="">搜索章节跳转</option>';

            chapters.forEach((chapter) => {
                // 生成列表
                const li = document.createElement('li');
                li.textContent = chapter.title;
                li.dataset.page = chapter.page;
                li.addEventListener('click', function() {
                    jumpToPage(this, chapter.page);
                });
                chapterListContainer.appendChild(li);

                // 生成下拉框
                const option = document.createElement('option');
                option.value = chapter.page;
                option.textContent = chapter.title;
                chapterSelect.appendChild(option);
            });

            // 下拉框联动
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
            chapterListContainer.innerHTML = '<li class="empty-msg">暂无目录文件</li>';
            chapterSelect.innerHTML = '<option>无可用章节</option>';
        }
    }

    // ---------- 目录点击跳转与高亮联动 ----------
    function jumpToPage(element, pageNum) {
        document.querySelectorAll('.chapter-list li').forEach(li => li.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
        queueRenderPage(pageNum);
        chapterSelect.value = pageNum;
    }

    loadPdfAndChapters();

    // 页面卸载时销毁 PDF 文档，防止内存泄漏
    window.addEventListener('beforeunload', function() {
        if (pdfDoc) {
            pdfDoc.destroy();
        }
    });
});