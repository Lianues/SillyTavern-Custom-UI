// BeyondTavern Extension Main File

import { getContext } from "../../../../public/scripts/st-context.js";
import { eventSource, event_types } from "../../../../public/script.js";

(function () {
    // sendSystemMessage is a global function, no need to import it.
    let gameWindow = null;
    const extensionBasePath = new URL(document.currentScript.src).pathname.replace(/\/[^/]+$/, '');
    const channel = new BroadcastChannel('beyond_tavern_channel');

    // Function to create and add the launcher button to the UI
    function addLauncherButton() {
        const button = $('<button id="beyond-tavern-launcher">Launch Game</button>');
        
        button.on('click', function() {
            const gameUrl = `${extensionBasePath}/templates/index.html`;
            
            if (gameWindow && !gameWindow.closed) {
                gameWindow.focus();
            } else {
                gameWindow = window.open(gameUrl, 'BeyondTavernGame', 'width=800,height=600');
            }
            console.log(`[BeyondTavern] Attempting to launch game from: ${gameUrl}`);
        });

        $('body').append(button);
    }

    // Wait for the document to be fully loaded before adding the button
    $(document).ready(function () {
        const context = getContext();

        // Function to handle incoming messages and send them to the game window
        function handleMessage(message) {
            if (gameWindow && !gameWindow.closed) {
                console.log('[BeyondTavern] Sending message to game window:', message);
                channel.postMessage({
                    type: 'message',
                    payload: {
                        name: message.name,
                        is_user: message.is_user,
                        message: message.mes,
                    }
                });
            }
        }

        addLauncherButton();
        console.log('[BeyondTavern] Launcher button added.');

        // Listen for messages from the game window
        channel.onmessage = function(event) {
            console.log('[BeyondTavern] Message received from game window:', event.data);
            const data = event.data;
            if (data && data.type === 'command') {
                const command = data.payload;
                // Send the command as a user message in SillyTavern
                sendSystemMessage('user', command);
            }
        };

        // Listen for new messages in SillyTavern
        eventSource.on(event_types.USER_MESSAGE_RENDERED, (messageId) => {
            const message = context.chat.find(msg => msg.id === messageId);
            if(message) handleMessage(message);
        });
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (messageId) => {
            const message = context.chat.find(msg => msg.id === messageId);
            if(message) handleMessage(message);
        });

        console.log('[BeyondTavern] Listening for chat messages.');
    });
})();