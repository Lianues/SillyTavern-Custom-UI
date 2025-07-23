import { eventSource, event_types } from '../../../../script.js';

(function () {
    const extensionName = "custom-ui-extension";
    console.log(`[${extensionName}] Loaded. Preparing for redirect...`);

    // 确保只执行一次重定向
    let redirected = false;

    function redirectToCustomUi() {
        if (redirected) return;
        redirected = true;

        console.log(`[${extensionName}] APP_READY received. Redirecting to custom UI...`);

        // 动态构建路径
        const scriptSrc = document.currentScript.src;
        const extensionBasePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
        const newUrl = `${extensionBasePath}/custom-ui/index.html`;

        console.log(`[${extensionName}] Redirecting to: ${newUrl}`);
        window.location.replace(newUrl);
    }

    // 在SillyTavern应用准备好后立即重定向
    eventSource.on(event_types.APP_READY, redirectToCustomUi);

    // 作为后备，如果APP_READY事件错过了，在文档加载完成后也尝试重定向
    $(document).ready(function() {
        setTimeout(() => {
            if (!redirected) {
                console.warn(`[${extensionName}] APP_READY event not caught, redirecting via document.ready as a fallback.`);
                redirectToCustomUi();
            }
        }, 1000); // 延迟1秒等待
    });
})();