# SillyTavern Custom UI Extension

This extension replaces the default SillyTavern chat interface with a custom, modern UI, while retaining all the original top toolbar functionality.

## Features

- **Modern Interface**: A clean, modern chat interface for a better user experience.
- **Non-Invasive**: Works as a client-side extension without modifying any core SillyTavern files.
- **Seamless Integration**: Uses the existing SillyTavern backend and data handling, ensuring full compatibility with all your characters, chats, and settings.
- **Easy Installation**: Simply drop the folder into your extensions directory.

## Installation

1.  Navigate to the `SillyTavern/public/scripts/extensions/third-party` directory in your SillyTavern installation.
2.  Copy the entire `SillyTavern-Custom-UI` folder into the `third-party` directory.
3.  Restart SillyTavern or refresh the browser page.
4.  The new custom UI should load automatically, replacing the default chat view.

## How It Works

This extension's `index.js` script hides the default chat container (`#chat-container`) and input form (`#form_holder`). It then injects an `<iframe>` that loads a self-contained web application from the `custom-ui/` directory.

This custom UI application communicates with the main SillyTavern window to:
- Fetch the current chat history using `window.parent.getContext()`.
- Listen for new messages and chat changes using `window.parent.eventSource`.
- Send new messages by calling `window.parent.send_chat_message()`.

This approach ensures that the custom UI is both powerful and well-isolated, preventing CSS or JavaScript conflicts.