import { eventSource, event_types } from '../../../../script.js';

(function () {
    const extensionName = "custom-ui-extension";
    console.log(`[${extensionName}] Extension loaded. Waiting for APP_READY event...`);

    function applyCustomUi() {
        console.log(`[${extensionName}] Applying Custom UI modifications...`);

        // 1. 识别关键的原生容器
        const $middleColumn = $('#middle_column');
        const $chatContainer = $('#chat-container');
        const $formHolder = $('#form_holder');

        if ($middleColumn.length === 0 || $chatContainer.length === 0 || $formHolder.length === 0) {
            console.error(`[${extensionName}] Critical UI elements not found. Aborting.`);
            return;
        }

        // 2. 隐藏不需要的元素
        $formHolder.hide(); // 输入框区域可以直接隐藏
        $('#right-nav-panel, #left-nav-panel').css('z-index', '1001'); // 确保侧边栏在我们的UI之上

        // 3. 清空聊天容器并注入我们的UI
        if ($('#custom-ui-iframe').length === 0) {
            $chatContainer.empty(); // 清空原生聊天内容
            $chatContainer.css({
                'display': 'flex',
                'flex-direction': 'column',
                'height': '100%'
            });

            // 动态构建路径
            const scriptSrc = document.currentScript.src;
            const extensionBasePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
            const iframeSrc = `${extensionBasePath}/custom-ui/index.html`;
            
            console.log(`[${extensionName}] Iframe SRC resolved to: ${iframeSrc}`);

            const $iframe = $(`<iframe id="custom-ui-iframe" src="${iframeSrc}" style="width: 100%; height: 100%; border: none; flex-grow: 1;"></iframe>`);
            
            $chatContainer.append($iframe);
            $chatContainer.show(); // 确保父容器是可见的

            $iframe.on('load', () => {
                window.customUiFrame = $iframe[0].contentWindow;
                console.log(`[${extensionName}] Custom UI iframe loaded into #chat-container.`);
            });
        }
    }

    eventSource.on(event_types.APP_READY, function () {
        setTimeout(applyCustomUi, 250); // 稍微增加延迟以确保所有原生布局脚本都已完成
    });
})();