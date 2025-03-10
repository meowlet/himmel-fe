import { WebDriver, By, until } from "selenium-webdriver";

export class LoginPage {
  private driver: WebDriver;
  private baseUrl: string;

  constructor(driver: WebDriver, baseUrl: string = "http://localhost:3001") {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async navigate(): Promise<void> {
    await this.driver.get(`${this.baseUrl}/sign-in`);
  }

  async enterUsername(username: string): Promise<void> {
    const usernameInput = await this.driver.findElement(
      By.className("identifier")
    );
    await usernameInput.clear();
    await usernameInput.sendKeys(username);
  }

  async enterPassword(password: string): Promise<void> {
    const passwordInput = await this.driver.findElement(
      By.className("password")
    );
    await passwordInput.clear();
    await passwordInput.sendKeys(password);
  }

  async clickLoginButton(): Promise<void> {
    const loginButton = await this.driver.findElement(
      By.css('button[type="submit"]')
    );
    await loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = await this.driver.wait(
      until.elementLocated(By.className("error-message")),
      5000
    );
    return await errorElement.getText();
  }

  async getSuccessMessage() {
    const successElement = this.driver.wait(
      until.elementLocated(By.className("success-message")),
      5000
    );
    return await successElement.getText();
  }
}
