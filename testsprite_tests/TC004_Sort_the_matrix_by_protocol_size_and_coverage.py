import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'TVL / volume' sort button to ensure size-based sorting is active, then click the 'coverage' sort button to switch to coverage-based ordering.
        # TVL / volume button
        elem = page.get_by_role('button', name='TVL / volume', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' sort button to ensure size-based sorting is active, then click the 'coverage' sort button to switch to coverage-based ordering.
        # coverage button
        elem = page.get_by_role('button', name='coverage', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' button to apply size-based ordering, then click the 'coverage' button to apply coverage-based ordering and observe whether the matrix order updates and TVL values remain visible for listed rows.
        # TVL / volume button
        elem = page.get_by_role('button', name='TVL / volume', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' button to apply size-based ordering, then click the 'coverage' button to apply coverage-based ordering and observe whether the matrix order updates and TVL values remain visible for listed rows.
        # coverage button
        elem = page.get_by_role('button', name='coverage', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' sort button to apply size-based ordering, then click the 'coverage' sort button to reapply coverage ordering and verify the table order and TVL values remain visible.
        # TVL / volume button
        elem = page.get_by_role('button', name='TVL / volume', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' sort button to apply size-based ordering, wait for the UI to update, then click the 'coverage' sort button to reapply coverage ordering and verify the table order and TVL values remain visible.
        # TVL / volume button
        elem = page.get_by_role('button', name='TVL / volume', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' sort button to apply size-based ordering, wait for the UI to update, then click the 'coverage' sort button to reapply coverage ordering and verify the table order and TVL values remain visible.
        # coverage button
        elem = page.get_by_role('button', name='coverage', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'TVL / volume' button to apply size-based ordering so the table should reorder by protocol size (TVL).
        # TVL / volume button
        elem = page.get_by_role('button', name='TVL / volume', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'coverage' sort button to apply coverage-based ordering and then observe the table to verify the ordering changes and that TVL values remain visible for listed protocols.
        # coverage button
        elem = page.get_by_role('button', name='coverage', exact=True)
        await elem.click(timeout=10000)
        
        # -> Verify that the matrix ordering reflects the 'coverage' sort and that protocol size (TVL / 24h vol) is displayed alongside each listed protocol (check top rows in the table).
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        
        # --> Verify the matrix order changes to reflect the selected sort
        # Assert: Coverage sort places Aave in the first row of the matrix.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[1]").nth(0)).to_contain_text("Aave", timeout=15000), "Coverage sort places Aave in the first row of the matrix."
        # Assert: Coverage sort places Morpho in the second row of the matrix.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[2]").nth(0)).to_contain_text("Morpho", timeout=15000), "Coverage sort places Morpho in the second row of the matrix."
        # Assert: Coverage sort places Morpho Vaults in the third row of the matrix.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[3]").nth(0)).to_contain_text("Morpho Vaults", timeout=15000), "Coverage sort places Morpho Vaults in the third row of the matrix."
        # Assert: Coverage sort places Lido in the fourth row of the matrix.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[4]").nth(0)).to_contain_text("Lido", timeout=15000), "Coverage sort places Lido in the fourth row of the matrix."
        # Assert: Coverage sort places Spark in the fifth row of the matrix.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[5]").nth(0)).to_contain_text("Spark", timeout=15000), "Coverage sort places Spark in the fifth row of the matrix."
        
        # --> Verify protocol size context is still shown for the listed rows
        # Assert: The Aave row displays its TVL value $12.28B.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[1]/td[2]").nth(0)).to_have_text("$12.28B", timeout=15000), "The Aave row displays its TVL value $12.28B."
        # Assert: The Morpho row displays its TVL value $6.55B.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[2]/td[2]").nth(0)).to_have_text("$6.55B", timeout=15000), "The Morpho row displays its TVL value $6.55B."
        # Assert: The Morpho Vaults row shows the size context text 'metric pending'.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[3]/td[2]").nth(0)).to_have_text("metric pending", timeout=15000), "The Morpho Vaults row shows the size context text 'metric pending'."
        # Assert: The Lido row displays its TVL value $14.93B.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[4]/td[2]").nth(0)).to_have_text("$14.93B", timeout=15000), "The Lido row displays its TVL value $14.93B."
        # Assert: The Spark row displays its TVL value $4.73B.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div[2]/table/tbody/tr[5]/td[2]").nth(0)).to_have_text("$4.73B", timeout=15000), "The Spark row displays its TVL value $4.73B."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    