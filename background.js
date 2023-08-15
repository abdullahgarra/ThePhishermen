
var preferences = []
//["Links"]

function create_alert(msg) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon1.png',
    title: 'Phishrman',
    message: msg
    }
  );
}


/**
 * Get the user's access_token.
 *
 * @param {object} options
 *   @value {boolean} interactive - If the user is not authorized, should the auth UI be displayed.
 *   @value {function} callback - Async function to receive the getAuthToken result.
 */
function getAuthToken(options) {
  chrome.identity.getAuthToken({ interactive: options.interactive }, options.callback);
}

/**
 * Get the user's access_token or show the authorization UI if access has not been granted.
 */
function getAuthTokenInteractive() {
  getAuthToken({
    interactive: true,
    callback: handleAuthToken
  });
}

/**
 * If the user is authorized, start working.
 *
 * @param {string} token - User's access_token.
 *
 * 
*/
function handleAuthToken(token) {
  if (!token) {
    chrome.action.setIcon({ path: 'icons/red_icon.png' });
    console.error(chrome.runtime.lastError);
  } else {
    setStoredAccessToken(token, function() {
      //create_alert("Hi, welcome! All logged in!");
      chrome.action.setIcon({ path: 'icons/green_icon.png' });
      chrome.action.setTitle({ title: "Click here to change your preferences" });

    });
  }
}

// Retrieve the stored access token
function getStoredAccessToken(callback) {
  chrome.storage.local.get(['access_token'], function(result) {
    if (chrome.runtime.lastError) {
      callback(null);
    } else {
      callback(result.access_token);
    }
  });
}

// Store the access token
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

function preferencesPopUp(preferences){
  var popupUrl = chrome.runtime.getURL("preferencesPopUp.html") + `?message=${encodeURIComponent(preferences)}`;
  chrome.windows.create({ url: popupUrl, type: "popup", width: 400, height: 300});
}


// User clicked on the browser action button. Check if the user is authenticated.
function browserActionClicked(tab) {
  // Check if access token is stored
  getStoredAccessToken(function(storedToken) {
    if (storedToken) {
      checkAccessTokenValidity(storedToken)
      .then(isValid => {
        if (isValid) {
            //create_alert("Hi, welcome back! Already logged in");
            chrome.action.setIcon({ path: 'icons/green_icon.png' });
            // Change the extension title
            chrome.action.setTitle({ title: "Click here to change your preferences" });
        }
        else {
          getAuthTokenInteractive();
        }
        preferencesPopUp(preferences);
      })
      .catch(error => {
        console.error('Error checking access token validity:', error);
        chrome.action.setIcon({ path: 'icons/red_icon.png' });

      });
  }
  else {
    getAuthTokenInteractive();
  }
  });
}

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
      throw error; // Rethrow the error for the caller to handle
    });
}

chrome.action.onClicked.addListener(browserActionClicked);

var tabsSet = new Set();

// --- On Reloading 
chrome.webNavigation.onCommitted.addListener((details) => {
  if (["reload"].includes(details.transitionType) &&
      details.url.includes('mail.google.com/mail/u/') || details.url.includes('inbox/')) {
      tabsSet.delete(details.tabId);
  }
});




function browserInjectIf(tabId, changeInfo, tab){
  console.log("From browser");
  //console.log(changeInfo);
  //console.log(tab);

   // Check if access token is stored
   getStoredAccessToken(function(storedToken) {
    
    if (storedToken && changeInfo.url &&
        changeInfo.status === 'loading' &&
        changeInfo.url.includes('mail.google.com/mail/u/') &&
        changeInfo.url.includes('inbox/'))
         {
           
              console.log("Injecting");
              console.log(tabId);
              (async () => {
                if (!tabsSet.has(tabId)) {
                  tabsSet.add(tabId);
                  console.log("executeScript");
                  console.log(tabId);
                  await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js'],
                  });
                }
                chrome.tabs.sendMessage(tabId, { action: 'invokeFunction', functionName: 'readingEmails', token: storedToken, tabUrl: changeInfo.url, sessionPreferences: preferences });
              })();
          } 
         }
        
     )}


// Add the tab update event listener outside the handleAuthToken function
chrome.tabs.onUpdated.addListener(browserInjectIf);


// Listen for a message from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "createPopup") {
    var message = request.message; // Accessing the message parameter
    // Perform actions with the message parameter
    if (message.includes("ftsd") ||message.includes("fts") || message.includes("pl")
        || message.includes("bg") || message.includes("cdg") || message.includes("u")){
    var popupUrl = chrome.runtime.getURL("popup.html") + `?message=${encodeURIComponent(message)}`;
    chrome.windows.create({ url: popupUrl, type: "popup", width: 400, height: 350 });
    sendResponse({ message: "Popup created!" });
    }
    //chrome.tabs.create({ url: `popup.html?message=${encodeURIComponent(message)}` });
  }
  if (request.action === "preferencesSelections") {
    sendResponse({ message: "Preferences received!" });
    var message = request.message;
    preferences = message;
  }
});


