

/* ---------------------------- Token handling ---------------------------- */

/**
 * Get the user's access_token.
 * @param {boolean} interactive - If the user is not authorized, should the auth UI be displayed.
 * @param {function} callback - Async function to receive the getAuthToken result.
 */
function getAuthToken(interactive, callback) {
  chrome.identity.getAuthToken({ interactive},callback);
}

/**
 * If the user is authorized, start working.
 * @param {string} token - User's access_token.
*/
function handleAuthToken(token) {
  if (!token) {
    chrome.action.setIcon({ path: 'icons/red_icon.png' });
    console.error(chrome.runtime.lastError);
  } else {
    setStoredAccessToken(token, preferencesPopUp());
  }
}

/**
 * Retrieve the stored access token
 * @param {function} callback - Callback function to handle the retrieved access token.
 */
function getStoredAccessToken(callback) {
  chrome.storage.local.get(['access_token'], function(result) {
        callback(chrome.runtime.lastError ? null : result.access_token);
  });
}

/**
 * Store the access token
 * @param {string} token - Access token to be stored.
 * @param {function} callback - Callback function to handle the storage result.
*/
function setStoredAccessToken(token, callback) {
  chrome.storage.local.set({ 'access_token': token }, function() {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log('Access token stored successfully');
    }
    if (callback) {
      callback();
    }
  });
}


/**
 * Stored token doesn't mean valid token
 * An api call to verify the stored token
*/
function checkAccessTokenValidity(accessToken) {
  return fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(response => {
      if (response.status === 200) {
        return true;
      } else if (response.status === 401) {
        return false;
      }
    })
    .catch(error => {
      console.error('Error checking access token validity:', error);
      throw error; 
    });
}

/* ---------------------------- Handling "preferences" var   ---------------------------- */

/*
 * Get user's preferences
*/
function getStoredPreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['preferences'], function(result) {
      if (chrome.runtime.lastError) {
        // Handle storage error
        reject(chrome.runtime.lastError);
      } else if (!result.hasOwnProperty('preferences')) {
        // 'preferences' not found
        resolve(null);
      } else {
        // 'preferences' found
        resolve(result.preferences);
      }
    });
  });
}

/**
 * Store the new preferences
 * @param {string} preferences - preferences to be stored.
*/
function setStoredPreferences(preferences) {
  chrome.storage.local.set({ 'preferences': preferences }, function() {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      UIforPreferences();
    }
  });
}

/*
 * Handle the UI given user's preferences.
 */
function UIforPreferences(){
  getStoredPreferences().then((preferences) => {
    if (preferences !== null && preferences.length !== 0){
      chrome.action.setIcon({ path: 'icons/green_icon.png' });
      chrome.action.setTitle({ title: "Click to change your preferences" });
    }
    else {
      chrome.action.setIcon({ path: 'icons/orange_icon.png' });
      chrome.action.setTitle({ title: "Click to choose your preferences" });
    }
  }).catch((error) => {
    console.error(error);
  });
}

/* ---------------------------- Extension's Icon handling  ---------------------------- */

/*
 * User clicked on the icon of the extension
 * Check if the user is authenticated
*/
function iconActionClicked(tab) {
  // Check if access token is stored
  getStoredAccessToken(function(storedToken) {
    if (storedToken) {
      checkAccessTokenValidity(storedToken)
      .then(isValid => {
        if (isValid){
                preferencesPopUp();
        }
        else {
            getAuthToken(interactive=true, handleAuthToken);
        }
      })
      .catch(error => {
        console.error('Error checking access token validity:', error);
        chrome.action.setIcon({ path: 'icons/red_icon.png' });
      });
  }
  else {
    getAuthToken(interactive=true, handleAuthToken);
  }
  });
}

chrome.action.onClicked.addListener(iconActionClicked);


/* ---------------------------- Url changes handling  ---------------------------- */

// Keep track of the tabs that were injected
var tabsSet = new Set();

// --- On Reloading
// Need to inject again, so will remove it from set
chrome.webNavigation.onCommitted.addListener((details) => {
  if (["reload"].includes(details.transitionType)) {
      tabsSet.delete(details.tabId);
  }
});

/*
 * URL changed
 * Check if the new page is GMAIL and inbox
*/
function browserInject(tabId, changeInfo, tab){

   // Check if access token is stored
   getStoredAccessToken(function(storedToken) {

    if (storedToken && changeInfo.url &&
        changeInfo.status === 'loading' &&
        changeInfo.url.includes('mail.google.com/mail/u/') &&
        changeInfo.url.includes('inbox/'))
         {
              (async () => {
                // Content Script Injection only if
                // we didn't inject already
                if (!tabsSet.has(tabId)) {
                  tabsSet.add(tabId);
                  await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js'],
                  });
                }
                // Call client to handle the email
                // Use preferences
                getStoredPreferences().then((preferences) => {
                  if (preferences !== null) {
                    chrome.tabs.sendMessage(tabId, { action: 'invokeFunction', functionName: 'handleEmails',
                                                     token: storedToken, tabUrl: changeInfo.url, sessionPreferences: preferences });
                  } else {
                    chrome.tabs.sendMessage(tabId, { action: 'invokeFunction', functionName: 'handleEmails', token: storedToken,
                                            tabUrl: changeInfo.url, sessionPreferences: [] });
                  }
                }).catch((error) => {
                  console.error(error);
                });
              })();
          }
         }
     )}

// Add the tab update event listener
chrome.tabs.onUpdated.addListener(browserInject);


/* ---------------------------- Popups creations  ---------------------------- */

/*
 * Create preferences popup
 * Take into account the user's preferences
*/
function preferencesPopUp(){

  getStoredPreferences().then((preferences) => {
    if (preferences !== null) {
      var popupUrl = chrome.runtime.getURL("popups/preferencesPopUp.html") + `?message=${encodeURIComponent(preferences)}`;
    }
    else {
      var popupUrl = chrome.runtime.getURL("popups/preferencesPopUp.html") + `?message=${encodeURIComponent([])}`;
    }
    chrome.windows.create({ url: popupUrl, type: "popup", width: 450, height: 600});
  }).catch((error) => {
    // Handle storage error
    console.error(error);
  });
}

/*
 * Create preferences/warning popup
 * Waiting for a message from the client side
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Creation of the warning popup
  // Only if alerts were found for the popup
  if (request.action === "createPopup" && request.message.length > 0) {
    // Get the alerts found for the new email
    var alerts = request.message;
    var popupUrl = chrome.runtime.getURL("popups/warningPopUp.html") + `?alerts=${encodeURIComponent(alerts)}`;
    chrome.windows.create({ url: popupUrl, type: "popup", width: 410, height: 400 });
    sendResponse({ message: "Popup created!" });
  }

  // Handle preferences selection from user
  if (request.action === "preferencesSelections") {
    preferences = request.message;
    // Call UI handler inside
    setStoredPreferences(preferences);
    sendResponse({ message: "Preferences received!" });
  }
});





