# SaturdAI

A Chrome browser extension that generates and populates text responses on social media platforms. Currently supports Twitter/X and LinkedIn.

## Features

- Right-click context menu integration
- Automatic response generation
- Support for Twitter/X and LinkedIn
- Future integration with Large Language Models (LLMs)

## Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `saturdai` directory

## Project Structure

```
saturdai/
├── manifest.json
├── background.js
├── content-scripts/
│   ├── content-script.js
│   └── platforms.js
├── popup/
│   ├── popup.html
│   └── popup.js
├── options/
│   ├── options.html
│   └── options.js
├── LLMService.js
├── utils.js
├── icons/
└── tests/
    ├── playwright.config.js
    └── e2e/
        └── e2e.spec.js
```

## Testing

To run the end-to-end tests:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npx playwright test
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 