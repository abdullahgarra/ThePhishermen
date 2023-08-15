document.addEventListener('DOMContentLoaded', function() {

    const popupContainer = document.getElementById("popupContainer");
    const closeButton = document.getElementById("closeButton");
    const urlParams = new URLSearchParams(window.location.search);
    const errorContainer = document.getElementById("errorContainer");
    
    const linksCheckbox = document.getElementById("Links");
    const radioContainer = document.getElementById("radioContainer");

    const regularLinksRadio = document.getElementById("regular_links");
    const reducedLinksRadio = document.getElementById("reduced_links");


    linksCheckbox.addEventListener("change", function() {
        if (linksCheckbox.checked) {
            radioContainer.classList.remove("hidden");
        } else {
            radioContainer.classList.add("hidden");
            errorContainer.classList.add("hidden2");
            errorContainer.textContent = "";
            const radios = popupContainer.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                if (radio.checked) {
                    radio.checked = false;
                }
            }); 
        }
    });

    reducedLinksRadio.addEventListener("change", function() {
        if (linksCheckbox.checked && reducedLinksRadio.checked) {
            errorContainer.classList.add("hidden2");
            errorContainer.textContent = "";
        } 
    });

    regularLinksRadio.addEventListener("change", function() {
        if (linksCheckbox.checked && regularLinksRadio.checked) {
            errorContainer.classList.add("hidden2");
            errorContainer.textContent = "";
        }
    });

    // Preferences
    const message = urlParams.get('message');

    document.getElementById('Links').checked = message.includes("Links");
    document.getElementById('regular_links').checked = message.includes("regular_links");
    document.getElementById('reduced_links').checked = message.includes("reduced_links");
    document.getElementById('grammar').checked = message.includes("grammar");
    document.getElementById('urgency').checked = message.includes("urgency");

    if (message.includes("reduced_links") ||
        message.includes("regular_links")
    ){
        radioContainer.classList.remove("hidden");
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
                selectedOptions.push(radio.id);
            }
        });        

        if (selectedOptions.includes("Links") &&
            !selectedOptions.includes("reduced_links") &&
            !selectedOptions.includes("regular_links")
            ) {
                errorContainer.textContent = "Select a links detection option.";
                errorContainer.classList.remove("hidden2");
        } else {
            // Clear the error message if no issue
            chrome.runtime.sendMessage({ action: "preferencesSelections", message: selectedOptions }, function(response) {
            window.close();});
        }
    });

});