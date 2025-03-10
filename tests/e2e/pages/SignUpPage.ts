import { WebDriver, By, until } from "selenium-webdriver";

export class SignUpPage {
  private driver: WebDriver;
  private baseUrl: string;

  constructor(driver: WebDriver, baseUrl: string = "http://localhost:3001") {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async navigate(): Promise<void> {
    await this.driver.get(`${this.baseUrl}/sign-up`);
  }

  async enterUsername(username: string): Promise<void> {
    const usernameInput = await this.driver.findElement(By.id("username"));
    await usernameInput.clear();
    await usernameInput.sendKeys(username);
  }

  async enterPassword(password: string): Promise<void> {
    const passwordInput = await this.driver.findElement(By.id("password"));
    await passwordInput.clear();
    await passwordInput.sendKeys(password);
  }

  async enterEmail(email: string): Promise<void> {
    const emailInput = await this.driver.findElement(By.id("email"));
    await emailInput.clear();
    await emailInput.sendKeys(email);
  }

  async clickSignUpButton(): Promise<void> {
    const signUpButton = await this.driver.findElement(
      By.css('button[type="submit"]')
    );
    await signUpButton.click();
  }

  async signUp(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await this.enterUsername(username);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.checkTermsAndConditions();
    await this.clickSignUpButton();
  }

  async getErrorMessage(name?: string): Promise<string> {
    const errorElement = await this.driver.wait(
      until.elementLocated(
        By.className(name ? `${name}-error` : "error-message")
      ),
      5000
    );
    return await errorElement.getText();
  }

  async getSuccessMessage(): Promise<string> {
    const successElement = await this.driver.wait(
      until.elementLocated(By.className("success-message")),
      5000
    );
    return await successElement.getText();
  }

  async checkTermsAndConditions(): Promise<void> {
    const checkbox = await this.driver.findElement(
      By.className("terms-checkbox")
    );
    await checkbox.click();
  }
}
