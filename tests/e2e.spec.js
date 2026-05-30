const { test, expect } = require('@playwright/test')

test.describe('CBST Seedlot Selection Tool - E2E Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs only when explicitly debugging E2E runs
    if (process.env.DEBUG_E2E) {
      page.on('console', (msg) => console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`))
    }
    page.on('pageerror', (err) => console.log(`[BROWSER ERROR] ${err.toString()}`))

    // Navigate to our local server
    await page.goto('/index.html')
    // Wait for the app title to load to ensure base page is ready
    await expect(page.locator('#titleText')).toContainText('CBST Seedlot Selection Tool')

    // Disable all CSS transitions and animations to prevent E2E race conditions during tab switching
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `,
    })

    // Wait for SlimSelect dropdowns to initialize and the layout to stabilize
    await page.locator('#speciesInputCutblock + .ss-main').waitFor({ state: 'attached', timeout: 15 * 1000 })

    // Wait for the Esri Map to fully load and relocate `#editArea` to the Esri UI,
    // which prevents the Esri widgets from stealing input focus during E2E runs.
    await page.locator('.esri-ui #editArea').waitFor({ state: 'attached', timeout: 30 * 1000 })
  })

  test('Cutblock Flow: Selecting FDI species and IDFdk1 BEC variant populates tables', async ({
    page,
  }) => {
    // Click the "I Have A Cutblock" tab
    await page.click('#cutblock-tab')

    // Click the Species SlimSelect dropdown to open it
    await page.locator('#speciesInputCutblock + .ss-main').click()

    // Click the "FDI" option inside the visible dropdown
    await page.getByRole('option', { name: 'FDI', exact: true }).first().click()

    // Click the BEC Variant SlimSelect dropdown to open it
    await page.locator('#becInputCutblock + .ss-main').click()

    // Click the "IDFdk1" option inside the visible dropdown
    await page.getByRole('option', { name: 'IDFdk1', exact: true }).first().click()

    // Close the dropdown by pressing Escape
    await page.keyboard.press('Escape')

    // Assert selections are set on the underlying select elements
    await expect(page.locator('#speciesInputCutblock')).toHaveValue('FDI')
    await expect(page.locator('#becInputCutblock')).toHaveValues(['136'])

    // Click the GO button for Cutblock
    await page.click('#addButtonCutblock')

    // Verify the results tables load and populate with data rows
    // Wait for the Cutblock Table to populate at least one row
    const cutblockRow = page.locator('#cutblock_table tbody tr').first()
    await cutblockRow.waitFor({ state: 'visible', timeout: 15 * 1000 })
    await expect(cutblockRow).not.toContainText('No matching records found')

    // Wait for the Seedlot Table to populate at least one row
    const seedlotRow = page.locator('#seedlot_table tbody tr').first()
    await seedlotRow.waitFor({ state: 'visible', timeout: 15 * 1000 })
    await expect(seedlotRow).not.toContainText('No matching records found')
  })

  test('Seedlot Flow: Entering Orchard 101 populates representative seedlot and table', async ({
    page,
  }) => {
    // Click the "I Have A Seedlot" tab
    await page.click('#seedlot-tab')

    // Wait for the tab pane to become active and visible before interacting
    await expect(page.locator('#seedlot')).toHaveClass(/active/)
    await page.waitForTimeout(500) // Settle focus/transitions

    // Fill in Orchard Number
    const orchardInput = page.locator('#orchardNumber')
    await orchardInput.click()
    await orchardInput.fill('101')
    await expect(orchardInput).toHaveValue('101')

    // Click "Set Representative Seedlot"
    // Mock the alert popup to prevent test blockage just in case
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })
    await page.click('#addSeedlotfromOrchard')

    // It should automatically retrieve Seedlot 3226, set the inputs, and refresh the UI dropdowns
    await expect(page.locator('#seedlotNumber')).toHaveValue('3226')

    // Wait for the inputs to get set via the AJAX response
    await expect(page.locator('#speciesInputSeedlot')).toHaveValue('FDC')

    // Click the Seedlot tab GO button
    await page.click('#addButtonSeedlot')

    // Verify the seed table loads and populates with data rows
    const seedRow = page.locator('#seed tbody tr').first()
    await seedRow.waitFor({ state: 'visible', timeout: 15 * 1000 })
    await expect(seedRow).not.toContainText('No matching records found')
  })

  test('Seedlot Flow: Entering Seedlot 52 automatically updates Species/BEC variant and populates table', async ({
    page,
  }) => {
    // Click the "I Have A Seedlot" tab
    await page.click('#seedlot-tab')

    // Wait for the tab pane to become active and visible before interacting
    await expect(page.locator('#seedlot')).toHaveClass(/active/)
    await page.waitForTimeout(500) // Settle focus/transitions

    // Fill in Seedlot Number
    const seedlotInput = page.locator('#seedlotNumber')
    await seedlotInput.click()
    await seedlotInput.fill('52')
    await expect(seedlotInput).toHaveValue('52')

    // Click "Set Species & BEC"
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })
    await page.click('#addSpeciesBecSeedlot')

    // Verify it automatically sets Species to SX and BEC Variant to ESSFwc2 (ID: 77)
    await expect(page.locator('#speciesInputSeedlot')).toHaveValue('SX')

    // Click the Seedlot tab GO button
    await page.click('#addButtonSeedlot')

    // Verify the seed table loads and populates with data rows
    const seedRow = page.locator('#seed tbody tr').first()
    await seedRow.waitFor({ state: 'visible', timeout: 15 * 1000 })
    await expect(seedRow).not.toContainText('No matching records found')
  })

  test('Mobile Viewport Flow: Map container (#mapDiv) does not collapse on mobile screens', async ({
    page,
  }) => {
    // Set viewport to mobile screen size
    await page.setViewportSize({ width: 375, height: 667 })

    // Reload the page under mobile viewport
    await page.goto('/index.html')

    // Wait for the app title to load to ensure base page is ready
    await expect(page.locator('#titleText')).toContainText('CBST Seedlot Selection Tool')

    // Verify that the map column (#mapCol) is visible
    const mapCol = page.locator('#mapCol')
    await expect(mapCol).toBeVisible()

    // Bounding box dimensions of the map column must not be zero
    const boundingBox = await mapCol.boundingBox()
    expect(boundingBox).not.toBeNull()
    expect(boundingBox.width).toBeGreaterThan(0)
    expect(boundingBox.height).toBeGreaterThanOrEqual(400) // min-height is 400px

    // Verify map div (#mapDiv) is visible and has height
    const mapDiv = page.locator('#mapDiv')
    await expect(mapDiv).toBeVisible()
    const mapDivBoundingBox = await mapDiv.boundingBox()
    expect(mapDivBoundingBox).not.toBeNull()
    expect(mapDivBoundingBox.width).toBeGreaterThan(0)
    expect(mapDivBoundingBox.height).toBeGreaterThanOrEqual(400)

    // Verify floating toggle button is visible on mobile
    const toggleBtn = page.locator('#sidebarToggle')
    await expect(toggleBtn).toBeVisible()
    await expect(toggleBtn).toContainText('Show Options')

    // Sidebar should start hidden by default on mobile viewports
    const sidebar = page.locator('#leftCol')
    await expect(sidebar).not.toBeVisible()

    // Click toggle button to open sidebar floating overlay
    await toggleBtn.click()
    await expect(sidebar).toBeVisible()
    await expect(sidebar).toHaveClass(/show-mobile/)
    await expect(toggleBtn).toContainText('Hide Panel')

    // Click toggle button again to collapse the sidebar
    await toggleBtn.click()
    await expect(sidebar).not.toBeVisible()
  })
})
