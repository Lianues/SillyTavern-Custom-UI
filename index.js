import { eventSource, event_types } from '../../../../script.js';

(function () {
    const extensionName = "custom-ui-extension";
    console.log(`[${extensionName}] Extension loaded. Waiting for APP_READY event...`);

    // 使用SillyTavern的APP_READY事件，确保所有UI元素都已加载
    eventSource.on(event_types.APP_READY, function () {
        console.log(`[${extensionName}] APP_READY event received. Modifying UI...`);

        // 注入CSS来强制隐藏旧UI并设置新容器的样式
        const styles = `
            #chat-container, #form_holder {
                display: none !important;
            }
            #custom-ui-container {
                height: calc(100% - 130px); /* 减去顶部栏和一些边距 */
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                z-index: 10; /* 确保在顶层 */
            }
        `;
        $('head').append(`<style>${styles}</style>`);

        // 1. 隐藏原生UI元素 (通过CSS实现，JS作为后备)
        $('#chat-container').hide();
        $('#form_holder').hide();
        console.log(`[${extensionName}] Original UI elements hidden via CSS and JS.`);

        // 2. 创建并注入我们自定义UI的容器
        if ($('#custom-ui-container').length === 0) {
            const $customUiContainer = $('<div id="custom-ui-container"></div>');
            // 注入到 #top-bar 的后面，确保在主内容区域
            $('#top-bar').after($customUiContainer);

            // 3. 将我们的自定义UI通过iframe加载到容器中
            const extensionPath = `scripts/extensions/third-party/custom-ui-extension/custom-ui/index.html`;
            const $iframe = $(`<iframe id="custom-ui-iframe" src="${extensionPath}" style="width: 100%; height: 100%; border: none;"></iframe>`);
            
            $customUiContainer.append($iframe);

            $iframe.on('load', () => {
                window.customUiFrame = $iframe[0].contentWindow;
                console.log(`[${extensionName}] Custom UI iframe loaded and exposed as window.customUiFrame.`);
            });
        }
    });
})();