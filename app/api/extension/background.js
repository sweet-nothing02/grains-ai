chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autoSaveScroll') {
    
    fetch('http://localhost:3000/api/extension', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request.payload)
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API rejected request');
      sendResponse({ success: true, data });
    })
    .catch(err => {
      console.error("[Grains Background] Patch Error:", err);
      sendResponse({ success: false, error: err.message });
    });

    return true; 
  }
});