import { eventSource, event_types } from '../../../../script.js';

(function () {
    const extensionName = "custom-ui-extension";
    const IFRAME_ID = "custom-ui-iframe";

    function applyCustomUi() {
        console.log(`[${extensionName}] Applying final UI hijack strategy...`);

        // 1. 识别核心DOM元素
        const chatElement = document.getElementById('chat');
        const formHolder = document.getElementById('form_holder');

        if (!chatElement || !formHolder) {
            console.error(`[${extensionName}] Critical UI elements (#chat or #form_holder) not found. Aborting.`);
            return;
        }

        // 2. 隐藏输入框和不需要的面板
        formHolder.style.display = 'none';
        
        // 确保侧边栏可以弹出
        $('#right-nav-panel, #left-nav-panel').css('z-index', '1051');

        // 3. 清空聊天容器并使用MutationObserver阻止其被再次填充
        
        // 先断开已有的observer，以防重复执行
        if (chatElement.observer) {
            chatElement.observer.disconnect();
        }

        // 清空所有子节点
        while (chatElement.firstChild) {
            chatElement.removeChild(chatElement.firstChild);
        }
        
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        // 如果添加的节点不是我们的iframe，立即移除它
                        if (node.id !== IFRAME_ID) {
                            console.warn(`[${extensionName}] Detected and blocked an attempt to re-populate #chat. Node removed:`, node);
                            chatElement.removeChild(node);
                        }
                    });
                }
            }
        });

        observer.observe(chatElement, { childList: true });
        chatElement.observer = observer; // 存储observer以便管理
        console.log(`[${extensionName}] #chat has been cleared and is now under observation.`);

        // 4. 注入我们的iframe
        if ($(`#${IFRAME_ID}`).length === 0) {
            const scriptSrc = document.currentScript.src;
            const extensionBasePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
            const iframeSrc = `${extensionBasePath}/custom-ui/index.html`;

            const iframe = document.createElement('iframe');
            iframe.id = IFRAME_ID;
            iframe.src = iframeSrc;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            chatElement.appendChild(iframe);
            
            iframe.onload = () => {
                window.customUiFrame = iframe.contentWindow;
                console.log(`[${extensionName}] Custom UI iframe successfully loaded.`);
            };
        }
    }

    eventSource.on(event_types.APP_READY, function () {
        // 使用一个更长的延迟来确保SillyTavern的布局和事件完全稳定
        setTimeout(applyCustomUi, 500);
    });
})();