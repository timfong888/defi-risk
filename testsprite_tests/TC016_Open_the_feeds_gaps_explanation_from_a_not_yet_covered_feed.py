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
        
        # -> Open the Lido protocol detail page by navigating to the /protocol/lido path and load the page content.
        await page.goto("http://localhost:3000/protocol/lido")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Why?' link next to the Credora feed (the 'Why?' link shown next to Credora on the Lido page) to jump to the feeds gaps section.
        # Why? link
        elem = page.locator('xpath=/html/body/main/div/section[2]/div/div/div[4]/div[2]/span/a')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the feeds gaps section is displayed
        # Assert: URL contains 'feeds#gaps', indicating the feeds gaps anchor is shown.
        await expect(page).to_have_url(re.compile("feeds\\#gaps"), timeout=15000), "URL contains 'feeds#gaps', indicating the feeds gaps anchor is shown."
        await page.locator("xpath=/html/body/main/div/section[3]/table/thead/tr").nth(0).scroll_into_view_if_needed()
        # Assert: The 'What blocks coverage' table header is visible in the feeds gaps section.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/thead/tr").nth(0)).to_be_visible(timeout=15000), "The 'What blocks coverage' table header is visible in the feeds gaps section."
        
        # --> Verify a gap explanation is visible
        # Assert: A gap explanation for Credora is visible.
        await expect(page.locator("xpath=/html/body/main/div/section[3]/table/tbody/tr[4]/td[3]").nth(0)).to_contain_text("Institutional product; redistribution of ratings requires an", timeout=15000), "A gap explanation for Credora is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    