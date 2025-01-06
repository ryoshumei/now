importScripts('timeFormatter.js');

function insertTime(format) {
    const now = new Date();
    return formatTime.getFormattedTime(now, format);
}

async function isAllowedUrl(tab) {
    // Check if the URL is accessible
    return tab.url && !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('edge://') &&
        !tab.url.startsWith('about:') &&
        !tab.url.startsWith('chrome-extension://');
}

async function showNotification(tabId, message) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (msg) => {
                // Create and show a temporary notification
                const notification = document.createElement('div');
                notification.textContent = msg;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #f44336;
                    color: white;
                    padding: 16px;
                    border-radius: 4px;
                    z-index: 10000;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                `;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            },
            args: [message],
        });
    } catch (err) {
        console.error('Could not show notification:', err);
    }
}

async function injectContentScript(tabId, timeFormat) {
    try {
        const tab = await chrome.tabs.get(tabId);

        // Check if we can access this page
        if (!await isAllowedUrl(tab)) {
            console.error('Cannot access this page type');
            return;
        }

        const formattedTime = insertTime(timeFormat);
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (time) => {
                const activeElement = document.activeElement;
                if (activeElement.isContentEditable ||
                    (activeElement.tagName === 'INPUT' && activeElement.type === 'text') ||
                    activeElement.tagName === 'TEXTAREA') {

                    const start = activeElement.selectionStart;
                    const end = activeElement.selectionEnd;
                    const text = activeElement.value || activeElement.textContent;
                    const newText = text.substring(0, start) + time + text.substring(end);

                    if (activeElement.isContentEditable) {
                        activeElement.textContent = newText;
                    } else {
                        activeElement.value = newText;
                    }
                }
            },
            args: [formattedTime]
        });
    } catch (err) {
        console.error('Failed to execute script:', err);
        if (err.message.includes('Cannot access')) {
            try {
                await showNotification(tabId, 'Cannot insert time in this page type');
            } catch (notifyErr) {
                console.error('Failed to show notification:', notifyErr);
            }
        }
    }
}

// create right click menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "insertTime",
        title: "Insert Current Time",
        contexts: ["editable"]
    });
});

// handle right click menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "insertTime") {
        try {
            const result = await chrome.storage.sync.get(['timeFormat', 'customFormat']);
            const format = result.timeFormat === 'custom' ?
                result.customFormat :
                (result.timeFormat || 'HH:mm');

            await injectContentScript(tab.id, format);
        } catch (err) {
            console.error('Error handling context menu click:', err);
        }
    }
});