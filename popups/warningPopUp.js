
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    // Apply different background styles based on the message
    // if first time sending / phishing links
    if (message.includes("ftsd") || message.includes("fts") || message.includes("pl") ||
        message.includes("bg") || message.includes("cdg") || message.includes("u"))
      {
        document.body.classList.add('warning');
        document.getElementById('message-heading').textContent = 'Warning!';
        if (message.includes("fts") && !(message.includes("ftsd"))) {
            document.getElementById('message-text1').innerHTML =`
            <span class="fts-trigger">
              <a href="#" id="fts-link">
                <img src="imgs/fts1.svg" class="bullet-icon" alt="Bullet Icon">
              </a>
            </span>
            <span>This is the first time you received</span>
            <br>
            <span>an email from this sender.</span>
          `;
          createListener("fts-trigger", "Notes On First Time Sender", "Notes On First Time Sender");

        }
        else if (message.includes("ftsd")) {
          document.getElementById('message-text1').innerHTML =`
          <span class="ftsd-trigger">
            <a href="#" id="ftsd-link">
              <img src="imgs/ftsd.svg" class="bullet-icon" alt="Bullet Icon">
            </a>
          </span>
          <span>This is the first time you received</span>
          <br>
          <span>an email from this domain.</span>
        `;
        createListener("ftsd-trigger", "Notes On First Time Domain", "Notes On First Time Domain");

        }
        else document.getElementById('message-text1').style.display = "none"
        if (message.includes("pl")){
            document.getElementById('message-text2').innerHTML =`
            <span class="links-trigger">
              <a href="#" id="links-link">
                <img src="imgs/pl.svg" class="bullet-icon" alt="Bullet Icon">
              </a>
            </span>
            <span>This email contains links that are</span>
            <br>
            <span>identified as phishing. </span>
          `;
          createListener("links-trigger", "Notes On Suspicious Links", "Suspicious links phishy");

        }
        else document.getElementById('message-text2').style.display = "none"
        if (message.includes("pc")){
            document.getElementById('message-text3').innerHTML =`
            <span class="content-trigger">
              <a href="#" id="content-link">
                <img src="imgs/pc.svg" class="bullet-icon" alt="Bullet Icon">
              </a>
            </span>
            <span>The content of this email raises</span>
            <br>
            <span>suspicion of phishing.</span>
          `;
          createListener("content-trigger", "Notes On Suspicious Content", "Suspicious Suspicious Suspicious");

        }
        else document.getElementById('message-text3').style.display = "none"  
        if (message.includes("bg")){
          document.getElementById('message-text4').innerHTML =`
          <span class="grammar-trigger">
            <a href="#" id="grammar-link">
              <img src="imgs/g.png" class="bullet-icon" alt="Bullet Icon">
            </a>
          </span>
          <span>The content of this email contains</span>
          <br>
          <span> several instances of poor grammar.</span>
        `;
        createListener("grammar-trigger", "Notes On Bad Grammar", "Shila doesn't know Grammar");
        }
        else if (message.includes("cdg")){
          document.getElementById('message-text4').innerHTML =`
          <span>
              <img src="imgs/g.png" class="bullet-icon" alt="Bullet Icon">
          </span>
          <span>Can't determine if the content of</span>
          <br>
          <span>this email has bad grammar.</span>
        `;
        }
        else document.getElementById('message-text4').style.display = "none"  
        if (message.includes("u")){
          document.getElementById('message-text5').innerHTML =`
          <span class="urgent-trigger">
            <a href="#" id="urgent-link">
              <img src="imgs/u.jpg" class="bullet-icon" alt="Bullet Icon">
            </a>
          </span>
          <span>The content of this email raises</span>
          <br>
          <span>sense of urgency.</span>
        `;
        createListener("urgent-trigger", "Notes On Urgent Sense", "Shila this is urgent");
      }
      else document.getElementById('message-text5').style.display = "none" 
      
        document.getElementById('message-image').src = 'imgs/warning-icon.svg';
      }

    var exitButton = document.getElementById('exitButton');
    exitButton.addEventListener('click', function() {
      window.close();
    });
  });

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
  