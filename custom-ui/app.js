document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // 从父窗口获取 SillyTavern 的核心对象
    const parentContext = window.parent.getContext();
    const parentEventSource = window.parent.eventSource;
    const parentEventTypes = window.parent.event_types;
    const parentSendChatMessage = window.parent.send_chat_message;

    console.log('Custom UI script loaded and connected to parent context.');

    // --- 数据流：从 SillyTavern 到 Custom UI ---

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function loadChatHistory() {
        chatMessages.innerHTML = ''; // 清空现有消息
        const history = parentContext.chat;
        if (history && history.length) {
            history.forEach(message => {
                const sender = message.is_user ? 'user' : 'bot';
                addMessage(message.mes, sender);
            });
        }
        console.log(`Loaded ${history.length} messages from history.`);
    }

    function handleNewMessage(messageId) {
        // messageId in this context is the index of the message in the chat array
        const message = parentContext.chat[messageId];
        if (message) {
            const sender = message.is_user ? 'user' : 'bot';
            addMessage(message.mes, sender);
        }
    }

    // --- 事件监听 ---
    parentEventSource.on(parentEventTypes.USER_MESSAGE_RENDERED, handleNewMessage);
    parentEventSource.on(parentEventTypes.CHARACTER_MESSAGE_RENDERED, handleNewMessage);
    parentEventSource.on(parentEventTypes.CHAT_CHANGED, loadChatHistory);

    // --- 交互流：从 Custom UI 到 SillyTavern ---

    function handleSend() {
        const messageText = userInput.value.trim();
        if (messageText) {
            userInput.value = '';
            
            // 调用父窗口的函数来发送消息
            if (parentSendChatMessage) {
                parentSendChatMessage(messageText, false);
            } else {
                console.error("Could not find 'send_chat_message' function on parent window.");
            }
        }
    }

    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    });

    // --- 初始化 ---
    loadChatHistory();
});