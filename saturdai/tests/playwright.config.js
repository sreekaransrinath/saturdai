const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  use: {
    // Launch Chrome with the extension
    launchOptions: {
      args: [
        `--disable-extensions-except=${process.cwd()}/my-response-extension`,
        `--load-extension=${process.cwd()}/my-response-extension`
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
}); 