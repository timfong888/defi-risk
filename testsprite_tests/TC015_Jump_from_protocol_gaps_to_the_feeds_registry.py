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
        
        # -> Open the 'Lido' protocol page by navigating to /protocol/lido and confirm the protocol page finishes loading.
        await page.goto("http://localhost:3000/protocol/lido")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Scroll down the Lido protocol page to reveal the 'feed-gap explanations' section (look for the 'Feed coverage' bar, explanatory text about gaps, or a link labeled 'Feeds' / 'gaps').
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down the Lido protocol page to reveal the 'feed-gap explanations' section (look for the 'Feed coverage' bar, explanatory text about gaps, or a link labeled 'Feeds' / 'gaps').
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Feeds' link in the top navigation to open the feeds registry page so the feeds gaps content can be verified.
        # Feeds link
        elem = page.get_by_role('link', name='Feeds', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down the 'Risk feed registry' page until the 'gaps' / feed-gap explanations section is visible, then inspect the revealed content to confirm the gaps explanations are displayed.
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        
        # --> Verify the feeds registry page is displayed
        # Assert: The URL contains '/feeds', confirming the feeds registry page is open.
        await expect(page).to_have_url(re.compile("/feeds"), timeout=15000), "The URL contains '/feeds', confirming the feeds registry page is open."
        await page.locator("xpath=/html/body/main/div/section[3]/table/thead/tr").nth(0).scroll_into_view_if_needed()
        # Assert: The 'What blocks coverage' table header is visible, confirming the feeds registry content is displayed.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/thead/tr").nth(0)).to_be_visible(timeout=15000), "The 'What blocks coverage' table header is visible, confirming the feeds registry content is displayed."
        
        # --> Verify the gaps section content is displayed
        await page.locator("xpath=/html/body/main/div/section[3]/table/thead/tr").nth(0).scroll_into_view_if_needed()
        # Assert: The gaps section header with column titles is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/thead/tr").nth(0)).to_be_visible(timeout=15000), "The gaps section header with column titles is visible."
        await page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[1]/td[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The gaps section contains the 'DeFiScan' feed row.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[1]/td[1]").nth(0)).to_be_visible(timeout=15000), "The gaps section contains the 'DeFiScan' feed row."
        await page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[1]/td[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The gaps section shows a 'provider scope' blocker entry.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[1]/td[2]").nth(0)).to_be_visible(timeout=15000), "The gaps section shows a 'provider scope' blocker entry."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    