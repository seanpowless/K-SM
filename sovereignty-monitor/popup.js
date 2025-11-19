// Format domain from URL
function formatDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url.substring(0, 50) + '...';
  }
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format session duration
function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Load and display stats
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStats' });

    if (!response) {
      console.error('No response from background script');
      return;
    }

    // Update counters
    document.getElementById('blocked-count').textContent = response.stats.totalBlocked;
    document.getElementById('allowed-count').textContent = response.stats.totalAllowed;

    // Update session time
    const sessionDuration = Date.now() - response.stats.sessionStart;
    document.getElementById('session-time').textContent = `Session: ${formatDuration(sessionDuration)}`;

    // Update blocked list
    const blockedList = document.getElementById('blocked-list');
    if (response.blockedRequests.length === 0) {
      blockedList.innerHTML = '<div class="empty">No requests blocked yet</div>';
    } else {
      blockedList.innerHTML = response.blockedRequests.slice(0, 10).map(req => {
        const domain = formatDomain(req.url);
        const time = formatTime(req.timestamp);
        return `
          <div class="request-item">
            <div class="request-url">${escapeHtml(domain)}</div>
            <div class="request-meta">${escapeHtml(req.type)} • ${time}</div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Clear stats button
document.getElementById('clear-stats').addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'clearStats' });
    loadStats();
  } catch (error) {
    console.error('Error clearing stats:', error);
  }
});

// Open options button
document.getElementById('open-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Load stats on open
loadStats();

// Refresh every 2 seconds
setInterval(loadStats, 2000);
