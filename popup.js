const DEFAULT_CHECK_TIME = '00:30';
const DEFAULT_SIGN_IN_MODE = 'endfield';

document.addEventListener('DOMContentLoaded', () => {
    translateUI();
    updateUI();

    // Load saved time
    chrome.storage.local.get(['checkTime', 'signInMode'], (result) => {
        const checkTimeInput = document.getElementById('checkTime');
        const savedMode = result.signInMode || DEFAULT_SIGN_IN_MODE;

        setSelectedMode(savedMode);

        if (result.checkTime) {
            checkTimeInput.value = result.checkTime;
            return;
        }

        // First run: use default schedule and persist it so UI and alarm settings are consistent.
        checkTimeInput.value = DEFAULT_CHECK_TIME;
        chrome.storage.local.set({ checkTime: DEFAULT_CHECK_TIME, signInMode: savedMode }, () => {
            chrome.runtime.sendMessage({ action: 'updateSchedule', time: DEFAULT_CHECK_TIME }, () => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to sync default schedule:', chrome.runtime.lastError.message);
                }
            });
        });
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        const timeValue = document.getElementById('checkTime').value;
        const signInMode = getSelectedMode();
        if (timeValue) {
            chrome.storage.local.set({ checkTime: timeValue, signInMode }, () => {
                chrome.runtime.sendMessage({ action: 'updateSchedule', time: timeValue }, (response) => {
                    const msgDiv = document.getElementById('msg');
                    msgDiv.innerText = chrome.i18n.getMessage('readyStatus'); // Use a generic success message or add new one
                    msgDiv.style.color = '#4CAF50';
                    setTimeout(() => { msgDiv.innerText = ''; }, 3000);
                });
            });
        }
    });

    document.getElementById('manualBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'manualSignIn' }, (response) => {
            const msgDiv = document.getElementById('msg');
            if (response && response.status === 'started') {
                msgDiv.innerText = chrome.i18n.getMessage('startingSignIn');
                msgDiv.style.color = '#4CAF50';
                setTimeout(() => window.close(), 1000);
            } else {
                msgDiv.innerText = chrome.i18n.getMessage('signInFailed');
                msgDiv.style.color = 'red';
            }
        });
    });
});

function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const message = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
        if (message) {
            el.innerText = message;
        }
    });
}

function updateUI() {
    chrome.storage.local.get(['signInMode', 'lastCheckInDateByGame'], (result) => {
        const dateEl = document.getElementById('lastCheckIn');
        const statusEl = document.getElementById('status');
        const signInMode = result.signInMode || DEFAULT_SIGN_IN_MODE;
        const gameIds = getSelectedGameIds(signInMode);
        const lastCheckInDateByGame = result.lastCheckInDateByGame || {};
        const today = new Date().toDateString();

        const signedTodayForAllGames = gameIds.every((gameId) => lastCheckInDateByGame[gameId] === today);
        const gameDateLabels = gameIds.map((gameId) => {
            const labelKey = gameId === 'arknights' ? 'gameNameArknights' : 'gameNameEndfield';
            const gameName = chrome.i18n.getMessage(labelKey) || gameId;
            const dateText = lastCheckInDateByGame[gameId] || chrome.i18n.getMessage('noRecord');
            return `${gameName}: ${dateText}`;
        });

        if (gameDateLabels.length > 0) {
            dateEl.innerText = gameDateLabels.join(' | ');

            if (signedTodayForAllGames) {
                statusEl.innerText = chrome.i18n.getMessage('alreadySignedIn');
                statusEl.style.color = '#4CAF50';
            } else {
                statusEl.innerText = chrome.i18n.getMessage('notSignedInYet');
                statusEl.style.color = '#ff9800';
            }
        } else {
            dateEl.innerText = chrome.i18n.getMessage('noRecord');
            statusEl.innerText = chrome.i18n.getMessage('readyStatus');
        }
    });
}

function getSelectedMode() {
    const selectedInput = document.querySelector('input[name="signInMode"]:checked');
    return selectedInput ? selectedInput.value : DEFAULT_SIGN_IN_MODE;
}

function setSelectedMode(mode) {
    const selectedInput = document.querySelector(`input[name="signInMode"][value="${mode}"]`);
    if (selectedInput) {
        selectedInput.checked = true;
    }
}

function getSelectedGameIds(signInMode) {
    if (signInMode === 'both') {
        return ['endfield', 'arknights'];
    }

    return [signInMode || DEFAULT_SIGN_IN_MODE];
}
