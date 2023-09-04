
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('alerts');

    // Changing the title of the popup to be the subject of the email
    const title = urlParams.get('title');
    const popupTitle = document.getElementById("popupTitle");
    if (popupTitle) {
      popupTitle.innerText = title;
    }

    const alerts = {
      'fts': {
        title: 'First Time Sender',
        text: 'This is the first time you received an email from this sender.',
        infoText: "This is the first time you receive an email from this sender. Nevertheless, we've noted a previous interaction with the domain linked to this sender, which reduces potential risks.",
        imgSrc: 'imgs/fts.svg',
        p_class: 'message-fts'
      },
      'ftsd': {
        title: 'First Time Domain',
        text: 'This is the first time you received an email from this domain.',
        infoText: "You've received an email from an unfamiliar domain. Proceed with care and avoid clicking on any suspicious links or downloading attachments. Please delete this email if you want to continue identifing this domain as unfamiliar.",
        imgSrc: 'imgs/ftsd.svg',
        p_class: 'message-fts'
      },
      'pl': {
        title: 'Suspicious Links',
        text: 'This email contains links that are identified as phishing.',
        infoText: 'Clicking on a suspicious link can expose you to malware infections, identity theft, financial loss, privacy breaches, reputation damage, and system compromise, posing significant risks to your online security and personal information.',
        imgSrc: 'imgs/pl.svg',
        p_class: 'message-links'
      },
      'pc': {
        title: 'Suspicious Content',
        text: 'The content of this email raises suspicion of phishing.',
        infoText: "Receiving an email with suspicious content can lead to potential risks, including falling victim to phishing attempts. Exercise caution, refrain from clicking on any links or downloading attachments, and verify the sender's authenticity.",
        imgSrc: 'imgs/pc.svg',
        p_class: 'message-content'
      },
      'bg': {
        title: 'Bad Grammar',
        text: 'The content of this email contains several cases of poor grammar.',
        infoText: 'Emails with bad grammar/spelling are often associated with phishing attempts or scams, where cybercriminals may be trying to deceive you into taking harmful actions or revealing sensitive information. Please be safe and alert.',
        imgSrc: 'imgs/g.png',
        p_class: 'message-grammar'
      },
      'cdg': {
        title: 'Grammar/Spelling Detection',
        text: "Can't determine if the content of this email has bad grammar.",
        infoText: "Can't determine if the content of this email has bad grammar.",
        imgSrc: 'imgs/g.png',
        p_class: 'message-grammar'
      },
      'u': {
        title: 'Urgent Sense',
        text: 'The content of this email raises a sense of urgency.',
        infoText: "Cybercriminals often exploit urgency, pressuring decisions like clicking malicious links or sharing sensitive information. Verify sender's identity and request legitimacy before taking action.",
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
      createListener(`${validAlert}-trigger`, alerts[validAlert].title, alerts[validAlert].infoText);
    }
  }


function createListener(span_name, title, text){
  const popupTriggers = document.querySelectorAll('.' + span_name);
  popupTriggers.forEach(popupTrigger => {
    popupTrigger.addEventListener('click', () => {
      const iconRect = popupTrigger.getBoundingClientRect();
      const popupWidth = 300;
      const popupHeight = 150;
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
  