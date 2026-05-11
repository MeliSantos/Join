const form = document.getElementById("registerForm");
const passwordError = document.getElementById("passwordError");
const termsError = document.getElementById("termsError");
const emailError = document.getElementById("emailError");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("Name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const termsCheckbox = document.getElementById("option1").checked;

    // Passwort prüfen
    if (password !== confirmPassword) {
        passwordError.textContent = "Die Passwörter stimmen nicht überein.";
        return;
    } else {
        passwordError.textContent = "";
    }

    // Terms prüfen
    if (!termsCheckbox) {
        termsError.textContent = "Bitte akzeptieren Sie die Privacy Policy, um fortzufahren.";
        return;
    } else {
        termsError.textContent = "";
    }

    // E-Mail Prüfung - ob bereits existiert
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
        emailError.textContent = "Diese E-Mail-Adresse ist bereits registriert!";
        return;
    } else {
        emailError.textContent = "";
    }

    const user = {
        name: name,
        email: email,
        initials: name.charAt(0),
        password: password
    };

    sendToFirebase(user);
});

/**
 * Prüft, ob die E-Mail bereits existiert
 */
async function checkEmailExists(email) {
    try {
        const response = await fetch("https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/users.json");
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const existingUsers = await response.json();
        
        if (!existingUsers) {
            return false;
        }
        
        // Prüfe, ob Email bereits vorhanden ist
        return Object.values(existingUsers).some(u => u.email === email);
        
    } catch (error) {
        console.error("Fehler beim Prüfen der E-Mail:", error);
        return false;
    }
}

async function sendToFirebase(user) {
    try {
        // Benutzer registrieren
        const response = await fetch("https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/users.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        const userWithId = {
            id: data.name,   // 🔑 Firebase ID
            ...user
        };

        console.log("User mit ID:", userWithId);

        // User einloggen
        localStorage.setItem("currentUser", JSON.stringify(userWithId));
        
        alert("Registrierung erfolgreich!");
        form.reset();
        
        // Zur Login-Seite weiterleiten
        window.location.href = "./index.html";
        
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    }
}