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

        const elementsToHide = ['#chat-container', '#form_holder', '#right-nav-panel', '#left-nav-panel'];
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.style.display !== 'none') {
                        target.style.display = 'none';
                    }
                }
            });
        });

        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
                observer.observe(element, { attributes: true });
            }
        });
        
        console.log(`[${extensionName}] Original UI elements hidden and monitoring started.`);

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

        // --- 深度诊断日志 ---
        setTimeout(() => {
            const container = document.getElementById('custom-ui-container');
            const chat = document.getElementById('chat-container');

            if (container) {
                const rect = container.getBoundingClientRect();
                console.log(`[${extensionName}] DIAGNOSIS: #custom-ui-container stats ->`, {
                    display: window.getComputedStyle(container).display,
                    visibility: window.getComputedStyle(container).visibility,
                    opacity: window.getComputedStyle(container).opacity,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    zIndex: window.getComputedStyle(container).zIndex,
                    parent: container.parentElement.tagName.toLowerCase(),
                });
            } else {
                console.error(`[${extensionName}] DIAGNOSIS: #custom-ui-container not found in DOM!`);
            }

            if (chat) {
                 console.log(`[${extensionName}] DIAGNOSIS: #chat-container hidden status ->`, {
                    display: window.getComputedStyle(chat).display,
                    visibility: window.getComputedStyle(chat).visibility,
                });
            }
        }, 500); // 延迟500毫秒以等待浏览器渲染
    }

    eventSource.on(event_types.APP_READY, function () {
        setTimeout(applyCustomUi, 200);
    });
})();