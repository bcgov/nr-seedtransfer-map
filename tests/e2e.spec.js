const { test, expect } = require('@playwright/test')

test.describe('CBST Seedlot Selection Tool - E2E Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs
    page.on('console', msg => console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`))
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.toString()}`))

    // Navigate to our local server
    await page.goto('/index.html')
    // Wait for the app title to load to ensure base page is ready
    await expect(page.locator('#titleText')).toContainText('CBST Seedlot Selection Tool')
  })

  test('Cutblock Flow: Selecting FDI species and IDFdk1 BEC variant populates tables', async ({
    page,
  }) => {
    // Click the "I Have A Cutblock" tab
    await page.click('#cutblock-tab')

    // Click the Species selectpicker dropdown to open it
    await page.click('button[data-id="speciesInputCutblock"]')

    // Click the "FDI" option inside the visible dropdown
    const speciesOption = page.locator('div.dropdown-menu.show span.text', { hasText: 'FDI' }).first()
    await speciesOption.waitFor({ state: 'visible' })
    await speciesOption.click()

    // Click the BEC Variant selectpicker dropdown to open it
    await page.click('button[data-id="becInputCutblock"]')

    // Click the "IDFdk1" option inside the visible dropdown
    const becOption = page.locator('div.dropdown-menu.show span.text', { hasText: 'IDFdk1' }).first()
    await becOption.waitFor({ state: 'visible' })
    await becOption.click()

    // Click the dropdown button again to close the dropdown (since it is multiple select and stays open)
    await page.click('button[data-id="becInputCutblock"]')

    // Assert selections are set on the underlying select elements
    await expect(page.locator('#speciesInputCutblock')).toHaveValue('FDI')
    await expect(page.locator('#becInputCutblock')).toHaveValues(['136'])

    // Click the GO button for Cutblock
    await page.click('#addButtonCutblock')

    // Wait for a few seconds to let AJAX requests complete
    await page.waitForTimeout(5000)

    // Inspect the DOM for both tables
    const cutblockHTML = await page.locator('#cutblock_table').innerHTML()
    const seedlotHTML = await page.locator('#seedlot_table').innerHTML()
    console.log('[DEBUG] #cutblock_table HTML:', cutblockHTML)
    console.log('[DEBUG] #seedlot_table HTML:', seedlotHTML)

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

    // Fill in Orchard Number
    await page.fill('#orchardNumber', '101')

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

    // Fill in Seedlot Number
    await page.fill('#seedlotNumber', '52')

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
})
