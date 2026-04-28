const API_URL = 'http://localhost:3000/api/extension';

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');

  saveBtn.addEventListener('click', async () => {
    status.textContent = 'AI is reading & organizing...';
    saveBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];

      chrome.tabs.sendMessage(currentTab.id, { action: "getScrollPosition" }, async (response) => {
        const scrollPos = (response && response.scrollPos !== undefined) ? response.scrollPos : 0;

        try {
          const apiRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              url: currentTab.url,
              category_id: 'uncategorized', // Hardcode this so AI always categorizes
              scroll_pos: scrollPos
            })
          });

          if (apiRes.ok) {
            status.textContent = 'Saved successfully!';
            saveBtn.style.background = '#16a34a';
            setTimeout(() => window.close(), 1500);
          } else {
            status.textContent = 'Failed to save.';
          }
        } catch (err) {
          status.textContent = 'Network error.';
        }
      });
    });
  });
});