import { WebDriver } from "selenium-webdriver";
import { setupDriver, teardownDriver } from "./helpers/setup";
import { LoginPage } from "./pages/LoginPage";

describe("Login Page Tests", () => {
  let driver: WebDriver;
  let loginPage: LoginPage;

  beforeAll(async () => {
    driver = await setupDriver();
    loginPage = new LoginPage(driver);
  });

  afterAll(async () => {
    await teardownDriver(driver);
  });

  beforeEach(async () => {
    await loginPage.navigate();
  });

  test("should display error with user not found", async () => {
    await loginPage.login("user-does-not-exist", "correct-password");

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("User not found");
  });

  test("should display error with incorrect password", async () => {
    await loginPage.login("admin", "wrong-password");

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("Password does not match");
  });

  test("should login successfully", async () => {
    await loginPage.login("admin", "0911Kiet@");

    const successMessage = await loginPage.getSuccessMessage();
    expect(successMessage).toContain("Sign in successfully, redirecting...");
  });
});
