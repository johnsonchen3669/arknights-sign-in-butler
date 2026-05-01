const GAMES = {
    endfield: {
        id: 'endfield',
        url: 'https://game.skport.com/endfield/sign-in?header=0&hg_media=skport&hg_link_campaign=tools'
    },
    arknights: {
        id: 'arknights',
        url: 'https://game.skport.com/arknights/sign-in?header=0&hg_media=skport&hg_link_campaign=tools'
    }
};
const ALARM_NAME = 'dailySignCheck';
const CHECK_HOUR = 0;
const CHECK_MINUTE = 30;
const SIGN_IN_DEDUP_WINDOW_MS = 90 * 1000;
const DEFAULT_SIGN_IN_MODE = 'endfield';

let isAutoCheckRunning = false;

chrome.runtime.onInstalled.addListener((details) => {
    console.log('Arknights Sign-in Butler Extension Installed');

    // On first install, open settings page for user to configure
    if (details.reason === 'install') {
        // Open popup.html as a tab for initial setup
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        console.log('First install detected - opening settings page');
    }
    
    // Always set up alarm and check sign-in on install or update
    createAlarm();
    checkAndSignIn('onInstalled');
});

chrome.runtime.onStartup.addListener(() => {
    createAlarm();
    checkAndSignIn('onStartup');
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        checkAndSignIn('alarm');
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'signInSuccess' && request.gameId) {
        const today = new Date().toDateString();
        chrome.storage.local.get(['lastCheckInDateByGame', 'lastSignInAttemptAtByGame'], (result) => {
            const lastCheckInDateByGame = result.lastCheckInDateByGame || {};
            const lastSignInAttemptAtByGame = result.lastSignInAttemptAtByGame || {};

            lastCheckInDateByGame[request.gameId] = today;
            lastSignInAttemptAtByGame[request.gameId] = 0;

            chrome.storage.local.set({
                lastCheckInDate: today,
                lastCheckInDateByGame,
                lastSignInAttemptAtByGame
            }, () => {
                console.log('Sign-in successful, date stored:', request.gameId, today);
            });
        });
    }
    else if (request.action === 'manualSignIn') {
        chrome.storage.local.get(['signInMode'], (result) => {
            const gameIds = getSelectedGameIds(result.signInMode);
            runSignInForGames(gameIds, 'manual');
            sendResponse({ status: 'started' });
        });
        return true;
    }
    else if (request.action === 'updateSchedule') {
        createAlarm();
        sendResponse({ status: 'updated' });
    }
});

function createAlarm() {
    chrome.alarms.clear(ALARM_NAME, (wasCleared) => {
        chrome.storage.local.get(['checkTime'], (result) => {
            const nextTime = getNextCheckTime(result.checkTime);
            chrome.alarms.create(ALARM_NAME, {
                when: nextTime,
                periodInMinutes: 1440
            });
            console.log('Next alarm set for:', new Date(nextTime).toLocaleString());
        });
    });
}

function getNextCheckTime(customTime) {
    const now = new Date();
    const next = new Date();

    let hour = CHECK_HOUR;
    let minute = CHECK_MINUTE;

    if (customTime) {
        const [h, m] = customTime.split(':').map(Number);
        hour = h;
        minute = m;
    }

    next.setHours(hour, minute, 0, 0);
    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }
    return next.getTime();
}

function checkAndSignIn(triggerSource = 'unknown') {
    if (isAutoCheckRunning) {
        console.log('Auto check skipped: another auto check is already running');
        return;
    }

    isAutoCheckRunning = true;

    chrome.storage.local.get(['signInMode', 'lastCheckInDateByGame', 'lastSignInAttemptAtByGame'], (result) => {
        const today = new Date().toDateString();

        const lastCheckInDateByGame = result.lastCheckInDateByGame || {};
        const lastSignInAttemptAtByGame = result.lastSignInAttemptAtByGame || {};
        const gameIds = getSelectedGameIds(result.signInMode);

        const now = Date.now();
        const pendingGameIds = gameIds.filter((gameId) => {
            const alreadyCheckedIn = lastCheckInDateByGame[gameId] === today;
            const lastAttemptAt = lastSignInAttemptAtByGame[gameId] || 0;
            const isRecentAttempt = lastAttemptAt > 0 && now - lastAttemptAt < SIGN_IN_DEDUP_WINDOW_MS;

            if (alreadyCheckedIn) {
                console.log('Already signed in today:', gameId, today);
                return false;
            }

            if (isRecentAttempt) {
                console.log(`Auto check skipped: recent attempt exists (${triggerSource})`, gameId);
                return false;
            }

            return true;
        });

        if (pendingGameIds.length === 0) {
            isAutoCheckRunning = false;
            return;
        }

        for (const gameId of pendingGameIds) {
            lastSignInAttemptAtByGame[gameId] = now;
        }

        chrome.storage.local.set({ lastSignInAttemptAtByGame }, () => {
            if (chrome.runtime.lastError) {
                console.warn('Failed to store sign-in attempt timestamp:', chrome.runtime.lastError.message);
            }

            runSignInForGames(pendingGameIds, 'auto');
            isAutoCheckRunning = false;
        });
    });
}

function runSignInForGames(gameIds, triggerSource = 'auto', index = 0) {
    if (index >= gameIds.length) {
        return;
    }

    performSignIn(gameIds[index], triggerSource, () => {
        runSignInForGames(gameIds, triggerSource, index + 1);
    });
}

function performSignIn(gameId, triggerSource = 'auto', done = () => {}) {
    const game = GAMES[gameId];
    if (!game) {
        console.warn('Unknown game id:', gameId);
        done();
        return;
    }

    const shouldFocus = triggerSource === 'manual';

    // Try opening a tab first. This may fail in background mode when no browser window exists.
    chrome.tabs.create({ url: game.url, active: shouldFocus }, (tab) => {
        if (!chrome.runtime.lastError) {
            console.log('Opening sign-in tab:', game.url, 'tabId:', tab && tab.id, 'trigger:', triggerSource, 'game:', gameId);
            done();
            return;
        }

        const err = chrome.runtime.lastError.message;
        console.warn('tabs.create failed, falling back to windows.create:', err);

        chrome.windows.create({
            url: game.url,
            focused: shouldFocus,
            state: shouldFocus ? 'normal' : 'minimized',
            type: 'normal'
        }, (win) => {
            if (chrome.runtime.lastError) {
                console.error('windows.create also failed:', chrome.runtime.lastError.message);
                done();
                return;
            }

            console.log('Opening sign-in window:', game.url, 'windowId:', win && win.id, 'trigger:', triggerSource, 'game:', gameId);
            done();
        });
    });
}

function getSelectedGameIds(signInMode = DEFAULT_SIGN_IN_MODE) {
    if (signInMode === 'both') {
        return [GAMES.endfield.id, GAMES.arknights.id];
    }

    if (GAMES[signInMode]) {
        return [signInMode];
    }

    return [GAMES.endfield.id];
}
