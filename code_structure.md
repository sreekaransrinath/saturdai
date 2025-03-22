saturdai/
├── manifest.json
├── background.js         (or service-worker.js, if using Manifest V3 Service Workers)
├── content-scripts/
│   ├── content-script.js
│   └── platforms.js      (platform-specific helpers, e.g., Twitter, LinkedIn)
├── popup/
│   ├── popup.html
│   └── popup.js
├── options/
│   ├── options.html
│   └── options.js
├── LLMService.js         (placeholder for future AI integration)
├── utils.js              (common utility functions, if needed)
├── icons/                (extension icons in various sizes)
├── tests/
│   ├── playwright.config.js
│   ├── e2e/
│   │   └── e2e.spec.js
│   └── unit/
│       └── ...
└── README.md
