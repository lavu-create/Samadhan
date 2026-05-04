package com.samadhaan;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * SamadhaanTest.java
 * ──────────────────
 * TestNG test suite for the Samadhaan Complaint Management System.
 *
 * Run via Maven  :  mvn test
 * Run via ANT    :  ant report   (generates XSLT_Report.html)
 *
 * Reports generated automatically:
 *   test-output/emailable-report.html   ← Emailable report
 *   test-output/index.html              ← Full index report
 *   test-output/XSLT_Report.html        ← XSLT report (via ANT)
 */
public class SamadhaanTest {

    private WebDriver driver;
    private static final String BASE_URL = "http://localhost:5173";

    // ── Setup ─────────────────────────────────────────────────────────────────

    @BeforeClass
    public void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        // Run headless so tests work in CI / lab environments
        options.addArguments("--headless=new");
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1280,900");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");

        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        System.out.println("[Setup] ChromeDriver initialized.");
    }

    // ── Tear Down ─────────────────────────────────────────────────────────────

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
            System.out.println("[Teardown] ChromeDriver closed.");
        }
    }

    // ── TC-01: Verify app loads ───────────────────────────────────────────────

    /**
     * PASS: Opens the Samadhaan frontend and checks the page title
     * contains "Samadhaan" (case-insensitive check on page source).
     */
    @Test(priority = 1, description = "TC-01: Homepage loads and contains 'Samadhaan' in page source")
    public void testHomepageLoads() {
        driver.get(BASE_URL);
        String pageSource = driver.getPageSource().toLowerCase();
        System.out.println("[TC-01] Page title: " + driver.getTitle());
        Assert.assertTrue(
            pageSource.contains("samadhaan"),
            "Expected page source to contain 'samadhaan' but it did not."
        );
        System.out.println("[TC-01] PASSED — Page source contains 'samadhaan'.");
    }

    // ── TC-02: Login page loads ───────────────────────────────────────────────

    /**
     * PASS: Navigates to /login and verifies the login form renders.
     */
    @Test(priority = 2, description = "TC-02: Login page renders with email field visible")
    public void testLoginPageRenders() throws InterruptedException {
        driver.get(BASE_URL + "/login");
        Thread.sleep(1500);

        // Look for the email input field that exists in Login.tsx
        WebElement emailField = driver.findElement(By.id("login-email"));
        Assert.assertTrue(
            emailField.isDisplayed(),
            "Expected email input to be displayed on /login."
        );
        System.out.println("[TC-02] PASSED — Login form is visible.");
    }

    // ── TC-03: Unauthenticated dashboard redirects to login ───────────────────

    /**
     * PASS: Accessing /dashboard without a token should redirect to /login.
     */
    @Test(priority = 3, description = "TC-03: /dashboard redirects unauthenticated users to /login")
    public void testDashboardRedirectsToLogin() throws InterruptedException {
        driver.get(BASE_URL + "/dashboard");
        Thread.sleep(2000);

        String currentUrl = driver.getCurrentUrl();
        System.out.println("[TC-03] Current URL after /dashboard: " + currentUrl);
        Assert.assertTrue(
            currentUrl.contains("/login"),
            "Expected redirect to /login but URL was: " + currentUrl
        );
        System.out.println("[TC-03] PASSED — Redirected to /login correctly.");
    }

    // ── TC-04: Profile page requires authentication ───────────────────────────

    /**
     * PASS: Accessing /profile without login should redirect to /login.
     */
    @Test(priority = 4, description = "TC-04: /profile redirects unauthenticated users to /login")
    public void testProfileRedirectsToLogin() throws InterruptedException {
        driver.get(BASE_URL + "/profile");
        Thread.sleep(2000);

        String currentUrl = driver.getCurrentUrl();
        System.out.println("[TC-04] Current URL after /profile: " + currentUrl);
        Assert.assertTrue(
            currentUrl.contains("/login"),
            "Expected redirect to /login but URL was: " + currentUrl
        );
        System.out.println("[TC-04] PASSED — Redirected to /login correctly.");
    }

    // ── TC-05: Intentional failure (demo only) ────────────────────────────────

    /**
     * INTENTIONAL FAIL: Used only to demonstrate a failing test in the
     * TestNG report. Shows the difference between PASS and FAIL in the
     * emailable-report.html and XSLT_Report.html.
     *
     * To skip this test, set enabled = false or remove it.
     */
    @Test(priority = 5, description = "TC-05: [DEMO FAIL] Intentional failure for report demonstration",
          enabled = true)
    public void testIntentionalFailForDemoReport() {
        System.out.println("[TC-05] This test is INTENTIONALLY failing for report demo purposes.");
        Assert.fail(
            "DEMO: This failure is intentional to show FAIL status in TestNG emailable and XSLT reports."
        );
    }

}
