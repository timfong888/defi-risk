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
        
        # -> Click the 'Aave' protocol link in the protocols table to open the Aave protocol detail page.
        # Aave link
        elem = page.get_by_role('link', name='Aave', exact=True)
        await elem.click(timeout=10000)
        
        # -> Scroll down to fully reveal the 'What each risk feed says' / Feed assessments section so the assessment cards (e.g., DeFiScan, DeFiPunk'd) are visible and can be verified.
        await page.mouse.wheel(0, 300)
        
        # -> Verify the Governance information is displayed by searching the page for the text 'Governance system' and verify provenance by searching for the text 'source'.
        # Audits link
        elem = page.get_by_role('link', name='Audits', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Morpho' link at the bottom of the page to navigate to the next protocol detail page and verify it loads.
        # Morpho → link
        elem = page.get_by_role('link', name='Morpho →', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify governance information is displayed
        await page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The Governance section link is visible on the protocol page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[1]").nth(0)).to_be_visible(timeout=15000), "The Governance section link is visible on the protocol page."
        
        # --> Verify provenance information is displayed
        # Assert: Provenance 'source' link is displayed on the DeFiScan feed assessment card.
        await expect(page.locator("xpath=/html/body/main/div/section[2]/div[1]/div/div[1]/div[2]/blockquote/footer/a").nth(0)).to_have_text("source", timeout=15000), "Provenance 'source' link is displayed on the DeFiScan feed assessment card."
        
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
        
        # --> Verify audits and incidents information is displayed
        await page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[3]").nth(0).scroll_into_view_if_needed()
        # Assert: The Audits section link is visible on the protocol page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[3]").nth(0)).to_be_visible(timeout=15000), "The Audits section link is visible on the protocol page."
        await page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[4]").nth(0).scroll_into_view_if_needed()
        # Assert: The Incidents section link is visible on the protocol page.
        await expect(page.locator("xpath=/html/body/main/div/div[2]/div/span[5]/a[4]").nth(0)).to_be_visible(timeout=15000), "The Incidents section link is visible on the protocol page."
        
        # --> Verify the next protocol detail page is displayed
        # Assert: The URL contains 'protocol/morpho', confirming navigation to the Morpho protocol page.
        await expect(page).to_have_url(re.compile("protocol/morpho"), timeout=15000), "The URL contains 'protocol/morpho', confirming navigation to the Morpho protocol page."
        await page.locator("xpath=/html/body/main/div/nav[1]/span").nth(0).scroll_into_view_if_needed()
        # Assert: The page shows 'Morpho' in the nav, confirming the Morpho protocol detail page is displayed.
        await expect(page.locator("xpath=/html/body/main/div/nav[1]/span").nth(0)).to_be_visible(timeout=15000), "The page shows 'Morpho' in the nav, confirming the Morpho protocol detail page is displayed."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    