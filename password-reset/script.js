document
  .getElementById("resetForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const errorMessage = document.getElementById("error-message");

    if (!email.includes("@") || !email.includes(".")) {
      errorMessage.textContent = "Please enter a valid email!";
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4500/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        errorMessage.textContent = data.msg || "Something went wrong!";
      } else {
        alert("Reset link sent! Check your email.");
        document.getElementById("resetForm").reset();
      }
    } catch (error) {
      errorMessage.textContent = "Error connecting to the server!";
    }
  });
