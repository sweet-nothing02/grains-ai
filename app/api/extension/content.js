// extension/content.js

// 1. Listen for the popup asking for the scroll position
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getScrollPosition") {
    
    // Grab the maximum possible scroll height across all browsers/page types
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    ) - window.innerHeight;

    // Get exact current position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Calculate percentage
    const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    
    console.log(`[Grains] Calculated scroll: ${scrollTop} / ${scrollHeight} = ${scrollPercent}%`);
    
    sendResponse({ scrollPos: scrollPercent });
  }
  // Return true to indicate we wish to send a response asynchronously (best practice)
  return true; 
});

// 2. The "Jump Back In" Feature
function restoreScroll() {
  const params = new URLSearchParams(window.location.search);
  const scrollTarget = params.get('g_scroll');
  
  if (scrollTarget !== null) {
    const targetPercent = parseInt(scrollTarget, 10);
    console.log(`[Grains] Found scroll target: ${targetPercent}%`);
    
    if (!isNaN(targetPercent) && targetPercent > 0) {
      const attemptScroll = () => {
        const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
        const targetY = (targetPercent / 100) * scrollHeight;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        console.log(`[Grains] Scrolling to pixel: ${targetY}`);
      };

      // Fire immediately, and fire again after 1 second in case dynamic images pushed the page down
      attemptScroll();
      setTimeout(attemptScroll, 1000);
    }
  }
}

// Check if the page is already loaded. If so, run immediately. If not, listen for the event.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  restoreScroll();
} else {
  window.addEventListener('DOMContentLoaded', restoreScroll);
}

// --- AUTO-SAVE PROGRESS FEATURE ---

const API_PATCH_URL = 'http://localhost:3000/api/extension';
const urlParams = new URLSearchParams(window.location.search);
const activeGrainId = urlParams.get('g_id');

if (activeGrainId) {
  console.log(`[Grains] Auto-save active for Grain ID: ${activeGrainId}`);
  let saveTimeout;

  // Helper to calculate current % and send to server
  // Helper to calculate current % and send to server via Background Script
  const saveProgress = () => {
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    ) - window.innerHeight;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

    // Send the data to our privileged background script instead of fetching directly
    chrome.runtime.sendMessage({
      action: 'autoSaveScroll',
      payload: {
        grain_id: activeGrainId,
        scroll_pos: scrollPercent
      }
    }, (response) => {
      if (response && response.success) {
        console.log(`[Grains] Auto-saved progress: ${scrollPercent}%`);
      } else {
        console.error("[Grains] Auto-save failed via background", response?.error);
      }
    });
  };

  // Trigger 1: Debounced Scrolling (Waits until user stops scrolling for 2 seconds)
  window.addEventListener('scroll', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveProgress, 2000);
  });

  // Trigger 2: Tab Closed or Switched
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveProgress();
    }
  });
}