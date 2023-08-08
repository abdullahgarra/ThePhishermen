document.addEventListener('DOMContentLoaded', function() {

    const popupContainer = document.getElementById("popupContainer");
    const closeButton = document.getElementById("closeButton");

    closeButton.addEventListener("click", () => {
        document.body.classList.remove("no-scroll");

        const selectedOptions = []; // Array to store selected options

        const checkboxes = popupContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedOptions.push(checkbox.name);
            }
        });

        chrome.runtime.sendMessage({ action: "preferencesSelections", message: selectedOptions }, function(response) {
        window.close();});
        
    });

});