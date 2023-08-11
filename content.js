var preferences; 
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'invokeFunction' && message.functionName === 'readingEmails') {
      console.log("Content, reading");
      // Access the token value from the message object
      const token = message.token;
      const legacyThreadId = document.querySelector('[role="main"] [data-legacy-thread-id]').getAttribute('data-legacy-thread-id');
      const tabUrl = message.tabUrl; // Access the tab object
      preferences = message.sessionPreferences;
      // Call your specific function with the token value      
      if (token && legacyThreadId && tabUrl){
          await readMessageAndAnalyzeIfUnread(legacyThreadId,token);
      }
      
    }
  });
  
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
    // Only if the message is unread
    // isUnread
    if (isUnread){

      showLoadingPopuInClass();
      await analyzeMessage(data, token, messageId);

    }
  }
  catch(error) {
          // Handle any errors
          console.log(error)
    };
   
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

// 1 if first time, 0 else
async function getFirstTimeFromDomain(senderEmail, token) {
  const domain = getDomainFromEmail(senderEmail);
  alert(domain);
  if (domain == null) {
    return Promise.reject(new Error('Sender email domain is null'));
  }

  // Use cache to find emails from that sender
  chrome.storage.local.get(`${domain}`, function(result) {
  
  // If sender email domain is in cache, that means we recived an email from him
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


function showLoadingPopuInClass(className = '.gE.iv.gt') {
  
  const imageSrc = 'https://cdn.pixabay.com/animation/2022/11/13/04/07/04-07-35-655_512.gif';
  // JavaScript code to insert the div element
  const imgElement = document.createElement('img');
  
  imgElement.id = 'showLoadingPopuInClass';
  imgElement.style.width = '20px';   // Adjust this value for the desired width
  imgElement.style.height = '20px';  // Adjust this value for the desired height

  // Set the source and alt attributes for the image
  imgElement.src = imageSrc;

  // Get the container element with the specified class
  const container = document.querySelector(className);
  
  // Insert the div element before the element with class "gK"
  const elementWithClassGK = container.querySelector('.gK');
  elementWithClassGK.insertAdjacentElement('afterend', imgElement);
  
  // Add a margin between the img element and the class "gH"
  imgElement.style.marginRight = '10px'; // Adjust this value for the desired space

 }

 function showCheckMarkInClass(className = '.gE.iv.gt') {
  
  const imageSrc = 'https://freeiconshop.com/wp-content/uploads/edd/checkmark-flat.png';
  // JavaScript code to insert the div element
  const imgElement = document.createElement('img');
  
  imgElement.style.width = '20px';   // Adjust this value for the desired width
  imgElement.style.height = '20px';  // Adjust this value for the desired height

  // Set the source and alt attributes for the image
  imgElement.src = imageSrc;

  // Get the container element with the specified class
  const container = document.querySelector(className);
  
  // Insert the div element before the element with class "gK"
  const elementWithClassGK = container.querySelector('.gK');
  elementWithClassGK.insertAdjacentElement('afterend', imgElement);
  
  // Add a margin between the img element and the class "gH"
  imgElement.style.marginRight = '10px'; // Adjust this value for the desired space

  //setTimeout(() =>  imgElement.remove(), 750)

 }


function decodeMessageBody(mtext){
  var message = "";
  if (mtext.length > 0) {
    // https://stackoverflow.com/questions/24464866/having-trouble-reading-the-text-html-message-part
    mtext = mtext.replace(/_/g, '/').replace(/-/g,'+');
    var decodedMessage = atob(mtext);
    message = new TextDecoder('utf-8').decode(new Uint8Array([...decodedMessage].map(char => char.charCodeAt(0))));
  }
  return message;
}

function getMessageBody(data) {

//https://stackoverflow.com/questions/59603771/how-to-get-the-text-plain-part-of-a-gmail-api-message/59615222#59615222

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



function getSenderEmail(fromHeader) {
  try {
    const match = fromHeader.match(/<(.*?)>/);
    const email = match ? match[1] : null;
    return email;

  } catch (error) {
    return null;
  }
}

// 1 for first time, 0 for else
async function getFirstTimeFromSender(senderEmail, token) {
  if (senderEmail == null) {
    return Promise.reject(new Error('Sender email is null'));
  }

  // Use cache to find emails from that sender
  chrome.storage.local.get(`${senderEmail}`, function(result) {
  
  // If sender email is in cache, that means we recived an email from him
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


async function createAnalyzeRequestPayload(data, token) {
  try {  
      // Extract the required data from the email
      const headers = data.payload.headers.reduce((acc, header) => {
        acc[header.name.toLowerCase()] = header.value;
        return acc;
      }, {});

      const email_content = getMessageBody(data);
      //const links = extractLinksFromContent(email_content);

      var links = [];
      if ( preferences.includes("Links")) {
        links = extractLinksFromContent(email_content);
      }

      const emailSender = getSenderEmail(headers.from);
    
      var isFirstTimeFromDomain = false;
      if ( preferences.includes("Domain")) {
        isFirstTimeFromDomain = await getFirstTimeFromDomain(emailSender, token);
      }
    
      const isFirstTimeFromSender = await  getFirstTimeFromSender(emailSender, token);

      // Create the payload object
      const extractedData = {
        messageId: data.id,
        subject: headers.subject,
        time: headers.date,
        sender_email: headers.from,
        content: data.snippet,
        decoded_content: email_content,
        links: links,
        counter_from_sender: isFirstTimeFromSender,
        counter_from_domain: isFirstTimeFromDomain
      };
      return JSON.stringify(extractedData);
    }
    catch (error) {
    console.error(error);
    return null;
    }
}


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
   const imageElement = document.getElementById('showLoadingPopuInClass');
    imageElement.remove();
    if (data['Answer'].includes("fts") || data['Answer'].includes("pl")){
      chrome.runtime.sendMessage({ action: "createPopup", message: data['Answer'] }, function(response) {
      });
    }
    else {
      showCheckMarkInClass();
    }    
  }
  catch(error) {
    // Handle any errors
    console.log("error")
  };
}

async function analyzeMessage(data, token, messageId) {

  //const hasRun = localStorage.getItem(`${CONTENT_SCRIPT_RUN_FLAG}_${messageId}`);
//  if (!hasRun) {
  const payload = await createAnalyzeRequestPayload(data, token);
    if (payload) {
      await sendAnalyzeRequest(payload);
    }
    /*
    const fromHeader = data.payload.headers.find(header => header.name.toLowerCase() === 'from');
    const senderValue = fromHeader ? fromHeader.value : '';
    const senderMatches = senderValue.match(/(.*)<(.+@[^>]+)>/);

    let senderName = '';
    let senderEmail = '';

    if (senderMatches) {
        senderName = senderMatches[1].trim();
        senderEmail = senderMatches[2].trim();
    } else {
        senderName = senderValue.trim();
    }
    */
  //}
  //else {
    // Mark the content script as run for this tab
    //localStorage.setItem(`${CONTENT_SCRIPT_RUN_FLAG}_${messageId}`, true);
 // }
}


function extractLinksFromContent(content) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    const uniqueMatches = [...new Set(matches)];
    return uniqueMatches || [];
}
  