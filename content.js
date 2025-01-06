chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertTime") {
        const activeElement = document.activeElement;
        if (activeElement.isContentEditable ||
            (activeElement.tagName === 'INPUT' && activeElement.type === 'text') ||
            activeElement.tagName === 'TEXTAREA') {

            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;
            const text = activeElement.value || activeElement.textContent;
            const newText = text.substring(0, start) + request.time + text.substring(end);

            if (activeElement.isContentEditable) {
                activeElement.textContent = newText;
            } else {
                activeElement.value = newText;
            }
        }
    }
});