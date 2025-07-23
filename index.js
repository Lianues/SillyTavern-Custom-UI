(function () {
    const extensionName = "custom-ui-extension";
    console.log(`[${extensionName}] Extension loaded.`);

    // 等待文档完全加载
    $(document).ready(function () {
        console.log(`[${extensionName}] Document ready. Modifying UI...`);

        // 1. 隐藏原生UI元素
        const $chatContainer = $('#chat-container');
        const $formHolder = $('#form_holder');

        if ($chatContainer.length > 0) {
            $chatContainer.hide();
            console.log(`[${extensionName}] Original chat container hidden.`);
        }

        if ($formHolder.length > 0) {
            $formHolder.hide();
            console.log(`[${extensionName}] Original form holder hidden.`);
        }

        // 2. 创建并注入我们自定义UI的容器
        // 我们将容器放在 #chat-container 原本所在的位置
        const $customUiContainer = $('<div id="custom-ui-container"></div>');
        $chatContainer.parent().append($customUiContainer);
        console.log(`[${extensionName}] Custom UI container injected.`);

        // 3. 将我们的自定义UI通过iframe加载到容器中
        // 使用iframe可以很好地隔离CSS和JS，避免冲突
        const extensionPath = `scripts/extensions/third-party/custom-ui-extension/custom-ui/index.html`;
        const $iframe = $(`<iframe id="custom-ui-iframe" src="${extensionPath}" style="width: 100%; height: 100%; border: none;"></iframe>`);
        
        $customUiContainer.append($iframe);
        
        // 调整容器样式以适应iframe
        $customUiContainer.css({
            'height': 'calc(100% - 130px)', // 减去顶部栏和一些边距
            'position': 'absolute',
            'bottom': '0',
            'width': '100%'
        });
        
        $iframe.on('load', () => {
            // 将 iframe 的 window 对象暴露出来，方便调试和未来的交互
            window.customUiFrame = $iframe[0].contentWindow;
            console.log(`[${extensionName}] Custom UI iframe loaded and exposed as window.customUiFrame.`);
        });
    });
})();