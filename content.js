
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'invokeFunction' && message.functionName === 'readingEmails') {
      // Access the token value from the message object
      const token = message.token;
      const legacyThreadId = document.querySelector('[role="main"] [data-legacy-thread-id]').getAttribute('data-legacy-thread-id');
      const tabUrl = message.tabUrl; // Access the tab object

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

      showLoadingPopup();
      await analyzeMessage(data, token, messageId);

    }
  }
  catch(error) {
          // Handle any errors
          console.log(error)
    };
   
}

function showLoadingPopup() {
  // Create the pop-up overlay element
  const popupOverlay = document.createElement('div');
  popupOverlay.id = 'loading-popup-overlay';

  // Add CSS styling to create the overlay effect
  popupOverlay.style.position = 'fixed';
  popupOverlay.style.top = '0';
  popupOverlay.style.left = '0';
  popupOverlay.style.width = '100%';
  popupOverlay.style.height = '100%';
  //popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  popupOverlay.style.zIndex = '9999';
  popupOverlay.style.display = 'flex';
  popupOverlay.style.justifyContent = 'center';
  popupOverlay.style.alignItems = 'center';

  // Create an image element for the loading GIF
  const loadingGIF = document.createElement('img');
  loadingGIF.src = 'https://thumbs.gfycat.com/EducatedCautiousArmyant-max-1mb.gif'
  //'https://www.netatwork.com/uploads/AAPL/loaders/loading_ajax.gif'
  //'https://iswim.gr/wp-content/plugins/wp-file-manager/images/loading.gif'
//  'https://icon-library.com/images/waiting-icon-gif/waiting-icon-gif-20.jpg'
  //'https://icon-library.com/images/waiting-icon-gif/waiting-icon-gif-1.jpg'
  //'https://3cubed.tech/wp-content/uploads/2019/06/magnifier.gif'
  //'https://h50007.www5.hpe.com/hfws-static/5/img/loader.gif'
  //'https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/circular_progress_indicator_square_medium.gif';
  //https://icon-library.com/images/spinner-icon-gif/spinner-icon-gif-25.jpg'
  // 'https://cdn.dribbble.com/users/1478651/screenshots/6379052/16.gif'
  loadingGIF.alt = 'Loading...';

  // Append the loading GIF to the pop-up overlay
  popupOverlay.appendChild(loadingGIF);

  // Append the pop-up overlay to the body of the page
  document.body.appendChild(popupOverlay);

  // Your code to trigger the loading state (e.g., AJAX request, heavy computation) goes here
  // When you need to remove the loading pop-up, simply remove the overlay from the DOM:

  setTimeout(() =>  popupOverlay.remove(), 750)

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

function getMessageBody(content) {
  var message = null;
  try {
    if ("data" in content.payload.body) {
      message = content.payload.body.data;
      message = decodeMessageBody(message);
    } else if ("data" in content.payload.parts[0].body) {
      message = content.payload.parts[0].body.data;
      message = decodeMessageBody(message);
    } else {
      console.log("body has no data.");
    }
  } catch (error) {
    alert(error);
  }
  return message;
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
    // Extract the required data from the email
    const headers = data.payload.headers.reduce((acc, header) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    }, {});

    const email_content = getMessageBody(data);

    const links = extractLinksFromContent(email_content);

    const emailSender = getSenderEmail(headers.from);

    try {
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
        counter_from_sender: isFirstTimeFromSender
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
          //alert(data['Answer']);
    chrome.runtime.sendMessage({ action: "createPopup", message: data['Answer'] }, function(response) {
      console.log(response.message);
    });
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
  