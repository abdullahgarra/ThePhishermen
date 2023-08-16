
function createListener(icon_name, title, text){
    const currIcon = document.getElementById(icon_name);
    currIcon.addEventListener('click', () => {
        const iconRect = currIcon.getBoundingClientRect();
        const popupWidth = 350;
        const popupHeight = 200;
        const left = iconRect.left - popupWidth + window.screenX;
        const top = iconRect.top + window.screenY;
        const popupFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`;
  
        const popupWindow = window.open('', '_blank', popupFeatures);
  
        popupWindow.document.write('<p>' + text + '</p');
        popupWindow.document.title = title;
      });
  }

createListener('link-icon', 'Info On Links Detection', 'Shila');
createListener('grammar-icon', 'Info On Grammar Detection', 'Max');
createListener('urgency-icon', 'Info On Urgency Detection', 'Toy');

document.addEventListener('DOMContentLoaded', function() {
    
    const errorContainerUrgency = document.getElementById("errorContainerUrgency");
    const errorContainerGrammar = document.getElementById("errorContainerGrammar");    
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
            if (parentDivId == "urgencyContainer"){
                errorContainerUrgency.classList.add("hidden");
                errorContainerUrgency.textContent = "";
            }
            else if (parentDivId == "grammarContainer"){
                errorContainerGrammar.classList.add("hidden");
                errorContainerGrammar.textContent = "";
            }
           
        });
    });

    const popupContainer = document.getElementById("popupContainer");
    const closeButton = document.getElementById("closeButton");
    const urlParams = new URLSearchParams(window.location.search);
    const errorContainerLink = document.getElementById("errorContainerLink");



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
            errorContainerLink.classList.add("hidden");
            errorContainerLink.textContent = "";
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
            errorContainerLink.classList.add("hidden");
            errorContainerLink.textContent = "";
        } 
    });

    regularLinksRadio.addEventListener("change", function() {
        if (linksCheckbox.checked && regularLinksRadio.checked) {
            errorContainerLink.classList.add("hidden");
            errorContainerLink.textContent = "";
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
            errorContainerGrammar.classList.add("hidden");
            errorContainerGrammar.textContent = ""; 
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
            errorContainerUrgency.classList.add("hidden");
            errorContainerUrgency.textContent = "";
        } 
    });





    // Preferences
    const preferences = urlParams.get('message');

    document.getElementById('Links').checked = preferences.includes("Links");
    document.getElementById('regular_links').checked = preferences.includes("regular_links");
    document.getElementById('reduced_links').checked = preferences.includes("reduced_links");
    document.getElementById('grammar').checked = preferences.includes("grammar");
    document.getElementById('urgency').checked = preferences.includes("urgency");
    //button.classList.add("selected");

    if (preferences.includes("Links")
    ){
        radioContainer.classList.remove("hidden");
    }

    if (preferences.includes("grammar")){
        grammarContainer.classList.remove("hidden");
        const buttons = grammarContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (preferences.includes(button.id)){
                button.classList.add("selected");
            } 
        });
    }

    if (preferences.includes("urgency")){
        urgencyContainer.classList.remove("hidden");
        const buttons = urgencyContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (preferences.includes(button.id)){
                button.classList.add("selected");
            } 
        });
    }



    closeButton.addEventListener("click", () => {
        document.body.classList.remove("no-scroll");

        const selectedOptions = []; // Array to store selected options

        const buttons = popupContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.classList.contains('selected')) {
                selectedOptions.push(button.id);
            }
        });

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
        var flag = true;
        if (selectedOptions.includes("Links") &&
            !selectedOptions.includes("reduced_links") &&
            !selectedOptions.includes("regular_links")
            ) {
                errorContainerLink.textContent = "Select a links detection option.";
                errorContainerLink.classList.remove("hidden");
                flag = false;
            }
        if (selectedOptions.includes("urgency")  &&
        !selectedOptions.includes("urgencyLow") &&
        !selectedOptions.includes("urgencyHigh")) {
            errorContainerUrgency.textContent = "Select a urgency detection option.";
            errorContainerUrgency.classList.remove("hidden");
            flag = false;
        }
        if (selectedOptions.includes("grammar")  &&
        !selectedOptions.includes("grammarLow") &&
        !selectedOptions.includes("grammarHigh")) {
            errorContainerGrammar.textContent = "Select a Grammar detection option.";
            errorContainerGrammar.classList.remove("hidden");
            flag = false;
        }
        if (flag) {
            // Clear the error message if no issue
            chrome.runtime.sendMessage({ action: "preferencesSelections", message: selectedOptions }, function(response) {
            window.close();});
        }
    });

});