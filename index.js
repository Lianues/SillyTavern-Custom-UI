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
                position: fixed;
                top: 50px;
                left: 0;
                right: 0;
                bottom: 0;
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

            // Dynamically determine the path to the extension's files
            const scriptSrc = document.currentScript.src;
            const extensionBasePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
            const iframeSrc = `${extensionBasePath}/custom-ui/index.html`;
            
            console.log(`[${extensionName}] Iframe SRC resolved to: ${iframeSrc}`);

            const $iframe = $(`<iframe id="custom-ui-iframe" src="${iframeSrc}" style="width: 100%; height: 100%; border: none;"></iframe>`);
            
            $customUiContainer.append($iframe);

            $iframe.on('load', () => {
                window.customUiFrame = $iframe[0].contentWindow;
                console.log(`[${extensionName}] Custom UI iframe loaded.`);
            });
        }
    }

    eventSource.on(event_types.APP_READY, function () {
        setTimeout(applyCustomUi, 200);
    });
})();