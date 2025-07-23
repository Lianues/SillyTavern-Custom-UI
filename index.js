import { eventSource, event_types } from '../../../../script.js';

(function () {
    const extensionName = "custom-ui-extension";
    console.log(`[${extensionName}] Extension loaded. Waiting for APP_READY event...`);

    function applyCustomUi() {
        console.log(`[${extensionName}] Applying Custom UI modifications...`);

        const styles = `
            #chat-container, #form_holder, #right-nav-panel, #left-nav-panel {
                display: none !important;
                visibility: hidden !important;
            }
            #custom-ui-container {
                height: calc(100% - 50px);
                position: fixed;
                top: 50px;
                left: 0;
                width: 100%;
                z-index: 1000;
                background-color: var(--bg1);
            }
        `;
        
        if ($('#custom-ui-styles').length === 0) {
            $('head').append(`<style id="custom-ui-styles">${styles}</style>`);
        }

        $('#chat-container, #form_holder, #right-nav-panel, #left-nav-panel').hide();
        console.log(`[${extensionName}] Original UI elements hidden.`);

        if ($('#custom-ui-container').length === 0) {
            const $customUiContainer = $('<div id="custom-ui-container"></div>');
            $('body').append($customUiContainer);

            const extensionPath = `scripts/extensions/third-party/custom-ui-extension/custom-ui/index.html`;
            const $iframe = $(`<iframe id="custom-ui-iframe" src="${extensionPath}" style="width: 100%; height: 100%; border: none;"></iframe>`);
            
            $customUiContainer.append($iframe);

            $iframe.on('load', () => {
                window.customUiFrame = $iframe[0].contentWindow;
                console.log(`[${extensionName}] Custom UI iframe loaded.`);
            });
        }

        // --- 诊断日志 ---
        let checkCount = 0;
        const maxChecks = 25; // 检查5秒
        const interval = setInterval(() => {
            const $chat = $('#chat-container');
            if ($chat.css('display') !== 'none') {
                console.error(`[${extensionName}] DIAGNOSIS: #chat-container was made visible again! Display is now: ${$chat.css('display')}`);
                clearInterval(interval);
            }
            checkCount++;
            if (checkCount >= maxChecks) {
                console.log(`[${extensionName}] DIAGNOSIS: #chat-container remained hidden for 5 seconds.`);
                clearInterval(interval);
            }
        }, 200);
    }

    eventSource.on(event_types.APP_READY, function () {
        setTimeout(applyCustomUi, 100);
    });
})();