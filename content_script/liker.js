// YouTube Auto-Liker for subscribed channels

let lastUrl = location.href;
let isProcessing = false;

const attemptLike = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const result = await chrome.storage.sync.get(['subscriberList']);
        const subscribers = result.subscriberList || [];
        
        if (subscribers.length === 0) {
            console.log('[YouTube Liker] No subscribers in list');
            isProcessing = false;
            return;
        }

        // Wait for the channel name element to appear
        const channelElement = await waitForElement(
            'ytd-watch-metadata ytd-channel-name yt-formatted-string a, ' +
            '#owner #channel-name a, ' +
            'ytd-video-owner-renderer #channel-name a'
        );

        if (!channelElement) {
            console.error('[YouTube Liker] Unable to find channel name element');
            isProcessing = false;
            return;
        }

        // Get both the display name and the handle from the channel link
        const channelDisplayName = channelElement.textContent.trim();
        const channelHref = channelElement.getAttribute('href') || '';
        
        // Extract handle from href (e.g., "/@mkbhd" -> "mkbhd")
        const handleMatch = channelHref.match(/\/@([^\/]+)/);
        const channelHandle = handleMatch ? handleMatch[1] : '';
        
        console.log('[YouTube Liker] Current channel:', channelDisplayName, '| Handle:', channelHandle);

        // Check if this channel is in our subscriber list
        // Match against display name OR handle (with or without @)
        const isSubscribed = subscribers.some(sub => {
            const subLower = sub.toLowerCase().replace(/^@/, ''); // Remove leading @ if present
            return subLower === channelDisplayName.toLowerCase() ||
                   subLower === channelHandle.toLowerCase();
        });

        if (!isSubscribed) {
            console.log('[YouTube Liker] Channel not in subscriber list');
            isProcessing = false;
            return;
        }

        console.log('[YouTube Liker] Channel is in subscriber list, attempting to like...');

        // Wait for the like button to appear
        const likeButton = await waitForElement(
            'ytd-watch-metadata like-button-view-model button, ' +
            '#segmented-like-button button, ' +
            'ytd-menu-renderer like-button-view-model button, ' +
            '#top-level-buttons-computed like-button-view-model button'
        );

        if (!likeButton) {
            console.error('[YouTube Liker] Unable to find like button');
            isProcessing = false;
            return;
        }

        // Check if already liked (aria-pressed="true" means already liked)
        const isLiked = likeButton.getAttribute('aria-pressed') === 'true';

        if (isLiked) {
            console.log('[YouTube Liker] Video already liked');
        } else {
            likeButton.click();
            console.log('[YouTube Liker] Video liked!');
        }
    } catch (error) {
        console.error('[YouTube Liker] Error:', error);
    }

    isProcessing = false;
};

// Helper function to wait for an element to appear in the DOM
const waitForElement = (selector, timeout = 10000) => {
    return new Promise((resolve) => {
        // Check if element already exists
        const existing = document.querySelector(selector);
        if (existing) {
            resolve(existing);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Timeout fallback
        setTimeout(() => {
            observer.disconnect();
            resolve(document.querySelector(selector));
        }, timeout);
    });
};

// Handle YouTube's SPA navigation
const observeUrlChanges = () => {
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            // Only attempt to like on video pages
            if (location.href.includes('/watch')) {
                console.log('[YouTube Liker] URL changed, checking video...');
                // Give YouTube a moment to update the page content
                setTimeout(attemptLike, 2000);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

// Initial run
if (location.href.includes('/watch')) {
    setTimeout(attemptLike, 2000);
}

// Start observing for SPA navigation
observeUrlChanges();

console.log('[YouTube Liker] Extension loaded');
