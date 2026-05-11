/**
 * Display current user name on Summary page
 */

function displayUserName() {
    const currentUserJSON = localStorage.getItem("currentUser");
    if (!currentUserJSON) return;

    const currentUser = JSON.parse(currentUserJSON);
    
    if (currentUser && currentUser.name) {
        const nameElement = document.querySelector(".name");
        if (nameElement) {
            nameElement.textContent = currentUser.name;
        }
    }
}

// Display user name when DOM is loaded
document.addEventListener("DOMContentLoaded", displayUserName);
