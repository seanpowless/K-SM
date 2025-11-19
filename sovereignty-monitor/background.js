// Track blocked requests
let blockedRequests = [];
let allowedRequests = [];
let stats = {
  totalBlocked: 0,
  totalAllowed: 0,
  sessionStart: Date.now()
};

// User-defined lists (loaded from storage)
let userBlacklist = [];
let userWhitelist = [];

// Known trackers and telemetry domains
const KNOWN_TRACKERS = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com/tr',
  'doubleclick.net',
  'mixpanel.com',
  'segment.com',
  'segment.io',
  'amplitude.com',
  'fullstory.com',
  'hotjar.com',
  'mouseflow.com',
  'crazyegg.com',
  'optimizely.com',
  'intercom.io',
  'heap.io',
  'pendo.io',
  'logrocket.com',
  'quantummetric.com',
  'snowplow.io'
];

// AI-specific telemetry endpoints
const AI_TELEMETRY = [
  'api.segment.io/v1/t',
  'api.mixpanel.com/track',
  'amplitude.com/api',
  'sentry.io/api',
  'o0.ingest.sentry.io',
  'o1.ingest.sentry.io',
  'o2.ingest.sentry.io',
  'api.openai.com/v1/telemetry',
  'api.anthropic.com/telemetry'
];

// Load user lists from storage
async function loadUserLists() {
  const result = await chrome.storage.local.get(['blacklist', 'whitelist']);
  userBlacklist = result.blacklist || [];
  userWhitelist = result.whitelist || [];
  console.log('📋 Loaded blacklist:', userBlacklist.length, 'domains');
  console.log('📋 Loaded whitelist:', userWhitelist.length, 'domains');
}

// Listen for all requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    const timestamp = Date.now();

    // Check if should be blocked
    const isBlocked = shouldBlock(url);

    const requestLog = {
      url: url,
      type: details.type,
      timestamp: timestamp,
      tabId: details.tabId,
      initiator: details.initiator || 'unknown'
    };

    if (isBlocked) {
      blockedRequests.unshift(requestLog);
      if (blockedRequests.length > 1000) blockedRequests.pop();
      stats.totalBlocked++;

      console.log('🚫 Blocked:', url);

      // Update badge
      updateBadge();
    } else {
      allowedRequests.unshift(requestLog);
      if (allowedRequests.length > 1000) allowedRequests.pop();
      stats.totalAllowed++;
    }

    // Save to storage periodically
    if ((stats.totalBlocked + stats.totalAllowed) % 10 === 0) {
      saveStats();
    }
  },
  { urls: ["<all_urls>"] }
);

function shouldBlock(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const fullUrl = url.toLowerCase();

    // First check whitelist - if whitelisted, always allow
    if (userWhitelist.some(domain => hostname.includes(domain) || fullUrl.includes(domain))) {
      return false;
    }

    // Check user blacklist
    if (userBlacklist.some(domain => hostname.includes(domain) || fullUrl.includes(domain))) {
      return true;
    }

    // Check known trackers
    if (KNOWN_TRACKERS.some(tracker => hostname.includes(tracker) || fullUrl.includes(tracker))) {
      return true;
    }

    // Check AI telemetry
    if (AI_TELEMETRY.some(endpoint => fullUrl.includes(endpoint))) {
      return true;
    }

    // Pattern matching for common telemetry paths
    if (fullUrl.match(/\/(analytics|telemetry|tracking|metrics|events|collect|track|beacon)\b/i)) {
      return true;
    }

    // Pattern matching for common tracking parameters
    if (fullUrl.match(/[?&](utm_|fbclid|gclid|mc_|_ga)/i)) {
      return true;
    }

  } catch (e) {
    // Invalid URL, don't block
    return false;
  }

  return false;
}

function updateBadge() {
  const count = stats.totalBlocked;
  const text = count > 999 ? '999+' : count.toString();

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
}

async function saveStats() {
  await chrome.storage.local.set({
    stats,
    blockedRequests: blockedRequests.slice(0, 100), // Keep last 100
    allowedRequests: allowedRequests.slice(0, 100)
  });
}

// Reset stats on new session
chrome.runtime.onStartup.addListener(() => {
  stats = {
    totalBlocked: 0,
    totalAllowed: 0,
    sessionStart: Date.now()
  };
  blockedRequests = [];
  allowedRequests = [];
  updateBadge();
  loadUserLists();
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('🛡️ Sovereignty Monitor installed');
  updateBadge();
  loadUserLists();
});

// Message handler for popup and options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse({
      stats,
      blockedRequests: blockedRequests.slice(0, 50),
      allowedRequests: allowedRequests.slice(0, 50)
    });
  } else if (request.action === 'clearStats') {
    stats = {
      totalBlocked: 0,
      totalAllowed: 0,
      sessionStart: Date.now()
    };
    blockedRequests = [];
    allowedRequests = [];
    updateBadge();
    saveStats();
    sendResponse({ success: true });
  } else if (request.action === 'reloadLists') {
    loadUserLists();
    sendResponse({ success: true });
  }
  return true;
});

// Listen for storage changes (when user updates blacklist/whitelist)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.blacklist) {
      userBlacklist = changes.blacklist.newValue || [];
      console.log('🔄 Blacklist updated:', userBlacklist.length, 'domains');
    }
    if (changes.whitelist) {
      userWhitelist = changes.whitelist.newValue || [];
      console.log('🔄 Whitelist updated:', userWhitelist.length, 'domains');
    }
  }
});

// Load user lists on startup
loadUserLists();
