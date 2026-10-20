const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// Setup Chrome options
const getChromeOptions = () => {
  const options = new chrome.Options();

  // Uncomment untuk headless mode (testing tanpa buka browser)
  // options.addArguments('--headless');

  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  return options;
};

// Build WebDriver
const buildDriver = async () => {
  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(getChromeOptions())
    .build();
};

// Close driver
const closeDriver = async (driver) => {
  await driver.quit();
};

module.exports = {
  buildDriver,
  closeDriver,
  BASE_URL: "http://localhost:5173", // Frontend URL
};
