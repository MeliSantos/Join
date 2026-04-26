function init() {
    const form = document.getElementById("loginForm");
    const guestBtn = document.getElementById("guestLogIn");

    // LOGIN
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        await loginUser(email, password);
    });

    // GUEST LOGIN
    guestBtn.addEventListener("click", function () {
        const guestUser = {
            name: "Guest",
            email: "guest@join.com",
            initials: "G"
        };

        localStorage.setItem("currentUser", JSON.stringify(guestUser));
        window.location.href = "./board.html";
    });
}


// LOGIN FUNCTION
async function loginUser(email, password) {
    try {
        const response = await fetch("https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/users.json");
        const data = await response.json();

        let users = Object.values(data || {});
        let foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            console.log("Login successful:", foundUser);

            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            window.location.href = "./index.html";
        } else {
            alert("Wrong email or password!");
        }

    } catch (error) {
        console.error("Error on login:", error);
    }
}