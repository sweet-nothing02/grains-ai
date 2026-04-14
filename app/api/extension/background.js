// extension/background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autoSaveScroll') {
    
    // The background script has permission to fetch localhost!
    fetch('http://localhost:3000/api/extension', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));

    // Return true to keep the message channel open for the async fetch
    return true; 
  }
});