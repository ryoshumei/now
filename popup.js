
// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const formatSelect = document.getElementById('timeFormat');
    const customFormatDiv = document.getElementById('customFormatDiv');
    const customFormatInput = document.getElementById('customFormat');
    const previewText = document.getElementById('previewText');

    // Load saved format
    chrome.storage.sync.get(['timeFormat', 'customFormat'], function(result) {
        if (result.timeFormat) {
            formatSelect.value = result.timeFormat;
            if (result.timeFormat === 'custom' && result.customFormat) {
                customFormatInput.value = result.customFormat;
                customFormatDiv.style.display = 'block';
            }
        }
        updatePreview();
    });

    // Listen for format selection changes
    formatSelect.addEventListener('change', function() {
        const isCustom = this.value === 'custom';
        customFormatDiv.style.display = isCustom ? 'block' : 'none';

        // Save settings
        chrome.storage.sync.set({
            timeFormat: this.value,
            customFormat: isCustom ? customFormatInput.value : ''
        });

        updatePreview();
    });

    // Listen for custom format input changes
    customFormatInput.addEventListener('input', function() {
        chrome.storage.sync.set({
            customFormat: this.value
        });
        updatePreview();
    });

    // Update preview
    function updatePreview() {
        const format = formatSelect.value === 'custom' ?
            customFormatInput.value :
            formatSelect.value;

        const now = new Date();
        const formattedTime = formatTime.getFormattedTime(now, format);
        previewText.textContent = formattedTime;
    }

    // Update preview every second
    setInterval(updatePreview, 1000);
});