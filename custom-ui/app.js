document.addEventListener('DOMContentLoaded', async () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    let currentChatId = null; // 用于存储当前聊天文件的ID
    let currentCharacterId = null; // 用于存储当前角色ID
    let messageCount = 0; // 用于检测新消息

    console.log('Custom Standalone UI script loaded.');

    // --- API 辅助函数 ---

    // 获取CSRF令牌 (SillyTavern API的必要部分)
    async function getCsrfToken() {
        try {
            const response = await fetch('/api/get-csrf-token');
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
            return null;
        }
    }

    // 获取当前激活的角色和聊天信息
    async function getCurrentContext() {
        try {
            // 这个端点能提供当前会话选择的角色和聊天文件
            const response = await fetch('/api/context'); 
            const data = await response.json();
            currentCharacterId = data.characterId;
            currentChatId = data.chatId;
            return true;
        } catch (error) {
            console.error('Failed to get current context:', error);
            return false;
        }
    }

    // --- UI 函数 ---

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function loadChatHistory() {
        if (!currentChatId || !currentCharacterId) {
            await getCurrentContext();
        }

        try {
            const response = await fetch(`/api/chats/get?file=${currentChatId}&avatar=${currentCharacterId}`);
            const history = await response.json();

            if (history && history.length > messageCount) {
                chatMessages.innerHTML = ''; // 重新渲染整个聊天
                history.forEach(message => {
                    const sender = message.is_user ? 'user' : 'bot';
                    addMessage(message.mes, sender);
                });
                messageCount = history.length;
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    async function handleSend() {
        const messageText = userInput.value.trim();
        if (!messageText) return;

        const originalValue = userInput.value;
        userInput.value = '';

        try {
            const csrfToken = await getCsrfToken();
            // 调用SillyTavern的生成端点
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    prompt: messageText,
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            // 消息发送成功后，轮询会获取到新消息
        } catch (error) {
            console.error('Failed to send message:', error);
            userInput.value = originalValue; // 恢复输入以便用户重试
        }
    }

    // --- 初始化和事件监听 ---

    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    });

    // 启动时加载一次，然后定期轮询
    await loadChatHistory();
    setInterval(loadChatHistory, 2000); // 每2秒检查一次更新
});