chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getScrollPosition") {
    
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    ) - window.innerHeight;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
    
    console.log(`[Grains] Calculated scroll: ${scrollTop} / ${scrollHeight} = ${scrollPercent}%`);
    
    sendResponse({ scrollPos: scrollPercent });
  }
  return true; 
});

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

      attemptScroll();
      setTimeout(attemptScroll, 1000);
    }
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  restoreScroll();
} else {
  window.addEventListener('DOMContentLoaded', restoreScroll);
}


const urlParams = new URLSearchParams(window.location.search);
const activeGrainId = urlParams.get('g_id');

if (activeGrainId) {
  console.log(`[Grains] Auto-save active for Grain ID: ${activeGrainId}`);
  let saveTimeout;

  const saveProgress = () => {
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    ) - window.innerHeight;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

    try {
      chrome.runtime.sendMessage({
        action: 'autoSaveScroll',
        payload: {
          grain_id: activeGrainId,
          scroll_pos: scrollPercent
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("[Grains] Auto-save skipped: Extension updated. Please refresh the page.");
          return;
        }

        if (response && response.success) {
          console.log(`[Grains] Auto-saved progress: ${scrollPercent}%`);
        } else {
          console.error("[Grains] Auto-save failed via background", response?.error);
        }
      });
    } catch (error) {
      console.warn("[Grains] Extension context invalidated. Please refresh the page.");
    }
  };

  window.addEventListener('scroll', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveProgress, 2000);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveProgress();
    }
  });
}