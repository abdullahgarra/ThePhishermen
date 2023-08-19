const content_text =
    "Phishing email often exhibit repetitive patterns and employ" +
    "specific words to mimic legitimate communication.<br>" +
    "We offer a phishing detection service that analyzes email content, "+
    "processing and comprehending the extensive data within emails. " +
    "The 'Low' button means you're okay with some probability that the content is phishing." 
createListenerForExplanation('content-icon', 'Info On Content Detection', content_text);
const link_text =
    "Phishing links in emails mimic real URLs to deceive recipients, " +
    "into revealing data or spreading malware.<br>" +
    "We offer a phishing detection service that checks these links carefully, "+
    "through a spectrum of information levels." +
    " This method offers a detailed review or a simplified inspection," +  
    "relying on fewer data inputs for analysis."
    
createListenerForExplanation('links-icon', 'Info On Links Detection', link_text);
const grammar_text = 
    "Bad grammar/spelling in emails can signal phishing. " +
    "Be cautious with such emails, especially for unexpected requests" +
    ", urgency, or unfamiliar links. <br>" +
    " We offer a test comparing email content to a valid version." +
    " High similarity indicates validity." +
    " The 'Low' button means you're okay with less similarity."
createListenerForExplanation('grammar-icon', 'Info On Grammar Detection', grammar_text);
const urgency_text =  
  "The urgency in an email can signal phishing. " +
  "Be cautious with urgent emails, especially for unexpected requests, unfamiliar links," +
  " or sensitive info. " +
  " We offer a test to determine if the email conveys a sense of urgency." +
  " High score means indicates validity." +
  " The 'Low' button means you're okay with some sense of urgency."
createListenerForExplanation('urgency-icon', 'Info On Urgency Detection', urgency_text);

document.addEventListener('DOMContentLoaded', function() {
    
    const linksCheckbox = document.getElementById("Links");
    const linksContainer = document.getElementById("linksContainer");
    const errorContainerLinks = document.getElementById("errorContainerLinks");

    const grammarCheckbox = document.getElementById("Grammar");
    const grammarContainer = document.getElementById("grammarContainer");
    const errorContainerGrammar = document.getElementById("errorContainerGrammar");    


    const urgencyCheckbox = document.getElementById("Urgency");
    const urgencyContainer = document.getElementById("urgencyContainer");
    const errorContainerUrgency = document.getElementById("errorContainerUrgency");

    // Make sure that the 'errors' comments are deleted 
    // Make sure to present the buttons once checked
    createListenerForCheckbox(linksCheckbox, linksContainer, errorContainerLinks)
    createListenerForCheckbox(grammarCheckbox, grammarContainer, errorContainerGrammar)
    createListenerForCheckbox(urgencyCheckbox, urgencyContainer, errorContainerUrgency)

    // Make sure that the 'errors' comments are deleted 
    // Make sure to present the button as selected
    handleClickOnPreferencesButtons(errorContainerLinks,
                                    errorContainerGrammar, errorContainerUrgency);

    // Previous preferences are sent,
    // we make sure that these preferences are presented to the user
    const urlParams = new URLSearchParams(window.location.search);
    handlePreviousPreferences(urlParams, linksContainer, 
                            grammarContainer, urgencyContainer);

    // Listener for exiting
    createListenerForCloseButton(errorContainerLinks,
                                 errorContainerGrammar,
                                 errorContainerUrgency);

});

function createListenerForExplanation(icon_name, title, text){
    const currIcon = document.getElementById(icon_name);
    currIcon.addEventListener('click', () => {
        const iconRect = currIcon.getBoundingClientRect();
        const popupWidth = 350;
        const popupHeight = 200;
        const left = iconRect.left - popupWidth + window.screenX;
        const top = iconRect.top + window.screenY;
        const popupFeatures = `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`;

        const popupWindow = window.open('', '_blank', popupFeatures);
        popupWindow.document.body.innerHTML = '<p style="font-size: 15px;">' + text + '</p>';

        //popupWindow.document.write('<p>' + text + '</p');
        popupWindow.document.title = title;
    });
}

function createListenerForCheckbox(checkboxElement, containerElement, errorContainerElement){
    checkboxElement.addEventListener("change", function() {
        if (checkboxElement.checked) {
            containerElement.classList.remove("hidden");
        } else {
            containerElement.classList.add("hidden");
            const buttonsInContainer = containerElement.querySelectorAll(".button");
            buttonsInContainer.forEach(btn => {
                btn.classList.remove("selected");
            }); 
            errorContainerElement.classList.add("hidden");
            errorContainerElement.textContent = ""; 
        } 
    });
}

function handleClickOnPreferencesButtons(errorContainerLinks,
                                        errorContainerGrammar,
                                        errorContainerUrgency){

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
            else if (parentDivId == "linksContainer"){
                errorContainerLinks.classList.add("hidden");
                errorContainerLinks.textContent = "";
            }
        });
    });
}

function handlePreviousPreferences(urlParams, linksContainer,
                                   grammarContainer, urgencyContainer){
    
    const preferences = urlParams.get('message');

    document.getElementById('Content').checked = preferences.includes("Content");
    document.getElementById('Links').checked = preferences.includes("Links");
    document.getElementById('Grammar').checked = preferences.includes("Grammar");
    document.getElementById('Urgency').checked = preferences.includes("Urgency");

    if (preferences.includes("Links")){
        linksContainer.classList.remove("hidden");
        const buttons = linksContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (preferences.includes(button.id)){
                button.classList.add("selected");
            } 
        });
    }

    if (preferences.includes("Grammar")){
        grammarContainer.classList.remove("hidden");
        const buttons = grammarContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (preferences.includes(button.id)){
                button.classList.add("selected");
            } 
        });
    }

    if (preferences.includes("Urgency")){
        urgencyContainer.classList.remove("hidden");
        const buttons = urgencyContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (preferences.includes(button.id)){
                button.classList.add("selected");
            } 
        });
    }
}

function createListenerForCloseButton(errorContainerLinks,
                                      errorContainerGrammar,
                                      errorContainerUrgency)
{
    const closeButton = document.getElementById("closeButton");
    closeButton.addEventListener("click", () => {
        
        document.body.classList.remove("no-scroll");

        // Find selectedOptions
        const selectedOptions = findSelectedOptions();

        // Check if can exit popup
        //  Create suitable errors in func
        flag = checkForError(selectedOptions,  errorContainerLinks,
                             errorContainerGrammar, errorContainerUrgency);
        if (flag) {
            chrome.runtime.sendMessage({ action: "preferencesSelections", message: selectedOptions }, function(response) {
            window.close();});
        }
    });
}

function findSelectedOptions(){

    const selectedOptions = [];

    const popupContainer = document.getElementById("popup-content");
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
    return selectedOptions
}

function checkForError(selectedOptions,  errorContainerLinks,
                       errorContainerGrammar, errorContainerUrgency){
    var flag = true;
    if (selectedOptions.includes("Links") &&
        !selectedOptions.includes("LinksLow") &&
        !selectedOptions.includes("LinksHigh")
        ) {
            errorContainerLinks.textContent = "Select a links detection option.";
            errorContainerLinks.classList.remove("hidden");
            flag = false;
        }
    if (selectedOptions.includes("Urgency")  &&
    !selectedOptions.includes("UrgencyLow") &&
    !selectedOptions.includes("UrgencyHigh")) {
        errorContainerUrgency.textContent = "Select a urgency detection option.";
        errorContainerUrgency.classList.remove("hidden");
        flag = false;
    }
    if (selectedOptions.includes("Grammar")  &&
    !selectedOptions.includes("GrammarLow") &&
    !selectedOptions.includes("GrammarHigh")) {
        errorContainerGrammar.textContent = "Select a Grammar detection option.";
        errorContainerGrammar.classList.remove("hidden");
        flag = false;
    }
    return flag;
}