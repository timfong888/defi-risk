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
        
        # -> Click the 'Aave' protocol link in the protocols list to open the Aave protocol detail page.
        # Aave link
        elem = page.get_by_role('link', name='Aave', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down to the bottom of the Aave protocol detail page to reveal the protocol navigation controls and the 'next protocol' link.
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Morpho →' link at the bottom of the Aave detail page to open the next protocol's detail page and verify the page changes and that protocol navigation remains available.
        # Morpho → link
        elem = page.get_by_role('link', name='Morpho →', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll to the bottom of the Morpho protocol detail page and verify that the protocol navigation controls (previous and next protocol links such as '← <protocol>' and '<protocol> →') are present.
        await page.mouse.wheel(0, 300)
        
        # -> Click the 'Fluid →' link at the bottom of the Morpho detail page to open the Fluid protocol detail page and verify the page changes.
        # Fluid → link
        elem = page.get_by_role('link', name='Fluid →', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll to the bottom of the Fluid protocol detail page and verify that the 'previous' and 'next' protocol navigation links (e.g., '← Morpho' and '<protocol> →') are visible.
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        
        # --> Verify another protocol detail page is displayed
        # Assert: URL contains 'protocol/fluid', confirming the Fluid protocol detail page is displayed.
        await expect(page).to_have_url(re.compile("protocol/fluid"), timeout=15000), "URL contains 'protocol/fluid', confirming the Fluid protocol detail page is displayed."
        
        # --> Verify the protocol navigation remains available
        # Assert: Previous protocol link 'Morpho' is visible in the protocol navigation.
        await expect(page.locator("xpath=/html/body/main/div/nav[2]/a[1]").nth(0)).to_contain_text("Morpho", timeout=15000), "Previous protocol link 'Morpho' is visible in the protocol navigation."
        # Assert: Next protocol link 'Gearbox' is visible in the protocol navigation.
        await expect(page.locator("xpath=/html/body/main/div/nav[2]/a[2]").nth(0)).to_contain_text("Gearbox", timeout=15000), "Next protocol link 'Gearbox' is visible in the protocol navigation."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    