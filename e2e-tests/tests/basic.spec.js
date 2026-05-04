const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const chrome = require('selenium-webdriver/chrome');

// ── Configurable credentials via environment variables ────────────────────────
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'lavanya36914@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || '12345678';
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'lavanya.admin@gmail.com';
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '123456';

/** Small pause shown only when DEMO=true */
async function demoSleep(ms = 1000) {
  if (process.env.DEMO === 'true') {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Helper: perform a full login as a given role.
 * Re-fetches all input elements after the role dropdown interaction
 * to avoid StaleElementReferenceError.
 */
async function loginAs(driver, baseUrl, email, password, role = 'User') {
  await driver.get(`${baseUrl}/login`);
  await driver.wait(until.elementLocated(By.id('login-email')), 8000);

  // Select role via MUI Select
  try {
    const roleSelect = await driver.findElement(By.id('login-role'));
    await roleSelect.click();
    await driver.sleep(700);
    const option = await driver.wait(
      until.elementLocated(By.xpath(`//li[@data-value='${role}']`)),
      5000
    );
    await option.click();
    await driver.sleep(400);
  } catch (e) {
    console.warn('[loginAs] Role selection skipped:', e.message);
  }

  // Re-find inputs (MUI may re-render after dropdown)
  const emailEl = await driver.findElement(By.id('login-email'));
  const passwordEl = await driver.findElement(By.id('login-password'));
  const submitEl = await driver.findElement(By.css('[data-testid="login-submit"]'));

  await emailEl.sendKeys(email);
  await passwordEl.sendKeys(password);
  await submitEl.click();

  // Capture and log any visible error
  try {
    const errEl = await driver.wait(until.elementLocated(By.css('[data-testid="login-error"]')), 3000);
    const errText = await errEl.getText();
    console.error('\x1b[31m[LOGIN ERROR]\x1b[0m', errText);
  } catch (_) { /* no error shown */ }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Samadhaan Auth & Dashboard Automation', function () {
  let driver;
  const BASE_URL = 'http://localhost:5173';

  before(async function () {
    this.timeout(30000);
    const options = new chrome.Options();
    if (process.env.DEMO === 'true') {
      options.addArguments('--start-maximized');
    } else {
      options.addArguments('--headless', '--disable-gpu', '--window-size=1280,900');
    }
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  afterEach(async function () {
    await demoSleep(1500);
  });

  // ── 1 ──────────────────────────────────────────────────────────────────────
  it('1. Unauthenticated /dashboard redirects to /login', async function () {
    await driver.get(`${BASE_URL}/dashboard`);
    await driver.wait(until.urlContains('/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/login');
  });

  // ── 2 ──────────────────────────────────────────────────────────────────────
  it('2. Unauthenticated /profile redirects to /login', async function () {
    await driver.get(`${BASE_URL}/profile`);
    await driver.wait(until.urlContains('/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/login');
  });

  // ── 3 ──────────────────────────────────────────────────────────────────────
  it('3. Login works and lands on dashboard', async function () {
    this.timeout(25000);

    await loginAs(driver, BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, 'User');

    await driver.wait(until.urlContains('/dashboard'), 15000);
    expect(await driver.getCurrentUrl()).to.include('/dashboard');

    const title = await driver.wait(
      until.elementLocated(By.xpath("//h4[contains(text(),'User Dashboard')]")),
      5000
    );
    expect(await title.isDisplayed()).to.be.true;
  });

  // ── 4 ──────────────────────────────────────────────────────────────────────
  it('4. Valid complaint submission works', async function () {
    this.timeout(25000);

    // Already logged in from test 3 — still on /dashboard
    const category = await driver.wait(until.elementLocated(By.id('complaint-category')), 8000);
    await category.click();
    await driver.sleep(800);

    const catOption = await driver.wait(
      until.elementLocated(By.xpath("//li[contains(text(),'LMS Issue')]")),
      5000
    );
    await catOption.click();
    await driver.sleep(500);

    await driver.findElement(By.id('complaint-location')).sendKeys('Test Lab');
    await driver.sleep(300);

    await driver.findElement(By.id('complaint-description'))
      .sendKeys('WiFi is not working in Computer Lab since morning and needs urgent repair.');
    await driver.sleep(300);

    await driver.findElement(By.css('[data-testid="complaint-submit"]')).click();

    const successMsg = await driver.wait(
      until.elementLocated(By.css('[data-testid="complaint-success"]')),
      10000
    );
    expect(await successMsg.isDisplayed()).to.be.true;
    await demoSleep(500);
  });

  // ── 5 ──────────────────────────────────────────────────────────────────────
  it('5. Logout clears session', async function () {
    this.timeout(15000);

    const logoutBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(.,'Logout')]")),
      5000
    );
    await logoutBtn.click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url === `${BASE_URL}/` || url.includes('/login');
    }, 5000);

    const token = await driver.executeScript("return window.localStorage.getItem('token');");
    expect(token).to.be.null;

    await driver.get(`${BASE_URL}/dashboard`);
    await driver.wait(until.urlContains('/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/login');
  });

  // ── 6 ──────────────────────────────────────────────────────────────────────
  it('6. Spam complaint is rejected with error message', async function () {
    this.timeout(35000);

    // Login fresh as User
    await loginAs(driver, BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, 'User');
    await driver.wait(until.urlContains('/dashboard'), 15000);
    await driver.sleep(1500); // allow page to fully render

    // Select category
    const category = await driver.wait(until.elementLocated(By.id('complaint-category')), 8000);
    await category.click();
    await driver.sleep(800);
    const catOption = await driver.wait(
      until.elementLocated(By.xpath("//li[contains(text(),'LMS Issue')]")),
      5000
    );
    await catOption.click();
    await driver.sleep(500);

    // Fill location
    await driver.findElement(By.id('complaint-location')).sendKeys('Test Lab');
    await driver.sleep(300);

    // Submit spam description — backend must reject it
    await driver.findElement(By.id('complaint-description'))
      .sendKeys('asdf asdf asdf asdf');
    await driver.sleep(300);

    await driver.findElement(By.css('[data-testid="complaint-submit"]')).click();

    // Wait for complaint-error alert (backend rejection)
    const errorAlert = await driver.wait(
      until.elementLocated(By.css('[data-testid="complaint-error"]')),
      10000
    );
    expect(await errorAlert.isDisplayed()).to.be.true;
    const errorText = await errorAlert.getText();
    console.log('[TEST 6] Error alert text:', errorText);
    expect(errorText).to.include('meaningful complaint description');

    // Confirm no success alert appeared
    const successAlerts = await driver.findElements(By.css('[data-testid="complaint-success"]'));
    expect(successAlerts.length).to.equal(0);

    await demoSleep();
  });

  // ── 7 ──────────────────────────────────────────────────────────────────────
  it('7. Admin login works and lands on admin dashboard', async function () {
    this.timeout(25000);

    // Logout first if logged in
    try {
      const logoutBtn = await driver.findElement(By.xpath("//button[contains(.,'Logout')]"));
      await logoutBtn.click();
      await driver.sleep(1000);
    } catch (e) { /* not logged in */ }

    await loginAs(driver, BASE_URL, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, 'Admin');

    await driver.wait(until.urlContains('/admin'), 12000);
    expect(await driver.getCurrentUrl()).to.include('/admin');

    await demoSleep();
  });
});
