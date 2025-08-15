import { Builder, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

export async function setupDriver(): Promise<WebDriver> {
  const options = new chrome.Options();

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 10000 });

  return driver;
}

export async function teardownDriver(driver: WebDriver): Promise<void> {
  if (driver) {
    await driver.quit();
  }
}
