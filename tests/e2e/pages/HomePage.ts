import { WebDriver, By, until } from "selenium-webdriver";

export class HomePage {
  private driver: WebDriver;
  private baseUrl: string;

  constructor(driver: WebDriver, baseUrl: string = "http://localhost:3001") {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async navigate(): Promise<void> {
    await this.driver.get(this.baseUrl);
  }

  async getPageTitle(): Promise<string> {
    return await this.driver.getTitle();
  }

  async waitForPageToLoad(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.css("body")), 10000);
  }
}
