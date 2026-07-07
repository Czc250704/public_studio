// 全局工具函数 - 管理路由跳转和组件加载逻辑

/**
 * 页面跳转函数
 * @param {string} url - 目标页面的相对路径
 * 说明：这里预留了扩展空间，后续可以在此增加权限校验或过渡动画逻辑
 */
function navigateTo(url) {
    // 在实际开发中，这里可以增加判断，例如：检查用户是否登录
    // 如果不需要特殊处理，直接进行浏览器跳转
    window.location.href = url;
}

// 如果后续页面需要模块加载，可在此函数内统一管理
function loadComponent(containerId, componentPath) {
    // 预留的组件加载函数，方便未来动态加载 header 或 footer
    console.log("准备加载组件至容器：" + containerId + "，路径：" + componentPath);
}

// 将函数挂载到全局，方便在 HTML 标签中直接调用
window.navigateTo = navigateTo;
window.loadComponent = loadComponent;