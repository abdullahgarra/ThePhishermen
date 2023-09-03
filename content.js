
var preferences;

/*
 * Current website is Gmail
 * Check to see if the website is an email from inbox
*/
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'invokeFunction' && message.functionName === 'handleEmails') {

      // Get params from background
      const token = message.token;
      const tabUrl = message.tabUrl; // Access the tab object
      preferences = message.sessionPreferences;

      // Check if we can identify the page as an email 
      const legacyThreadIdElement = document.querySelector('[role="main"] [data-legacy-thread-id]');
      const legacyThreadId = legacyThreadIdElement ? legacyThreadIdElement.getAttribute('data-legacy-thread-id') : null;
      if (token && legacyThreadId && tabUrl){
          await readMessageAndAnalyzeIfUnread(legacyThreadId,token);
      }
      
    }
  });


/*
 * Analyzed email only if the email is unread (until now)
 * @param {string} messageId - The id of the email, for GmailAPI
 * @param {string} token - User's access_token.
*/
  async function readMessageAndAnalyzeIfUnread(messageId, token) {
  
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    const labelIds = await data.labelIds;
    const isUnread = await labelIds.includes("UNREAD");

    if (isUnread){
      // Create a loading gif next to the email
      showLoadingGifInClass();
      // Only if the email is unread
      const payload = await createAnalyzeRequestPayload(data, token);
      if (payload) {
          await sendAnalyzeRequest(payload);
      }
    }
  }
  catch(error) {
      console.log(error)
    };
}

/* ---------------------------- createAnalyzeRequestPayload ---------------------------- */


async function createAnalyzeRequestPayload(data, token) {
  try {
      // Extract the required data from the email
      const headers = data.payload.headers.reduce((acc, header) => {
        acc[header.name.toLowerCase()] = header.value;
        return acc;
      }, {});

      const email_content = getMessageBody(data);
      const links = extractLinksFromContent(email_content);
      const emailSender = getSenderEmail(headers.from);
      const isFirstTimeFromDomain = await getFirstTimeFromDomain(emailSender, token);
      const isFirstTimeFromSender = await  getFirstTimeFromSender(emailSender, token);

      // Create the payload object
      const extractedData = {
        preferences: preferences,
        decoded_content: email_content,
        links: links,
        indicator_of_first_time_sender: isFirstTimeFromSender,
        indicator_of_first_time_domain: isFirstTimeFromDomain
      };
      return JSON.stringify(extractedData);
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

/* --------------------- Email's body --------------------- */

/*
 * Get the decoded content of the email from the API results
 * @param {string} data - The results from the API
 * https://stackoverflow.com/questions/59603771/how-to-get-the-text-plain-part-of-a-gmail-api-message/59615222#59615222
 */
function getMessageBody(data) {

  if (data.payload.mimeType === 'text/plain' || data.payload.mimeType === 'text/html') {
    // Case 1: Plain text message
    const body = data.payload.body.data;
    return decodeMessageBody(body);
  } else if (data.payload.mimeType === 'multipart/alternative') {
    // Case 2: Html message
    const body = data.payload.parts[0].body.data;
    return decodeMessageBody(body);
  } else if (data.payload.mimeType === 'multipart/mixed') {
    // Check if it's a plain text message with a file attached (Case 3)
    if (data.payload.parts[0].mimeType === 'text/plain' || data.payload.parts[0].mimeType === 'text/html') {
      const body = data.payload.parts[0].body.data;
      return decodeMessageBody(body);
    }
    // Check if it's an html message with a file attached (Case 4)
    else if (data.payload.parts[0].mimeType === 'multipart/alternative') {
      const body = data.payload.parts[0].parts[0].body.data;
      return decodeMessageBody(body);
    }
  }
  // Return null if the message structure is not supported or doesn't match any case
  return null;
}

/*
 * Get the decoded content of the email
 * @param {string} email_text -The content of the email
 */
function decodeMessageBody(email_text){
  var message = "";
  if (email_text.length > 0) {
    // https://stackoverflow.com/questions/24464866/having-trouble-reading-the-text-html-message-part
    email_text = email_text.replace(/_/g, '/').replace(/-/g,'+');
    var decodedMessage = atob(email_text);
    message = new TextDecoder('utf-8').decode(new Uint8Array([...decodedMessage].map(char => char.charCodeAt(0))));
  }
  return message;
}

/* --------------------- Links --------------------- */

function extractLinksFromContent(content) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    const uniqueMatches = [...new Set(matches)];
    return uniqueMatches || [];
}

/* --------------------- Email sender --------------------- */

function getSenderEmail(fromHeader) {
  try {
    const match = fromHeader.match(/<(.*?)>/);
    const email = match ? match[1] : null;
    return email;

  } catch (error) {
    return null;
  }
}

/*
 * Get indicator to whether the sender is an unfamiliar sender
 * of the user
 * @param {string} senderEmail -The email of the sender
 * @param {string} token - User's access_token.
 */
async function getFirstTimeFromSender(senderEmail, token) {
  if (senderEmail == null) {
    return Promise.reject(new Error('Sender email is null'));
  }

  // Use cache to find emails from that sender
  chrome.storage.local.get(`${senderEmail}`, function(result) {

  // If sender email is in cache, that means we received an email from him/her
  if (result[`${senderEmail}`]) {
      return false;
    }
  });

  const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${senderEmail}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const resultSize = data.resultSizeEstimate;
    // Setting the cache
    chrome.storage.local.set({ [`${senderEmail}`]: true });
    return resultSize === 1;
  } catch (error) {
    // Handle any errors
    console.log(error);
    return -1;
  }
}


// Made by chatGPT
function getDomainFromEmail(email) {
  // Split the email address by "@" symbol
  const parts = email.split('@');
  
  // Check if the email has the correct format
  if (parts.length !== 2) {
    return null; // Invalid email format
  }
  
  // The second part after "@" is the domain
  const domain = parts[1];
  return domain;
}

/*
 * Get indicator to whether the domain of the sender
 * is an unfamiliar sender of the user
 * @param {string} senderEmail -The email of the sender
 * @param {string} token - User's access_token.
 */
async function getFirstTimeFromDomain(senderEmail, token) {
  const domain = getDomainFromEmail(senderEmail);
  if (domain == null) {
    return Promise.reject(new Error('Sender domain is null'));
  }

  // Use cache to find emails from that domain
  chrome.storage.local.get(`${domain}`, function(result) {
  
  // If domain is in cache, that means we received an email from it
  if (result[`${domain}`]) {
      return false;
    }
  });

  const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=from:${domain}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const resultSize = data.resultSizeEstimate;
    // Setting the cache
    chrome.storage.local.set({ [`${domain}`]: true });
    return resultSize === 1;
  } catch (error) {
    // Handle any errors
    console.log(error);
    return -1;
  }
}

/* ---------------------------- sendAnalyzeRequest ---------------------------- */

async function sendAnalyzeRequest(payload) {

  // 'https://vm.phishermen.xyz/analyze',
  try {
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
  
   const data = await response.json();
   console.log(data['Answer']);
   const imageElement = document.getElementById('idOfInsertedImg');
    imageElement.remove();
    if (data['Answer'].length > 0 ){
      chrome.runtime.sendMessage({ action: "createPopup", message: data['Answer'] }, function(response) {
            showIconClass("bad");
      });
    }
    else {
      showIconClass("good");
    }    
  }
  catch(error) {
    // Handle any errors
    console.log("error")
  };
}

/* ---------------------------- Helpers ---------------------------- */

/*
 * Create an image next to the email's time
 * which can represent:
 * 1. That the analyzing isn't finished
 * 2. The answer from the analyzes
*/
function insertImageInClass(className, imageSrc, imageId) {

  const imgElement = document.createElement('img');

  imgElement.style.width = '20px';
  imgElement.style.height = '20px';
  imgElement.src = imageSrc;
  // Need an id to remove it later on (the gif)
  imgElement.id = 'idOfInsertedImg';

  // Get the container element with the specified class
  const container = document.querySelector(className);

  // Insert the div element before the element with class "gK"
  // "gK" is the "time of the email" class
  const elementWithClassGK = container.querySelector('.gK');
  elementWithClassGK.insertAdjacentElement('afterend', imgElement);

  // Add a margin between the img element and the class "gK"
  imgElement.style.marginRight = '10px';

 }

/*
 * Create the loading gif next to the email
 * which represents that the analyzing isn't finished
*/
function showLoadingGifInClass(className = '.gE.iv.gt') {
  const imageSrc = 'https://cdn.pixabay.com/animation/2022/11/13/04/07/04-07-35-655_512.gif';
  // Will be used to remove it once the analyzing is finished
  insertImageInClass(className, imageSrc);
}


/*
 * Create the the final mark next to the email
 * which represents the answer from analyzing
*/
 function showIconClass(goodOrBad) {

  const className = '.gE.iv.gt';
  let imageSrc = null;
  if (goodOrBad === 'good'){
    imageSrc = 'https://freeiconshop.com/wp-content/uploads/edd/checkmark-flat.png';
  }
  else if (goodOrBad === 'bad'){
    imageSrc = 'https://www.hammerheadshop.com/wp-content/uploads/2013/11/alert-icon-red-11.png';
  }
   insertImageInClass(className, imageSrc);
 }