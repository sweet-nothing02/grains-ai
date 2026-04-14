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