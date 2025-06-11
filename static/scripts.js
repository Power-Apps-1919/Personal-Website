/**
 * This script contains functions to handle various UI interactions
 * such as theme toggling, profile menu toggling, and popup handling.
 */

// Function to toggle theme
/**
 * Toggles the website theme between light and dark modes.
 * @param {Event} event - The event object from the theme toggle switch.
 */
function toggleTheme(event) {
    const isChecked = event.target.checked; // Check if the toggle is checked
    const body = document.body; // Get the body element
    const newTheme = isChecked ? "dark" : "light"; // Determine the new theme
    body.setAttribute("data-theme", newTheme); // Set the new theme on the body element

    // Set theme in cookie
    document.cookie = `theme=${newTheme}; path=/; max-age=${30*24*60*60}`;
}

// Function to close profile menu
/**
 * Closes the profile menu.
 * @param {string} menuId - The ID of the profile menu element.
 */
function closeProfileMenu(menuId) {
    const menu = document.getElementById(menuId);
    menu.classList.remove('active');
}

// Function to toggle profile menu
/**
 * Toggles the visibility of the profile menu.
 * @param {string} menuId - The ID of the profile menu element.
 * @param {string} avatarClass - The class of the avatar element.
 */
function toggleProfileMenu(menuId, avatarId) {
    const menu = document.getElementById(menuId);
    menu.classList.toggle('active');

    // Update profile details
    const userName = document.querySelector('#user-avatar').innerText;
    const userEmail = document.querySelector('#profile-email').innerText;
    document.getElementById('profile-name').innerText = userName;
    document.getElementById('profile-email').innerText = userEmail;

    // Event listener to close profile menu when clicking outside
    document.addEventListener('click', function (e) {
        const avatar = document.getElementById(avatarId);
        if (!menu.contains(e.target) && !avatar.contains(e.target)) {
            menu.classList.remove('active');
        }
    }, { once: true });
}

// Function to open set name popup
/**
 * Opens the popup for setting the user's name and email.
 * @param {string} popupId - The ID of the popup element.
 * @param {string} userName - The user's name.
 * @param {string} userEmail - The user's email.
 */
function openSetNamePopup(popupId, userName, userEmail) {
    const popup = document.getElementById(popupId);
    popup.style.display = 'block'; // Display the popup

    // Retrieve user details from cookies if not provided
    userName = userName || getCookie('user_name') || '';
    userEmail = userEmail || getCookie('user_email') || '';

    // Set the user name and email in the input fields
    document.querySelector(`input[name="user_name"]`).value = userName;
    document.querySelector(`input[name="user_email"]`).value = userEmail;
}

// Function to send user data to the server using AJAX
/**
 * Sends the user's name and email to the server and updates the UI with the response.
 * @param {string} inputName - The name attribute of the input field for the user's name.
 * @param {string} inputEmail - The name attribute of the input field for the user's email.
 * @param {string} popupId - The ID of the popup element.
 * @param {string} headerSelector - The CSS selector for the header element to update.
 * @param {string} avatarId - The ID of the avatar element to update.
 */
function sendUserData(inputName, inputEmail, popupId, headerSelector, avatarId) {
    const userName = document.querySelector(`input[name="${inputName}"]`).value; // Get the user name from the input field
    const userEmail = inputEmail ? document.querySelector(`input[name="${inputEmail}"]`).value : ''; // Get the user email from the input field if provided

    // Sending the user details to the server using AJAX
    fetch('/set_name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify({ user_name: userName, user_email: userEmail }), // Sending the user details as JSON
    })
    .then((response) => response.json()) // Parsing the JSON response
    .then((data) => {
        if (data.success) {
            // Close the popup once the details are submitted successfully
            document.getElementById(popupId).style.display = 'none';
            
            // Update the displayed user name in the header
            document.querySelector(headerSelector).innerText = `👋 Hey, ${data.user_name}! Welcome to My Portfolio! `;

            // Get the first letter of each word in the user's name
            const avatarName = data.user_name.split(' ')  // Split name into words
                .map(word => word[0].toUpperCase())       // Get first letter of each word
                .join('');                               // Join letters together
            
            // Get the avatar element by its ID and update the innerText
            const avatar = document.getElementById(avatarId);
            avatar.innerText = avatarName;  // Display initials (e.g., "HI" for "Hiro Inocha")

            // Update profile details in the profile menu
            document.getElementById('profile-name').innerText = data.user_name;
            document.getElementById('profile-email').innerText = data.user_email;

            // Set cookies for user data
            document.cookie = `user_name=${data.user_name}; path=/; max-age=${30*24*60*60}`;
            document.cookie = `user_email=${data.user_email}; path=/; max-age=${30*24*60*60}`;
        }
    })
    .catch((error) => {
        console.error('Error:', error); // Log any errors
    });
}

// Function to show popup
/**
 * Displays the popup.
 * @param {string} popupId - The ID of the popup element.
 */
function showPopup(popupId) {
    const popup = document.getElementById(popupId); // Get the popup element
    popup.style.display = 'block'; // Display the popup
}

// Function to close popup
/**
 * Hides the popup.
 * @param {string} popupId - The ID of the popup element.
 */
function closePopup(popupId) {
    const popup = document.getElementById(popupId); // Get the popup element
    popup.style.display = 'none'; // Hide the popup
}

// Function to collect device details
function getDeviceDetails() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language
    };
}

// Function to send device details to the server
function sendDeviceDetails() {
    const deviceDetails = getDeviceDetails();
    fetch('/track_device', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceDetails),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Device details sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending device details:', error);
    });
}

// Show popup only once in the entire app
/**
 * Displays the popup 20 seconds after the page loads, but only once in the entire app.
 */
let pageStartTime;
let overallStartTime = localStorage.getItem('overallStartTime') ? parseInt(localStorage.getItem('overallStartTime')) : Date.now();

// Function to send interaction time to the server
function sendInteractionTime(page, interactionTime) {
    fetch('/track_interaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page, interactionTime }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Interaction time sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending interaction time:', error);
    });
}

// Function to calculate and send page interaction time
function calculatePageInteractionTime() {
    const pageEndTime = Date.now();
    const pageInteractionTime = pageEndTime - pageStartTime;
    const page = window.location.pathname;
    sendInteractionTime(page, pageInteractionTime);
}

// Function to calculate and send overall interaction time
function calculateOverallInteractionTime() {
    const overallEndTime = Date.now();
    const overallInteractionTime = overallEndTime - overallStartTime;
    sendInteractionTime('overall', overallInteractionTime);
}

// Generate a unique user ID
function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}

// Get or create a unique user ID
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = generateUserId();
    localStorage.setItem('userId', userId);
}

// Function to send interaction data to the server
function sendInteractionData(eventType, details) {
    const interactionData = {
        userId,
        eventType,
        details,
        timestamp: new Date().toISOString()
    };
    fetch('/track_interaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(interactionData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Interaction data sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending interaction data:', error);
    });
}

// Track button clicks
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
        const details = {
            text: event.target.innerText,
            id: event.target.id,
            class: event.target.className,
            href: event.target.href || null
        };
        sendInteractionData('click', details);
    }
});

// Track route changes
window.addEventListener('popstate', function () {
    const details = {
        path: window.location.pathname,
        search: window.location.search
    };
    sendInteractionData('route_change', details);
});

// Track page interaction time
window.onload = function () {
    setThemeFromCookie();
    setUserDetailsFromCookie();
    pageStartTime = Date.now();
    sendDeviceDetails();
    const isFirstTimeUser = !getCookie('popupShown');
    if (isFirstTimeUser) {
        setTimeout(() => {
            showPopup('popup');
            document.cookie = `popupShown=true; path=/; max-age=${30*24*60*60}`; // Set cookie to show popup only once
        }, 20000); // Show the popup after 20 seconds
    }
}

// Clear localStorage and calculate interaction times when the user leaves the app
window.onbeforeunload = function () {
    calculatePageInteractionTime();
    calculateOverallInteractionTime();
    localStorage.removeItem('popupShown');
    localStorage.removeItem('overallStartTime');
    localStorage.removeItem('userId');
}

// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Set theme based on cookie
function setThemeFromCookie() {
    const theme = getCookie('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
    document.getElementById('theme-switch').checked = theme === 'dark';
}

// Set user details from cookies
function setUserDetailsFromCookie() {
    const userName = getCookie('user_name') || 'John Doe';
    const userEmail = getCookie('user_email') || 'thejohndoe@gmail.com';

    // Update the displayed user name in the header
    document.querySelector('.homepage_hero h1').innerText = `👋 Hey, ${userName}! Welcome to My Portfolio! `;

    // Get the first letter of each word in the user's name
    const avatarName = userName.split(' ')  // Split name into words
        .map(word => word[0].toUpperCase())       // Get first letter of each word
        .join('');                               // Join letters together
    
    // Get the avatar element by its ID and update the innerText
    const avatar = document.getElementById('user-avatar');
    avatar.innerText = avatarName;  // Display initials (e.g., "HI" for "Hiro Inocha")

    // Update profile details in the profile menu
    document.getElementById('profile-name').innerText = userName;
    document.getElementById('profile-email').innerText = userEmail;
}