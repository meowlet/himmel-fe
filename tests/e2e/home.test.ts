import { WebDriver } from "selenium-webdriver";
import { setupDriver, teardownDriver } from "./helpers/setup";
import { HomePage } from "./pages/HomePage";

describe("Home Page Tests", () => {
  let driver: WebDriver;
  let homePage: HomePage;

  beforeAll(async () => {
    driver = await setupDriver();
    homePage = new HomePage(driver);
  });

  afterAll(async () => {
    await teardownDriver(driver);
  });

  test("should load the home page", async () => {
    await homePage.navigate();

    await homePage.waitForPageToLoad();

    const title = await homePage.getPageTitle();
    expect(title).toBeDefined();
  });
});
