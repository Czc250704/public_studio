// 主页交互逻辑 - 控制启动过渡动画

document.addEventListener('DOMContentLoaded', function() {
    
    // 获取启动画面和主菜单的 DOM 元素
    var splashScreen = document.getElementById('splash-screen');
    var mainContent = document.getElementById('main-content');

    // 设定文字停留的时间，单位毫秒（此处设置为 2500ms，约 2.5 秒）
    var delayTime = 1500;

    // 第一步：延迟等待，让用户看到 Public Studio 的文字
    setTimeout(function() {
        
        // 第二步：添加淡出类，让文字层开始消失
        splashScreen.classList.add('fade-out');

        // 第三步：监听淡出动画的结束事件，确保动画播完后切换画面
        splashScreen.addEventListener('animationend', function handleAnimationEnd() {
            
            // 移除监听器，避免重复触发
            splashScreen.removeEventListener('animationend', handleAnimationEnd);

            // 彻底隐藏启动层，移除 DOM 树或设置为 display none，以释放层级
            splashScreen.style.display = 'none';

            // 第四步：显示主菜单，并给它添加淡入动画
            mainContent.classList.remove('hidden');
            mainContent.classList.add('fade-in');

        });

    }, delayTime); // 这里的延时控制着文字停留的时间

});