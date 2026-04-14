const API_URL = 'http://localhost:3000/api/extension';

document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('category-select');
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');
  const authWarning = document.getElementById('auth-warning');

  // 1. Fetch Categories (The Handshake)
  try {
    const response = await fetch(API_URL);
    
    if (response.status === 401) {
      authWarning.style.display = 'block';
      select.disabled = true;
      saveBtn.disabled = true;
      select.innerHTML = '<option>Unauthorized</option>';
      return;
    }

    const { categories } = await response.json();
    
    // Populate the dropdown
    select.innerHTML = '<option value="uncategorized">Uncategorized</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  } catch (err) {
    status.textContent = "Error connecting to app.";
  }

  // 2. Handle the "Capture Grain" button
  saveBtn.addEventListener('click', async () => {
    status.textContent = 'Saving...';
    saveBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      const categoryId = select.value;

      // Ask the content script for the scroll position
      chrome.tabs.sendMessage(currentTab.id, { action: "getScrollPosition" }, async (response) => {
        // If content script doesn't respond (e.g., on a chrome:// page), default to 0
        const scrollPos = response ? response.scrollPos : 0;

        try {
          const apiRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: currentTab.url,
              category_id: categoryId,
              scroll_pos: scrollPos // Sending the real number now!
            })
          });

          if (apiRes.ok) {
            status.textContent = 'Saved successfully!';
            setTimeout(() => window.close(), 1500);
          } else {
            status.textContent = 'Failed to save.';
            saveBtn.disabled = false;
          }
        } catch (err) {
          status.textContent = 'Network error.';
          saveBtn.disabled = false;
        }
      });
    });
  });
});