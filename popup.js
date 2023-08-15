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
            <span><img src="icons/fts1.svg" class="bullet-icon" alt="Bullet Icon"></span>
            <span>This is the first time you have received</span>
            <br>
            <span>an email from this sender.</span>
          `;
        }
        else if (message.includes("ftsd")) {
          document.getElementById('message-text1').innerHTML =`
          <span><img src="icons/ftsd.svg" class="bullet-icon" alt="Bullet Icon"></span>
          <span>This is the first time you have received</span>
          <br>
          <span>an email from this domain.</span>
        `;
        }
        else document.getElementById('message-text1').style.display = "none"
        if (message.includes("pl")){
            document.getElementById('message-text2').innerHTML =`
            <span><img src="icons/pl.svg" class="bullet-icon" alt="Bullet Icon"></span>
            <span>This email contains links that are</span>
            <br>
            <span>identified as phishing. </span>
          `;
        }
        else document.getElementById('message-text2').style.display = "none"
        if (message.includes("pc")){
            document.getElementById('message-text3').innerHTML =`
            <span><img src="icons/pc.svg" class="bullet-icon" alt="Bullet Icon"></span>
            <span>The content of this email raises</span>
            <br>
            <span>suspicion of phishing.</span>
          `;
        }
        else document.getElementById('message-text3').style.display = "none"  
        if (message.includes("bg")){
          document.getElementById('message-text4').innerHTML =`
          <span><img src="icons/g.png" class="bullet-icon" alt="Bullet Icon"></span>
          <span>The content of this email contains</span>
          <br>
          <span> several instances of poor grammar.</span>
        `;
        }
        else if (message.includes("cdg")){
          document.getElementById('message-text4').innerHTML =`
          <span><img src="icons/g.png" class="bullet-icon" alt="Bullet Icon"></span>
          <span>Can't determine if the content of</span>
          <br>
          <span>this email has bad grammar.</span>
        `;
        }
        else document.getElementById('message-text4').style.display = "none"  
        if (message.includes("u")){
          document.getElementById('message-text5').innerHTML =`
          <span><img src="icons/u.jpg" class="bullet-icon" alt="Bullet Icon"></span>
          <span>The content of this email raises</span>
          <br>
          <span>sense of urgency.</span>
        `;
      }
      else document.getElementById('message-text5').style.display = "none" 
        document.getElementById('message-image').src = 'icons/warning-icon.svg';
      }

    var exitButton = document.getElementById('exitButton');
    exitButton.addEventListener('click', function() {
      window.close();
    });
  });
  