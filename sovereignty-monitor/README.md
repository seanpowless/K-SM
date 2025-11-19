# Sovereignty Monitor

**Your browser. Your rules. Your sovereignty.**

A privacy-focused browser extension that monitors, blocks, and reports telemetry, tracking, and data exfiltration attempts from websites. Built with Manifest V3 for Chrome/Edge.

## Features

- **Real-time Request Monitoring** - Track all outgoing requests from websites
- **Telemetry Detection** - Identify and block analytics, tracking, and telemetry
- **Live Dashboard** - See blocked requests in real-time with detailed stats
- **Domain Management** - Easy blacklist/whitelist control
- **Export Reports** - Download CSV reports of blocked requests
- **Privacy First** - No data collection, all logs stay local
- **Zero Performance Impact** - Efficient blocking using declarativeNetRequest API

## What Gets Blocked?

### Known Trackers
- Google Analytics, Google Tag Manager
- Facebook Pixel
- Mixpanel, Segment, Amplitude
- Hotjar, FullStory, LogRocket
- Optimizely, Intercom, Heap
- And many more...

### AI Site Telemetry
- Segment analytics (used by Claude, ChatGPT, many AI sites)
- Sentry error tracking
- Custom telemetry endpoints
- Session replay tools

### Pattern Matching
- URLs containing: `analytics`, `telemetry`, `tracking`, `metrics`, `beacon`
- Tracking parameters: `utm_*`, `fbclid`, `gclid`, `_ga`

## Installation

### Chrome/Edge (Developer Mode)

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/sovereignty-monitor.git
   cd sovereignty-monitor
   ```

2. **Generate icons** (optional but recommended)
   ```bash
   cd icons
   # If you have ImageMagick:
   bash generate-icons.sh

   # Or if you have Python with Pillow:
   python3 generate-icons.py

   # Or use placeholder icons (already created):
   bash create-placeholders.sh
   ```

3. **Load extension in Chrome/Edge**
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `sovereignty-monitor` folder
   - The extension should now appear in your toolbar

4. **Pin the extension** (optional)
   - Click the puzzle icon in the toolbar
   - Find "Sovereignty Monitor"
   - Click the pin icon to keep it visible

## Usage

### Dashboard

Click the extension icon to open the real-time dashboard:

- **Blocked Counter** - Total requests blocked this session
- **Allowed Counter** - Total requests allowed
- **Recent Blocks** - Live feed of blocked requests
- **Session Timer** - How long the extension has been running

### Managing Rules

Click "Manage Rules" in the popup to configure blocking:

#### Blacklist
Add domains or patterns to block (one per line):
```
google-analytics.com
mixpanel.com
segment.io
facebook.com/tr
telemetry
```

Supports:
- Full domains: `google-analytics.com`
- Partial matches: `analytics` (blocks anything containing "analytics")
- URL paths: `facebook.com/tr`
- Comments: Lines starting with `#` are ignored

#### Whitelist
Add domains to always allow, even if they match blacklist patterns:
```
my-trusted-site.com
essential-analytics.mysite.com
```

**Note:** Whitelist takes precedence over blacklist.

### Exporting Reports

1. Open the options page (Manage Rules)
2. Scroll to "Export Blocked Requests"
3. Click "Export CSV Report"
4. Save the CSV file with detailed blocking history

CSV includes:
- Timestamp
- Full URL
- Request type
- Initiator (which site made the request)
- Tab ID

## Architecture

```
┌─────────────────────────────────────┐
│         Website Loads Page          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Sovereignty Monitor Intercepts     │
│       All Network Requests          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Check Against Rules:            │
│  ✓ Known trackers list              │
│  ✓ AI telemetry endpoints           │
│  ✓ User blacklist                   │
│  ✓ Pattern matching                 │
│  ✓ User whitelist (override)        │
└────────────┬────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
    Block      Allow
        │         │
        └────┬────┘
             │
             ▼
┌─────────────────────────────────────┐
│    Update Dashboard & Logs          │
└─────────────────────────────────────┘
```

## File Structure

```
sovereignty-monitor/
├── manifest.json           # Extension configuration (Manifest V3)
├── background.js          # Service worker - request monitoring
├── popup.html            # Dashboard UI
├── popup.js              # Dashboard logic
├── options.html          # Settings page UI
├── options.js            # Settings page logic
├── rules.json            # declarativeNetRequest blocking rules
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon.svg          # Source SVG
│   └── README.md         # Icon generation instructions
└── README.md             # This file
```

## Privacy & Security

### What This Extension Does

✅ Monitors outgoing network requests
✅ Blocks known trackers and telemetry
✅ Stores logs locally on your device
✅ Provides visibility into data exfiltration

### What This Extension Does NOT Do

❌ Send your data anywhere
❌ Track your browsing
❌ Communicate with external servers
❌ Modify page content
❌ Access your passwords or personal data

### Permissions Explained

- `declarativeNetRequest` - Block requests using efficient browser API
- `declarativeNetRequestFeedback` - Get feedback on blocked requests
- `storage` - Save your blacklist/whitelist locally
- `tabs` - Know which tab made a request (for logging)
- `webRequest` - Monitor all network requests
- `<all_urls>` - Monitor requests to any website

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/yourusername/sovereignty-monitor.git
cd sovereignty-monitor

# Generate icons (requires ImageMagick or Python/Pillow)
cd icons
bash generate-icons.sh
# or
python3 generate-icons.py

# Load in Chrome as described in Installation section
```

### Testing

Test the extension on various websites:

1. **News sites** - Should block analytics
2. **Social media** - Should block trackers
3. **AI sites** (Claude, ChatGPT) - Should block telemetry
4. **Your own site** - Add to whitelist to verify allow rules work

### Customizing

- **Add more trackers**: Edit `background.js` → `KNOWN_TRACKERS` array
- **Add AI telemetry endpoints**: Edit `background.js` → `AI_TELEMETRY` array
- **Modify UI**: Edit `popup.html` and `options.html`
- **Change blocking rules**: Edit `rules.json`

## Troubleshooting

### Extension won't load
- Make sure you're in Developer Mode
- Check that manifest.json is valid JSON
- Verify all referenced files exist

### Nothing is being blocked
- Check the blacklist in options page
- Open browser console (F12) and look for errors
- Verify the extension icon shows a badge counter

### Too many things blocked / Site broken
- Add the site to your whitelist
- Check Recent Blocks to see what was blocked
- Temporarily disable the extension to verify it's the cause

### Badge not updating
- The badge updates every request, but may not be visible immediately
- Try refreshing the page
- Check background.js console for errors

## Roadmap

- [ ] Import/export blacklist/whitelist
- [ ] Per-site enable/disable toggle
- [ ] Advanced filtering rules (regex support)
- [ ] Temporary allow (allow for X minutes)
- [ ] Statistics dashboard (charts, graphs)
- [ ] Firefox support
- [ ] Sync settings across devices
- [ ] Custom rule categories

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- **Issues**: https://github.com/yourusername/sovereignty-monitor/issues
- **Discussions**: https://github.com/yourusername/sovereignty-monitor/discussions

## Philosophy

In an age of pervasive tracking and telemetry, individuals should have sovereignty over their digital presence. This extension embodies the principle that **you should control what data leaves your browser**, not corporations or websites.

Sovereignty Monitor is:
- **Transparent** - You can see exactly what's blocked
- **Controllable** - You decide what to allow or block
- **Private** - No data leaves your device
- **Empowering** - Knowledge is power

**Your browser. Your rules. Your sovereignty.** 🛡️

---

Made with privacy in mind.
