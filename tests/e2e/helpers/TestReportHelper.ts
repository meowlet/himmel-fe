import fs from "fs";
import path from "path";
import { WebDriver } from "selenium-webdriver";
import ExcelJS from "exceljs";

export class TestReportHelper {
  private static screenshotDir = "test-results/screenshots";
  private static reportDir = "test-results/reports";

  static async captureScreenshot(
    driver: WebDriver,
    testName: string
  ): Promise<string> {
    // Create directory if it doesn't exist
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Generate screenshot filename
    const timestamp = new Date().getTime();
    const fileName = `${testName.replace(/\s+/g, "_")}_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync(filePath, screenshot, "base64");

    return filePath;
  }

  static addScreenshotToReport(testName: string, screenshotPath: string): void {
    // This method can be extended to link screenshots to Excel report if needed
    console.log(
      `Screenshot saved for test "${testName}" at: ${screenshotPath}`
    );
  }

  /**
   * Generate an Excel report with test results
   * @param testResults Array of test result objects
   * @param reportName Name for the report file
   * @returns Path to the generated Excel file
   */
  static async generateExcelReport(
    testResults: TestResult[],
    reportName: string = "test-report"
  ): Promise<string> {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Himmel Test Automation";
    workbook.created = new Date();

    // Add a worksheet for test results
    const worksheet = workbook.addWorksheet("Test Results");

    // Define columns
    worksheet.columns = [
      { header: "Test Name", key: "testName", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Duration (ms)", key: "duration", width: 15 },
      { header: "Screenshot", key: "screenshot", width: 50 },
      { header: "Error Message", key: "errorMessage", width: 50 },
      { header: "Timestamp", key: "timestamp", width: 25 },
    ];

    // Add style to header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add test results to worksheet
    testResults.forEach((result) => {
      const row = {
        testName: result.testName,
        status: result.status,
        duration: result.duration,
        screenshot: result.screenshotPath || "N/A",
        errorMessage: result.errorMessage || "",
        timestamp: new Date(result.timestamp).toLocaleString(),
      };

      worksheet.addRow(row);

      // Add color based on status
      const lastRow = worksheet.lastRow;
      if (lastRow) {
        const statusCell = lastRow.getCell(2);
        if (result.status === "PASSED") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF90EE90" }, // Light green
          };
        } else if (result.status === "FAILED") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF9999" }, // Light red
          };
        }
      }
    });

    // Format the worksheet
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 6 },
    };

    // Save the workbook
    const timestamp = new Date().getTime();
    const fileName = `${reportName}_${timestamp}.xlsx`;
    const filePath = path.join(this.reportDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel report generated at: ${filePath}`);

    return filePath;
  }

  /**
   * Creates a summary report of all tests in a test suite
   * @param suiteName Name of the test suite
   * @param testResults Array of test results
   * @returns Path to the generated Excel file
   */
  static async generateSuiteReport(
    suiteName: string,
    testResults: TestResult[]
  ): Promise<string> {
    const passedTests = testResults.filter(
      (test) => test.status === "PASSED"
    ).length;
    const failedTests = testResults.filter(
      (test) => test.status === "FAILED"
    ).length;
    const totalDuration = testResults.reduce(
      (sum, test) => sum + test.duration,
      0
    );

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Himmel Test Automation";
    workbook.created = new Date();

    // Add a summary worksheet
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 20 },
      { header: "Value", key: "value", width: 20 },
    ];

    summarySheet.addRow({ metric: "Suite Name", value: suiteName });
    summarySheet.addRow({ metric: "Total Tests", value: testResults.length });
    summarySheet.addRow({ metric: "Passed Tests", value: passedTests });
    summarySheet.addRow({ metric: "Failed Tests", value: failedTests });
    summarySheet.addRow({
      metric: "Pass Rate",
      value: `${Math.round((passedTests / testResults.length) * 100)}%`,
    });
    summarySheet.addRow({
      metric: "Total Duration",
      value: `${(totalDuration / 1000).toFixed(2)}s`,
    });
    summarySheet.addRow({
      metric: "Executed At",
      value: new Date().toLocaleString(),
    });

    // Add details worksheet
    const detailsSheet = workbook.addWorksheet("Test Details");
    detailsSheet.columns = [
      { header: "Test Name", key: "testName", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Duration (ms)", key: "duration", width: 15 },
      { header: "Screenshot", key: "screenshot", width: 50 },
      { header: "Error Message", key: "errorMessage", width: 50 },
      { header: "Timestamp", key: "timestamp", width: 25 },
    ];

    // Add style to header rows
    [summarySheet, detailsSheet].forEach((sheet) => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });

    // Add test results to details worksheet
    testResults.forEach((result) => {
      detailsSheet.addRow({
        testName: result.testName,
        status: result.status,
        duration: result.duration,
        screenshot: result.screenshotPath || "N/A",
        errorMessage: result.errorMessage || "",
        timestamp: new Date(result.timestamp).toLocaleString(),
      });

      // Add color based on status
      const lastRow = detailsSheet.lastRow;
      if (lastRow) {
        const statusCell = lastRow.getCell(2);
        if (result.status === "PASSED") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF90EE90" }, // Light green
          };
        } else if (result.status === "FAILED") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF9999" }, // Light red
          };
        }
      }
    });

    // Save the workbook
    const timestamp = new Date().getTime();
    const fileName = `${suiteName.replace(
      /\s+/g,
      "_"
    )}_report_${timestamp}.xlsx`;
    const filePath = path.join(this.reportDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log(`Suite report generated at: ${filePath}`);

    return filePath;
  }
}

// Define interfaces for test results
export interface TestResult {
  testName: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  duration: number;
  timestamp: number;
  screenshotPath?: string;
  errorMessage?: string;
}
