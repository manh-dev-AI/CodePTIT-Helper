/**
 * CodePTIT Helper - Background Service Worker
 * Handles keyboard shortcuts, downloads, and VS Code integration
 */

// Forward keyboard shortcut commands to content script
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.includes('code.ptit.edu.vn')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'keyboard-shortcut',
        command: command,
      });
    }
  } catch (e) {
    console.error('[CodePTIT Helper] Error forwarding command:', e);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // CPH (Competitive Programming Helper for VS Code) integration
  // POST { name, url, tests: [{input, output}] } to CPH localhost:27121
  // CPH will show a language picker in VS Code, create the file, and load test cases
  if (request.action === 'sendToCPH') {
    fetch('http://localhost:27121/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.data),
    })
      .then(response => sendResponse({ success: response.ok }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  // Download a file
  if (request.action === 'downloadFile') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: false,
    }, (downloadId) => {
      sendResponse({ success: !!downloadId });
    });
    return true;
  }

  // Download file then open in VS Code (fallback when CPH is not running)
  if (request.action === 'openInVSCode') {
    const { filename, content } = request;

    // Create a blob URL from the content
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Download to the default downloads folder with the desired filename
    chrome.downloads.download({
      url: url,
      filename: filename,
      conflictAction: 'overwrite',
      saveAs: false,
    }, (downloadId) => {
      if (!downloadId) {
        URL.revokeObjectURL(url);
        sendResponse({ success: false, error: 'Download failed' });
        return;
      }

      // Wait for download to complete, then open in VS Code
      const onChanged = (delta) => {
        if (delta.id !== downloadId) return;
        if (delta.state?.current === 'complete') {
          chrome.downloads.onChanged.removeListener(onChanged);
          URL.revokeObjectURL(url);

          chrome.downloads.search({ id: downloadId }, (results) => {
            if (results?.length > 0 && results[0].filename) {
              const filePath = results[0].filename;
              const vscodeUri = `vscode://file/${filePath.replace(/\\/g, '/')}`;

              // Use the sender tab (the CodePTIT page itself) to navigate
              // to the vscode:// URI — Chrome hands it off to VS Code
              // without creating a new orphaned tab.
              const tabId = sender?.tab?.id;
              if (tabId) {
                // Save the original URL so we can navigate back
                chrome.tabs.get(tabId, (tab) => {
                  const originalUrl = tab.url;
                  chrome.tabs.update(tabId, { url: vscodeUri }, () => {
                    // After 600 ms VS Code has taken over; restore the tab
                    setTimeout(() => {
                      chrome.tabs.update(tabId, { url: originalUrl });
                    }, 600);
                    sendResponse({ success: true, filePath });
                  });
                });
              } else {
                // No sender tab available — create a temporary tab
                chrome.tabs.create({ url: vscodeUri }, (newTab) => {
                  setTimeout(() => chrome.tabs.remove(newTab.id), 1000);
                  sendResponse({ success: true, filePath });
                });
              }
            } else {
              sendResponse({ success: false, error: 'Could not get file path' });
            }
          });
        } else if (delta.state?.current === 'interrupted') {
          chrome.downloads.onChanged.removeListener(onChanged);
          URL.revokeObjectURL(url);
          sendResponse({ success: false, error: 'Download interrupted' });
        }
      };

      chrome.downloads.onChanged.addListener(onChanged);
    });
    return true; // Keep channel open for async response
  }
});
