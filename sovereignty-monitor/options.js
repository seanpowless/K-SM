// Default blacklist domains
const DEFAULT_BLACKLIST = [
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
  'sentry.io'
];

// Show success message
function showSuccess(elementId) {
  const element = document.getElementById(elementId);
  element.classList.add('show');
  setTimeout(() => {
    element.classList.remove('show');
  }, 3000);
}

// Update stats display
async function updateStats() {
  const { blacklist = [], whitelist = [], stats = {} } = await chrome.storage.local.get([
    'blacklist',
    'whitelist',
    'stats'
  ]);

  document.getElementById('blacklist-count').textContent = blacklist.length;
  document.getElementById('whitelist-count').textContent = whitelist.length;
  document.getElementById('total-blocked').textContent = stats.totalBlocked || 0;
}

// Load saved lists
async function loadLists() {
  const { blacklist = [], whitelist = [] } = await chrome.storage.local.get(['blacklist', 'whitelist']);

  document.getElementById('blacklist').value = blacklist.join('\n');
  document.getElementById('whitelist').value = whitelist.join('\n');

  updateStats();
}

// Save blacklist
document.getElementById('save-blacklist').addEventListener('click', async () => {
  const text = document.getElementById('blacklist').value;
  const blacklist = text
    .split('\n')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('#')); // Allow comments with #

  await chrome.storage.local.set({ blacklist });
  await chrome.runtime.sendMessage({ action: 'reloadLists' });

  showSuccess('blacklist-success');
  updateStats();
});

// Reset blacklist to default
document.getElementById('reset-blacklist').addEventListener('click', async () => {
  if (confirm('Reset blacklist to default tracker list?')) {
    document.getElementById('blacklist').value = DEFAULT_BLACKLIST.join('\n');
    await chrome.storage.local.set({ blacklist: DEFAULT_BLACKLIST });
    await chrome.runtime.sendMessage({ action: 'reloadLists' });

    showSuccess('blacklist-success');
    updateStats();
  }
});

// Save whitelist
document.getElementById('save-whitelist').addEventListener('click', async () => {
  const text = document.getElementById('whitelist').value;
  const whitelist = text
    .split('\n')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('#'));

  await chrome.storage.local.set({ whitelist });
  await chrome.runtime.sendMessage({ action: 'reloadLists' });

  showSuccess('whitelist-success');
  updateStats();
});

// Clear whitelist
document.getElementById('clear-whitelist').addEventListener('click', async () => {
  if (confirm('Clear all whitelisted domains?')) {
    document.getElementById('whitelist').value = '';
    await chrome.storage.local.set({ whitelist: [] });
    await chrome.runtime.sendMessage({ action: 'reloadLists' });

    showSuccess('whitelist-success');
    updateStats();
  }
});

// Export report
document.getElementById('export-report').addEventListener('click', async () => {
  const { blockedRequests = [], stats = {} } = await chrome.storage.local.get([
    'blockedRequests',
    'stats'
  ]);

  if (blockedRequests.length === 0) {
    alert('No blocked requests to export.');
    return;
  }

  // Create CSV content
  const csv = [
    ['Timestamp', 'URL', 'Type', 'Initiator', 'Tab ID'],
    ...blockedRequests.map(req => [
      new Date(req.timestamp).toISOString(),
      req.url,
      req.type,
      req.initiator || 'unknown',
      req.tabId || 'unknown'
    ])
  ]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Add summary header
  const summary = `# Sovereignty Monitor Report
# Generated: ${new Date().toISOString()}
# Total Blocked: ${stats.totalBlocked || blockedRequests.length}
# Session Start: ${new Date(stats.sessionStart).toISOString()}
#
`;

  const fullContent = summary + csv;

  // Download file
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sovereignty-monitor-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// View logs (opens background page console)
document.getElementById('view-logs').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'chrome://extensions/?id=' + chrome.runtime.id
  });
});

// Clear all data
document.getElementById('clear-all-data').addEventListener('click', async () => {
  const confirmed = confirm(
    'This will clear all blocked request history and stats. Your blacklist and whitelist will be preserved. Continue?'
  );

  if (confirmed) {
    await chrome.runtime.sendMessage({ action: 'clearStats' });
    await chrome.storage.local.remove(['blockedRequests', 'allowedRequests', 'stats']);

    alert('All data cleared!');
    updateStats();
  }
});

// Initialize on load
loadLists();

// Auto-save on textarea change (debounced)
let saveTimeout;
function setupAutoSave(textareaId, storageKey, successId) {
  document.getElementById(textareaId).addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const text = document.getElementById(textareaId).value;
      const list = text
        .split('\n')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('#'));

      await chrome.storage.local.set({ [storageKey]: list });
      await chrome.runtime.sendMessage({ action: 'reloadLists' });
      updateStats();
    }, 2000); // Auto-save after 2 seconds of inactivity
  });
}

// Enable auto-save (optional - uncomment to enable)
// setupAutoSave('blacklist', 'blacklist', 'blacklist-success');
// setupAutoSave('whitelist', 'whitelist', 'whitelist-success');
