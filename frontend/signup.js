const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:8080/api/users/signup", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error("Signup failed");
        }

        const user = await response.json();

        message.textContent = "Account created successfully!";

        signupForm.reset();

        console.log("Created user:", user);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Signup failed. Email may already be registered.";
    }
});