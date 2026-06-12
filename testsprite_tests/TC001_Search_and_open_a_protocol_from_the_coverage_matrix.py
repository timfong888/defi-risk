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
        
        # -> Type 'Aave' into the 'Search protocols…' field, wait for the UI to update, apply the 'Lending' family filter, sort by 'TVL / volume', then open the 'Aave' protocol detail page by clicking its name in the matrix.
        # Search protocols… text field
        elem = page.get_by_placeholder('Search protocols…', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Aave")
        
        # -> Type 'Aave' into the 'Search protocols…' field, wait for the UI to update, apply the 'Lending' family filter, sort by 'TVL / volume', then open the 'Aave' protocol detail page by clicking its name in the matrix.
        # Lending button
        elem = page.get_by_role('button', name='Lending', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type 'Aave' into the 'Search protocols…' field, wait for the UI to update, apply the 'Lending' family filter, sort by 'TVL / volume', then open the 'Aave' protocol detail page by clicking its name in the matrix.
        # TVL / volume button
        elem = page.get_by_role('button', name='TVL / volume', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type 'Aave' into the 'Search protocols…' field, wait for the UI to update, apply the 'Lending' family filter, sort by 'TVL / volume', then open the 'Aave' protocol detail page by clicking its name in the matrix.
        # Aave link
        elem = page.get_by_role('link', name='Aave', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the filtered protocol is visible in the matrix
        # Assert: The protocol name 'Aave' is visible in the matrix breadcrumb, confirming the filtered protocol is present.
        await expect(page.locator("xpath=/html/body/main/div/nav[1]/span").nth(0)).to_have_text("Aave", timeout=15000), "The protocol name 'Aave' is visible in the matrix breadcrumb, confirming the filtered protocol is present."
        
        # --> Verify the protocol detail page is displayed
        # Assert: URL contains '/protocol/aave', confirming the protocol detail page is open.
        await expect(page).to_have_url(re.compile("/protocol/aave"), timeout=15000), "URL contains '/protocol/aave', confirming the protocol detail page is open."
        # Assert: The page shows the protocol title 'Aave'.
        await expect(page.locator("xpath=/html/body/main/div/nav[1]/span").nth(0)).to_have_text("Aave", timeout=15000), "The page shows the protocol title 'Aave'."
        # Assert: The 'Governance' section link is present on the protocol detail page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[1]").nth(0)).to_have_text("Governance", timeout=15000), "The 'Governance' section link is present on the protocol detail page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    