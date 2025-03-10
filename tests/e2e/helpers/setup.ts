import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export async function setupDriver(): Promise<WebDriver> {
  // Thiết lập options cho Chrome
  const options = new chrome.Options();
  
  // Chạy ở chế độ headless trong CI/CD, comment dòng này nếu muốn xem browser khi chạy test
  // options.headless();
  
  // Khởi tạo WebDriver
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  // Thiết lập timeout mặc định cho việc tìm elements
  await driver.manage().setTimeouts({ implicit: 10000 });
  
  return driver;
}

export async function teardownDriver(driver: WebDriver): Promise<void> {
  if (driver) {
    await driver.quit();
  }
}
