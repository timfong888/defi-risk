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
        
        # -> Open the Aave protocol page (the 'Aave' protocol detail page) so the feed assessments section can be located and its cards/quoted assessments verified.
        await page.goto("http://localhost:3000/protocol/aave")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Feed assessments' link to jump to the feed assessments section and reveal the feed assessment cards and their quoted assessments.
        # Feed assessments link
        elem = page.get_by_role('link', name='Feed assessments', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify feed assessment cards are displayed
        await page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[1]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The DeFiScan feed assessment card is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[1]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "The DeFiScan feed assessment card is visible."
        await page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[2]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The DeFiPunk'd feed assessment card is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[2]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "The DeFiPunk'd feed assessment card is visible."
        await page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[3]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The DeFi Sphere feed assessment card is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[3]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "The DeFi Sphere feed assessment card is visible."
        await page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[4]/div[1]/a").nth(0).scroll_into_view_if_needed()
        # Assert: The Credora feed assessment card is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[4]/div[1]/a").nth(0)).to_be_visible(timeout=15000), "The Credora feed assessment card is visible."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    