document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll(".button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const parentDivId = button.parentElement.id;
            const container = document.getElementById(parentDivId);
            const buttonsInContainer = container.querySelectorAll(".button");
            buttonsInContainer.forEach(btn => {
                btn.classList.remove("selected");
            });  
            button.classList.add("selected");
        });
    });

    const popupContainer = document.getElementById("popupContainer");
    const closeButton = document.getElementById("closeButton");
    const urlParams = new URLSearchParams(window.location.search);
    const errorContainer = document.getElementById("errorContainer");
    
    const linksCheckbox = document.getElementById("Links");
    const radioContainer = document.getElementById("radioContainer");

    const regularLinksRadio = document.getElementById("regular_links");
    const reducedLinksRadio = document.getElementById("reduced_links");

    const grammarCheckbox = document.getElementById("grammar");
    const grammarContainer = document.getElementById("grammarContainer");

    const urgencyCheckbox = document.getElementById("urgency");
    const urgencyContainer = document.getElementById("urgencyContainer");


    linksCheckbox.addEventListener("change", function() {
        if (linksCheckbox.checked) {
            radioContainer.classList.remove("hidden");
        } else {
            radioContainer.classList.add("hidden");
            errorContainer.classList.add("hidden");
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
            errorContainer.classList.add("hidden");
            errorContainer.textContent = "";
        } 
    });

    regularLinksRadio.addEventListener("change", function() {
        if (linksCheckbox.checked && regularLinksRadio.checked) {
            errorContainer.classList.add("hidden");
            errorContainer.textContent = "";
        }
    });

    grammarCheckbox.addEventListener("change", function() {
        if (grammarCheckbox.checked) {
            grammarContainer.classList.remove("hidden");
        } else {
            grammarContainer.classList.add("hidden");
            const buttonsInContainer = grammarContainer.querySelectorAll(".button");
            buttonsInContainer.forEach(btn => {
                btn.classList.remove("selected");
            });  
        } 
    });

    urgencyCheckbox.addEventListener("change", function() {
        if (urgencyCheckbox.checked) {
            urgencyContainer.classList.remove("hidden");
        } else {
            urgencyContainer.classList.add("hidden");
            const buttonsInContainer = urgencyContainer.querySelectorAll(".button");
            buttonsInContainer.forEach(btn => {
                btn.classList.remove("selected");
            });  
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

        const buttons = popupContainer.querySelectorAll('button');
        buttons.forEach(button => {
            
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
                errorContainer.classList.remove("hidden");
        } else {
            // Clear the error message if no issue
            chrome.runtime.sendMessage({ action: "preferencesSelections", message: selectedOptions }, function(response) {
            window.close();});
        }
    });

});