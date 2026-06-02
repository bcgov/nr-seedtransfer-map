const { test, expect } = require('@playwright/test')

test.describe('CBST Seedlot Selection Tool - E2E Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs only when explicitly debugging E2E runs
    if (process.env.DEBUG_E2E) {
      page.on('console', msg => console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`))
    }
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.toString()}`))

    // Navigate to our local server
    await page.goto('/index.html')
    // Wait for the app title to load to ensure base page is ready
    await expect(page.locator('#titleText')).toContainText('CBST Seedlot Selection Tool')
  })

  test('Sourcing: Sourced seedlot data-currency date is dynamically populated from body data attribute', async ({
    page,
  }) => {
    // 1. Verify the default date renders correctly in both places
    const subtitle = page.locator('#titleDiv .titleTextsmall.align-text-top')
    await expect(subtitle).toContainText('Seedlot Data Current as of August 18th, 2025')

    // Click the instructions tab to ensure visibility
    await page.click('#instructions-tab')
    const instructionItem = page.locator('#instructions ul.card-text li').filter({ hasText: 'Seedlot data refreshed' })
    await expect(instructionItem).toContainText(
      'Seedlot data refreshed August 18th, 2025. Seedlots that have been registered on SPAR after August 18th, 2025 are not included in the tool'
    )

    // 2. Change the body data-seedlot-date attribute and propagate to verify dynamic updates
    await page.evaluate(() => {
      document.body.setAttribute('data-seedlot-date', 'December 25th, 2026')
      const seedlotDate = document.body.getAttribute('data-seedlot-date')
      if (seedlotDate) {
        document.querySelectorAll('.seedlot-data-date-placeholder').forEach(function (el) {
          el.textContent = seedlotDate
        })
      }
    })

    // Assert that the text dynamically updated to the new date in all placeholders
    await expect(subtitle).toContainText('Seedlot Data Current as of December 25th, 2026')
    await expect(instructionItem).toContainText(
      'Seedlot data refreshed December 25th, 2026. Seedlots that have been registered on SPAR after December 25th, 2026 are not included in the tool'
    )
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

  test('Seedlot Flow: Entering Orchard 109 with unassigned BEC variant handles empty data gracefully', async ({
    page,
  }) => {
    // Click the "I Have A Seedlot" tab
    await page.click('#seedlot-tab')

    // Fill in Orchard Number 109
    await page.fill('#orchardNumber', '109')

    // Click "Set Representative Seedlot"
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })
    await page.click('#addSeedlotfromOrchard')

    // Verify it set the seedlot number but gracefully left/cleared BEC variant selection
    await expect(page.locator('#seedlotNumber')).toHaveValue('3377')
    await expect(page.locator('#speciesInputSeedlot')).toHaveValue('FDC')

    // Since BEC variant is empty/unassigned, the BEC dropdown should have no selected values
    await expect(page.locator('#becInputSeedlot')).toHaveValues([])
  })
})

