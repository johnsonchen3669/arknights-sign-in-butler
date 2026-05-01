const SITE_CONFIGS = {
    endfield: {
        id: 'endfield',
        expandMessageKey: 'viewAllRewardsEndfield',
        expandFallbackTexts: ['查看全部獎勵'],
        rewardCardSelectors: ['[class*="sc-nuIvE"]'],
        pendingSelectors: ['#lottie-container', '[id*="lottie-container"]', '[id*="lottie"]'],
        successFallbackText: 'Endfield 自動簽到完成'
    },
    arknights: {
        id: 'arknights',
        expandMessageKey: 'viewAllRewardsArknights',
        expandFallbackTexts: ['查看全部'],
        rewardCardSelectors: ['[class*="sc-nuIvE"]'],
        pendingSelectors: ['#lottie-container', '[id*="lottie-container"]', '[id*="lottie"]'],
        successFallbackText: 'Arknights 自動簽到完成'
    }
};

const siteConfig = getSiteConfig();

console.log('SKPORT Auto Sign-in script loaded', siteConfig && siteConfig.id);

const MAX_ATTEMPTS = 20;
const RETRY_INTERVAL = 2000;
let attempts = 0;

function getSiteConfig() {
    if (window.location.pathname.includes('/arknights/')) {
        return SITE_CONFIGS.arknights;
    }

    if (window.location.pathname.includes('/endfield/')) {
        return SITE_CONFIGS.endfield;
    }

    return null;
}

function getExpandButton() {
    if (!siteConfig) {
        return null;
    }

    const spans = document.querySelectorAll('span');
    const localizedText = chrome.i18n.getMessage(siteConfig.expandMessageKey);
    const targetTexts = [localizedText, ...siteConfig.expandFallbackTexts].filter(Boolean);

    for (const span of spans) {
        if (targetTexts.some((text) => span.innerText.includes(text))) {
            return span;
        }
    }
    return null;
}

/**
 * Find the current day's reward element that needs to be clicked.
 * The current unchecked day is the ONLY element with #lottie-container.
 */
function findSignInButton() {
    const lottie = getPendingElement();
    if (!lottie) {
        console.log('No lottie-container found - either already signed in or page not loaded');
        return null;
    }

    // Find the clickable parent container (the reward card)
    // The lottie is nested inside the card, traverse up to find the clickable element
    let current = lottie.parentElement;
    for (let i = 0; i < 10 && current; i++) {
        const style = window.getComputedStyle(current);
        // Check if this element looks like the reward card (sc-nuIvE class pattern)
        if (current.className && typeof current.className === 'string' && current.className.includes('sc-nuIvE')) {
            console.log('Found reward card container:', current.className);
            return current;
        }
        // Also check if it's clickable
        if (style.cursor === 'pointer') {
            console.log('Found clickable parent via cursor:pointer:', current.className);
            return current;
        }
        current = current.parentElement;
    }

    // Fallback: just return the parent of the lottie (usually clickable)
    const parent = lottie.parentElement?.parentElement;
    if (parent) {
        console.log('Using lottie parent as fallback:', parent.className);
        return parent;
    }

    return null;
}

/**
 * Check if today's sign-in is already completed.
 * Simple logic: if #lottie-container exists, today is NOT completed yet.
 */
function isTodayAlreadyCompleted() {
    const lottie = getPendingElement();
    // If lottie exists, today is still pending
    if (lottie) {
        return false;
    }
    // No lottie = either completed or page not fully loaded
    // Check if there are any reward cards visible at all
    const rewardCards = getRewardCards();
    if (rewardCards.length > 0) {
        // Cards exist but no lottie = already completed
        return true;
    }
    // No cards yet = page still loading
    return false;
}

function attemptSignIn() {
    if (!siteConfig) {
        console.warn('Unsupported sign-in page:', window.location.href);
        return true;
    }

    attempts++;
    console.log(`Scanning for sign-in button (Attempt ${attempts}/${MAX_ATTEMPTS})...`, siteConfig.id);

    // Check if today is already signed in
    if (isTodayAlreadyCompleted()) {
        console.log('Today\'s sign-in is already completed. Reporting success to background script.');
        chrome.runtime.sendMessage({ action: 'signInSuccess', gameId: siteConfig.id });
        return true;
    }

    const target = findSignInButton();

    if (target) {
        console.log('Sign-in element found:', target);

        setTimeout(() => {
            target.click();
            console.log('Clicked sign-in element');
            chrome.runtime.sendMessage({ action: 'signInSuccess', gameId: siteConfig.id });
            showNotification(chrome.i18n.getMessage('signInSuccessNotify') || siteConfig.successFallbackText);
        }, 1000);

        return true;
    }

    const expandBtn = getExpandButton();
    if (expandBtn) {
        console.log('Sign-in button not visible yet. Found "View all rewards" button, clicking to expand...');
        expandBtn.click();
        return false;
    }

    if (attempts >= MAX_ATTEMPTS) {
        console.log('Could not find sign-in element after maximum attempts.');
        return true;
    }

    return false;
}

function getPendingElement() {
    if (!siteConfig) {
        return null;
    }

    for (const selector of siteConfig.pendingSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }

    return null;
}

function getRewardCards() {
    if (!siteConfig) {
        return [];
    }

    const cards = [];

    for (const selector of siteConfig.rewardCardSelectors) {
        cards.push(...document.querySelectorAll(selector));
    }

    return cards;
}

function startCheck() {
    const interval = setInterval(() => {
        if (attemptSignIn()) {
            clearInterval(interval);
        }
    }, RETRY_INTERVAL);
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.innerText = msg;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.backgroundColor = '#4CAF50';
    div.style.color = 'white';
    div.style.padding = '10px 20px';
    div.style.borderRadius = '5px';
    div.style.zIndex = '999999';
    div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    div.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 5000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCheck);
} else {
    startCheck();
}
