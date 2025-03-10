import { WebDriver } from "selenium-webdriver";
import { setupDriver, teardownDriver } from "./helpers/setup";
import { SignUpPage } from "./pages/SignUpPage";
import { TestReportHelper, TestResult } from "./helpers/TestReportHelper";

describe("SignUp Page Tests", () => {
  let driver: WebDriver;
  let signUpPage: SignUpPage;
  let testName: string;
  // Track test results for reporting
  const testResults: TestResult[] = [];
  // Use testStartTime instead of the global startTime
  let testStartTime: number;

  beforeAll(async () => {
    driver = await setupDriver();
    signUpPage = new SignUpPage(driver);
  });

  afterAll(async () => {
    // Generate Excel report after all tests are completed
    try {
      const reportPath = await TestReportHelper.generateSuiteReport(
        "SignUp Page Tests",
        testResults
      );
      console.log(`Test report generated at: ${reportPath}`);
    } catch (error) {
      console.error("Failed to generate test report:", error);
    }

    await teardownDriver(driver);
  });

  beforeEach(async () => {
    // Reset the start time for each test
    testStartTime = Date.now();
    await signUpPage.navigate();
  });

  afterEach(async () => {
    const currentTest = expect.getState().currentTestName || "unknown_test";
    const testFailed = !!expect.getState().lastError;
    let screenshotPath: string | undefined;

    // Capture screenshot on test failure
    if (testFailed) {
      screenshotPath = await TestReportHelper.captureScreenshot(
        driver,
        currentTest
      );
      TestReportHelper.addScreenshotToReport(currentTest, screenshotPath);
    }

    // Record test result with accurate duration
    const testResult: TestResult = {
      testName: currentTest,
      status: testFailed ? "FAILED" : "PASSED",
      duration: Date.now() - testStartTime, // Use testStartTime here
      timestamp: Date.now(),
      screenshotPath: screenshotPath,
      errorMessage: testFailed
        ? expect.getState().lastError?.message
        : undefined,
    };

    testResults.push(testResult);
  });

  test("should display error with existing username", async () => {
    testName = "should display error with existing username";
    const testTime = new Date().getTime();
    await signUpPage.signUp(
      "admin",
      `test${testTime}@example.com`,
      "Password123!",
      "Password123!"
    );

    const errorMessage = await signUpPage.getErrorMessage();
    expect(errorMessage).toContain("User already exists");
  });

  test("should display error with invalid email format", async () => {
    testName = "should display error with invalid email format";
    await signUpPage.signUp(
      "newuser123",
      "0911kiet@gmail",
      "Password123!",
      "Password123!"
    );

    const errorMessage = await signUpPage.getErrorMessage("email");
    expect(errorMessage).toContain("Invalid email address");
  });

  test("should display error with weak password", async () => {
    testName = "should display error with weak password";
    await signUpPage.signUp("newuser456", "test@example.com", "short", "short");

    const errorMessage = await signUpPage.getErrorMessage("password");
    expect(errorMessage).toContain(
      "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"
    );
  });

  test("should successfully create a new account", async () => {
    testName = "should successfully create a new account";
    const testTime = new Date().getTime();
    const username = `testuser${testTime}`;
    const email = `testuser${testTime}@example.com`;
    const password = "SecurePassword123!";

    await signUpPage.signUp(username, email, password, password);

    const successMessage = await signUpPage.getSuccessMessage();
    expect(successMessage).toContain("Sign up successfully, redirecting...");
  });
});
