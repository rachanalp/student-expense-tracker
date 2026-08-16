const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:8080/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const user = await response.json();

        // Save the logged-in user
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        console.log("Logged in user:", user);

        message.textContent = "Login successful!";

        setTimeout(function () {
            window.location.href = "index.html";
        }, 500);

    } catch (error) {

        console.error("Login error:", error);

        message.textContent = "Invalid email or password.";
    }
});