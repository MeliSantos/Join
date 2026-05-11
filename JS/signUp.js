const form = document.getElementById("registerForm");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("Name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const termsCheckbox = document.getElementById("option1").checked;

    if (password !== confirmPassword) {
        passwordError.textContent = "Die Passwörter stimmen nicht überein.";
        return;
    } else {
        passwordError.textContent = "";
    }
    


    if (!termsCheckbox) {
        termsError.textContent = "Bitte akzeptieren Sie die Privacy Policy, um fortzufahren.";
        return;
    } else {
        termsError.textContent = "";
    }

    const user = {
        name: name,
        email: email,
        initials: name.charAt(0),
        password: password
    };

    sendToFirebase(user);
});

async function sendToFirebase(user) {
    try {
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
        
        // Optional: Zur Login-Seite weiterleiten
         window.location.href = "./index.html";
        
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    }
}