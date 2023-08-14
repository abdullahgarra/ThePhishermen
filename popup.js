document.addEventListener('DOMContentLoaded', function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    // Apply different background styles based on the message
    // if first time sending / phishing links
    if (message.includes("ftsd") || message.includes("fts") || message.includes("pl") ||
        message.includes("bg") || message.includes("cdg"))
      {
        document.body.classList.add('warning');
        document.getElementById('message-heading').textContent = 'Warning!';
        if (message.includes("fts") && !(message.includes("ftsd"))) {
            document.getElementById('message-text1').innerHTML =`
            <span><img src="icons/fts1.svg" class="bullet-icon" alt="Bullet Icon"></span>
            <span class="tooltip">
              <span>This is the first time you have received</span>
              <br>
              <span>an email from this sender.
              <span class="tooltiptext"> To detect this sender as a new sender again, erase this email after reading it.   </span>
              </span>
          `;
        }
        else if (message.includes("ftsd")) {
          document.getElementById('message-text1').innerHTML =`
          <span><img src="icons/ftsd.svg" class="bullet-icon" alt="Bullet Icon"></span>
          <span class="tooltip">
            <span>This is the first time you have received</span>
            <br>
            <span>an email from this domain.
            <span class="tooltiptext"> To detect this domain as a new domain again, erase this email after reading it.   </span>
            </span>
        `;
        }
        else document.getElementById('message-text1').style.display = "none"
        if (message.includes("pl")){
            document.getElementById('message-text2').innerHTML =`
            <span><img src="icons/pl.svg" class="bullet-icon" alt="Bullet Icon"></span>
            <span class="tooltip">
              <span>This email contains links that are</span>
              <br>
              <span>identified as phishing.
              <span class="tooltiptext"> Be carful when clicking on links from this email.</span>
              </span>
          `;
        }
        else document.getElementById('message-text2').style.display = "none"
        if (message.includes("pc")){
            document.getElementById('message-text3').innerHTML =`
            <span><img src="icons/pc.svg" class="bullet-icon" alt="Bullet Icon"></span>
            <span class="tooltip">
              <span>The content of this email raises</span>
              <br>
              <span>suspicion of phishing.
              <span class="tooltiptext"> Be carful when replaying to this email.</span>
              </span>
          `;
        }
        else document.getElementById('message-text3').style.display = "none"  
        if (message.includes("bg")){
          document.getElementById('message-text4').innerHTML =`
          <span><img src="icons/g.png" class="bullet-icon" alt="Bullet Icon"></span>
          <span class="tooltip">
            <span>The content of this email contains</span>
            <br>
            <span> several instances of poor grammar.
            <span class="tooltiptext"> Be carful when replaying to this email.</span>
            </span>
        `;
        }
        else if (message.includes("cdg")){
          document.getElementById('message-text4').innerHTML =`
          <span><img src="icons/g.png" class="bullet-icon" alt="Bullet Icon"></span>
          <span class="tooltip">
            <span>Can't determine if the content of</span>
            <br>
            <span>this email has bad grammar.
            <span class="tooltiptext"> Be carful when replaying to this email.</span>
            </span>
        `;
        }
        else document.getElementById('message-text4').style.display = "none"  
        document.getElementById('message-image').src = 'icons/warning-icon.svg';
      }

    var exitButton = document.getElementById('exitButton');
    exitButton.addEventListener('click', function() {
      window.close();
    });
  });
  