
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    const alerts = {
      'ftsd': {
        title: 'Notes On First Time Domain',
        text: 'This is the first time you received an email from this domain.',
        imgSrc: 'imgs/ftsd.svg',
        p: 'message-fts'
      },
      'fts': {
        title: 'Notes On First Time Sender',
        text: 'This is the first time you received an email from this sender.',
        imgSrc: 'imgs/fts.svg',
        p: 'message-fts'
      },
      'pl': {
        title: 'Notes On Suspicious Links',
        text: 'This email contains links that are identified as phishing.',
        imgSrc: 'imgs/pl.svg',
        p: 'message-links'
      },
      'pc': {
        title: 'Notes On Suspicious Content',
        text: 'The content of this email raises suspicion of phishing.',
        imgSrc: 'imgs/pc.svg',
        p: 'message-content'
      },
      'bg': {
        title: 'Notes On Bad Grammar',
        text: 'The content of this email contains several instances of poor grammar.',
        imgSrc: 'imgs/g.png',
        p: 'message-grammar'
      },
      'cdg': {
        title: '',
        text: "Can't determine if the content of this email has bad grammar.",
        imgSrc: 'imgs/g.png',
        p: 'message-grammar'
      },
      'u': {
        title: 'Notes On Urgent Sense',
        text: 'The content of this email raises a sense of urgency.',
        imgSrc: 'imgs/u.jpg',
        p: 'message-urgent'
      }
    };

    applyStylesAndListeners(message, alerts);

    var exitButton = document.getElementById('exitButton');
        exitButton.addEventListener('click', function() {
          window.close();
    });        
  });

  function applyStylesAndListeners(message, alerts) {
    const validAlerts = Object.keys(alerts).filter(alert => message.includes(alert));
  
    if (validAlerts.length === 0 || message.includes('pc')) {
      return;
    }
  
    const body = document.body;
    body.classList.add('warning');
    const heading = document.getElementById('message-heading');
    heading.textContent = 'Warning!';
    const image = document.getElementById('message-image');
    image.src = 'imgs/warning-icon.svg';
  
    const textElements = {
      'message-text1': validAlerts.includes('ftsd') ? alerts['ftsd'].text : '',
      'message-text2': validAlerts.includes('pl') ? alerts['pl'].text : '',
      'message-text3': validAlerts.includes('pc') ? alerts['pc'].text : '',
      'message-text4': validAlerts.includes('bg') ? alerts['bg'].text : alerts['cdg'].text,
      'message-text5': validAlerts.includes('u') ? alerts['u'].text : ''
    };
  
    for (const elementId in textElements) {
      const element = document.getElementById(elementId);
      element.innerHTML = textElements[elementId];
      if (textElements[elementId] === '') {
        element.style.display = 'none';
      }
    }
  
    for (const validAlert of validAlerts) {
      const alertSpan = document.createElement('span');
      alertSpan.className = `${validAlert}-trigger`;      
      const alertA = document.createElement('a');
      alertA.href = '#';
      alertA.id = `${validAlert}-link`;
      alertSpan.appendChild(alertA);
      const imgElement = document.createElement('img');
      imgElement.src = alerts[validAlert].imgSrc;
      // alert(alerts[validAlert]);
      imgElement.className = 'bullet-icon';
      imgElement.alt = 'Bullet Icon';
      alertA.appendChild(imgElement);
      alert(imgElement.src);
      
      const messageText1 = document.getElementById('message-text1');

      messageText1.appendChild(alertSpan);

      // Append the <a> element within the existing HTML structure


      // Listener for more information
      createListener(`${validAlert}-trigger`, alerts[validAlert].title, alerts[validAlert].text);
    }
  }


function createListener(span_name, title, text){
  const popupTriggers = document.querySelectorAll('.' + span_name);
  popupTriggers.forEach(popupTrigger => {
    popupTrigger.addEventListener('click', () => {
      const iconRect = popupTrigger.getBoundingClientRect();
      const popupWidth = 300;
      const popupHeight = 200;
      const left = iconRect.left - popupWidth + window.screenX;
      const top = iconRect.top + window.screenY;
      const popupFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`;

      const popupWindow = window.open('', '_blank', popupFeatures);

      // Write additional content to the popup window
      popupWindow.document.write('<p>' + text + '</p');
      popupWindow.document.title = title;
    });
  });
}
  