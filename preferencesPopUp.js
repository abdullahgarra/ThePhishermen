document.addEventListener('DOMContentLoaded', function() {

    const popupContainer = document.getElementById("popupContainer");
    const closeButton = document.getElementById("closeButton");
    const urlParams = new URLSearchParams(window.location.search);
    
    const linksCheckbox = document.getElementById("Links");
    const radioContainer = document.getElementById("radioContainer");

    linksCheckbox.addEventListener("change", function() {
        if (linksCheckbox.checked) {
            radioContainer.classList.remove("hidden");
        } else {
            radioContainer.classList.add("hidden");
        }
    });

    // Preferences
    const message = urlParams.get('message');

    if (!message.includes("Links")){
        document.getElementById('Links').checked = false
    }
    if  (!message.includes("Domain")){
        document.getElementById('Domain').checked = false;
    } 


    closeButton.addEventListener("click", () => {
        document.body.classList.remove("no-scroll");

        const selectedOptions = []; // Array to store selected options

        const checkboxes = popupContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedOptions.push(checkbox.name);
            }
        });

        const radios = popupContainer.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            if (radio.checked) {
                selectedOptions.push(radio.name);
            }
        });        

        chrome.runtime.sendMessage({ action: "preferencesSelections", message: selectedOptions }, function(response) {
        window.close();});
        
    });

});