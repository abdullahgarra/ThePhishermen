
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('alerts');

    const alerts = {
      'fts': {
        title: 'Notes On First Time Sender',
        text: 'This is the first time you received an email from this sender.',
        imgSrc: 'imgs/fts.svg',
        p_class: 'message-fts'
      },
      'ftsd': {
        title: 'Notes On First Time Domain',
        text: 'This is the first time you received an email from this domain.',
        imgSrc: 'imgs/ftsd.svg',
        p_class: 'message-fts'
      },
      'pl': {
        title: 'Notes On Suspicious Links',
        text: 'This email contains links that are identified as phishing.',
        imgSrc: 'imgs/pl.svg',
        p_class: 'message-links'
      },
      'pc': {
        title: 'Notes On Suspicious Content',
        text: 'The content of this email raises suspicion of phishing.',
        imgSrc: 'imgs/pc.svg',
        p_class: 'message-content'
      },
      'bg': {
        title: 'Notes On Bad Grammar',
        text: 'The content of this email contains several cases of poor grammar.',
        imgSrc: 'imgs/g.png',
        p_class: 'message-grammar'
      },
      'cdg': {
        title: '',
        text: "Can't determine if the content of this email has bad grammar.",
        imgSrc: 'imgs/g.png',
        p_class: 'message-grammar'
      },
      'u': {
        title: 'Notes On Urgent Sense',
        text: 'The content of this email raises a sense of urgency.',
        imgSrc: 'imgs/u.jpg',
        p_class: 'message-urgent'
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
    if (validAlerts.length === 0 ) {
      return;
    }
  
    const body = document.body;
    body.classList.add('warning');
    const heading = document.getElementById('message-heading');
    heading.textContent = 'Warning!';
    const image = document.getElementById('message-image');
    image.src = 'imgs/warning-icon.svg';
  
    for (const validAlert of validAlerts){
      const element = document.getElementById(alerts[validAlert].p_class);
      element.innerHTML = `
      <span class="${validAlert}-trigger">
        <a href="#" id="${validAlert}-link">
          <img src="${alerts[validAlert].imgSrc}" class="bullet-icon" alt="Bullet Icon">
        </a>
      </span>
      <span>${alerts[validAlert].text}</span>
      `;
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
  