
# The Phishermen 
[<img src="Icons/ThePhishermen.png" width="100" height="112" title="Click here for Promotional Video">](Icons/PromotionalVideo.mp4)

## Table of Content
  * [Introduction](#introduction)
  * [Installation](#installation)
  * [Directory Tree](#directory-tree)
  * [Result](#result)
  * [Conclusion](#conclusion)

## Introduction

## Installation
**Set up the server**
```
1. Add files from Repo into your google cloud server.
2. Open terminal from that location, and run sudo -E python3 app.py
3. Wait for the server to go up
* You can also run it locally, and change vars accordingly 
```
**Load the extension to your browser [In any computer]**
```
4. Write chrome://extensions/ in your URL in chrome
5. Enable Developer mode
6. Select "Load unpacked" and load the extenstion's folder
```
**Authorization with Google**
```
7. Click on the extension icon
8. Select the Gmail account you want to work with and log in if needed.
9. Go to gmail for start the extension
10. Accept any incoming warnings comming from Google.
```
**Start working with the extension**
```
11. Select your preferences and click "Save and Close"
12. From now on, each unread new email from your inbox will be examined
    by the extension, according to your preferences
13. Feel free to change your preferences to your needs
```
## Directory Tree
```
├── Icons
├── ML Creation
│   ├── Building the dataset
│   ├── ML Content
│   ├── ML Links
├── ML Models
│   ├── gradient_boosting_model.pkl
│   ├── reduce_gradient_boosting_model.pkl
│   ├── svm_model.pkl
├── PopUps
│   ├── Images
│   ├── PreferencesPopUp.html
│   ├── PreferencesPopUp.js
│   ├── PreferencesPopUp.html
│   ├── WarningPopUp.html
│   ├── WarningPopUp.js
├── App.py
├── Background.js
├── Content.js
├── Email.py
├── Feature.py
├── README.md
├── Manifest.json
```


**Files Explanations**
The manifest.json outlines the chrome extenstion permissions, settings, and key components. It establishes a link between the extension and the browser. Our manifest version is 3.0.

The background.js manages the extension's authentication, user preferences, and overall functionality such as creating popups, while content.js handles the preparation for the analysis of email and interaction with web pages. These scripts work together to provide a Chrome extension for email analysis and warning popups.

