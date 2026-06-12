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
        
        # -> Click the 'Feeds' link in the header to open the feeds registry page and then verify the registry summaries and coverage matrix are present.
        # Feeds link
        elem = page.get_by_role('link', name='Feeds', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down the Feeds page to reveal the 'Coverage by protocol category' matrix and the blockers table so their contents can be verified.
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        
        # --> Verify the feed registry summaries are displayed
        # Assert: The feed entry 'Credora' is visible in the registry summaries.
        await expect(page.locator("xpath=/html/body/main/div/section[1]/div/div[4]/div/a").nth(0)).to_have_text("Credora", timeout=15000), "The feed entry 'Credora' is visible in the registry summaries."
        # Assert: The feed entry 'RiskLayer' is visible in the registry summaries.
        await expect(page.locator("xpath=/html/body/main/div/section[1]/div/div[5]/div/a").nth(0)).to_have_text("RiskLayer", timeout=15000), "The feed entry 'RiskLayer' is visible in the registry summaries."
        # Assert: The feed entry 'Philidor Analytics' is visible in the registry summaries.
        await expect(page.locator("xpath=/html/body/main/div/section[1]/div/div[7]/div/a").nth(0)).to_have_text("Philidor Analytics", timeout=15000), "The feed entry 'Philidor Analytics' is visible in the registry summaries."
        # Assert: The feed entry 'DeFi Saver' is visible in the registry summaries.
        await expect(page.locator("xpath=/html/body/main/div/section[1]/div/div[10]/div/a").nth(0)).to_have_text("DeFi Saver", timeout=15000), "The feed entry 'DeFi Saver' is visible in the registry summaries."
        
        # --> Verify the coverage-by-category matrix is displayed
        await page.locator("xpath=/html/body/main/div/section[2]/div/table/thead/tr").nth(0).scroll_into_view_if_needed()
        # Assert: The coverage matrix table header is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div/table/thead/tr").nth(0)).to_be_visible(timeout=15000), "The coverage matrix table header is visible."
        # Assert: The coverage matrix includes a row for DeFiScan.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div/table/tbody/tr[1]").nth(0)).to_contain_text("DeFiScan", timeout=15000), "The coverage matrix includes a row for DeFiScan."
        # Assert: The coverage matrix includes a row for DeFiPunk'd.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div/table/tbody/tr[2]").nth(0)).to_contain_text("DeFiPunk'd", timeout=15000), "The coverage matrix includes a row for DeFiPunk'd."
        # Assert: The coverage matrix includes a row for DeFi Sphere.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div/table/tbody/tr[3]").nth(0)).to_contain_text("DeFi Sphere", timeout=15000), "The coverage matrix includes a row for DeFi Sphere."
        
        # --> Verify blocker classifications are displayed
        # Assert: The blocker classification 'provider scope' is displayed for DeFiScan.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[1]/td[2]").nth(0)).to_have_text("provider scope", timeout=15000), "The blocker classification 'provider scope' is displayed for DeFiScan."
        # Assert: The blocker classification 'verification pending' is displayed for DeFiPunk'd.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[2]/td[2]").nth(0)).to_have_text("verification pending", timeout=15000), "The blocker classification 'verification pending' is displayed for DeFiPunk'd."
        # Assert: The blocker classification 'access gated' is displayed for DeFi Sphere.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[3]/td[2]").nth(0)).to_have_text("access gated", timeout=15000), "The blocker classification 'access gated' is displayed for DeFi Sphere."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    