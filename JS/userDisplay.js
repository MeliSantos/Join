/**
 * Display user initials in the header userIcon
 * This script should be included on all pages where the userIcon is present
 */

function displayUserInitials() {
    const userIcon = document.querySelector(".userIcon");
    if (!userIcon) {
        console.log("userIcon element not found");
        return;
    }

    const currentUserJSON = localStorage.getItem("currentUser");
    if (!currentUserJSON) {
        console.log("No currentUser in localStorage");
        return;
    }

    const currentUser = JSON.parse(currentUserJSON);
    
    if (currentUser && currentUser.initials) {
        userIcon.textContent = currentUser.initials;
        console.log("Initials displayed:", currentUser.initials);
    }
}

// Display initials when DOM is loaded
document.addEventListener("DOMContentLoaded", displayUserInitials);
