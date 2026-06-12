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
        
        # -> Click the 'Lido' protocol name in the matrix to open its protocol detail page so the detail view can be verified.
        # Lido link
        elem = page.get_by_role('link', name='Lido', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the protocol detail page is displayed
        # Assert: The URL contains 'protocol/lido', confirming the protocol detail page is open.
        await expect(page).to_have_url(re.compile("protocol/lido"), timeout=15000), "The URL contains 'protocol/lido', confirming the protocol detail page is open."
        # Assert: The protocol title 'Lido' is visible on the detail page.
        await expect(page.locator("xpath=/html/body/main/div/div[1]/h1").nth(0)).to_have_text("Lido", timeout=15000), "The protocol title 'Lido' is visible on the detail page."
        
        # --> Verify governance and feed assessment sections are available
        await page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The Governance section link is visible on the protocol detail page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[1]").nth(0)).to_be_visible(timeout=15000), "The Governance section link is visible on the protocol detail page."
        await page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The Feed assessments section link is visible on the protocol detail page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[2]").nth(0)).to_be_visible(timeout=15000), "The Feed assessments section link is visible on the protocol detail page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    