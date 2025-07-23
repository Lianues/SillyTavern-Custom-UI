import { eventSource, event_types } from '../../../../script.js';

(function () {
    const extensionName = "custom-ui-extension";
    console.log(`[${extensionName}] Extension loaded. Waiting for APP_READY event...`);

    function applyCustomUi() {
        console.log(`[${extensionName}] Applying Custom UI modifications...`);

        // 注入CSS来强制隐藏旧UI并设置新容器的样式
        const styles = `
            #chat-container, #form_holder, #right-nav-panel, #left-nav-panel {
                display: none !important;
            }
            #custom-ui-container {
                height: calc(100% - 50px); /* 仅减去顶部栏高度 */
                position: fixed;
                top: 50px; /* 在顶部栏下方开始 */
                left: 0;
                width: 100%;
                z-index: 1000; /* 提高层级 */
                background-color: var(--bg1); /* 使用SillyTavern的背景色变量 */
            }
        `;
        
        // 确保样式只被添加一次
        if ($('#custom-ui-styles').length === 0) {
            $('head').append(`<style id="custom-ui-styles">${styles}</style>`);
        }

        // 再次隐藏，以防万一
        $('#chat-container, #form_holder, #right-nav-panel, #left-nav-panel').hide();
        console.log(`[${extensionName}] Original UI elements hidden.`);

        // 创建并注入我们自定义UI的容器
        if ($('#custom-ui-container').length === 0) {
            const $customUiContainer = $('<div id="custom-ui-container"></div>');
            $('body').append($customUiContainer); // 直接附加到body，以获得更好的控制

            const extensionPath = `scripts/extensions/third-party/custom-ui-extension/custom-ui/index.html`;
            const $iframe = $(`<iframe id="custom-ui-iframe" src="${extensionPath}" style="width: 100%; height: 100%; border: none;"></iframe>`);
            
            $customUiContainer.append($iframe);

            $iframe.on('load', () => {
                window.customUiFrame = $iframe[0].contentWindow;
                console.log(`[${extensionName}] Custom UI iframe loaded.`);
            });
        }
    }

    // 使用SillyTavern的APP_READY事件
    eventSource.on(event_types.APP_READY, function () {
        // 增加一个短暂的延迟，确保所有SillyTavern的UI脚本都已执行完毕
        setTimeout(applyCustomUi, 100);
    });
})();