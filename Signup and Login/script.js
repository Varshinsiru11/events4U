document.addEventListener("DOMContentLoaded", function () {
  // Initialize UI elements
  initializeUI();

  // Setup event listeners for forms
  setupEventListeners();

  // Add animations
  addAnimations();
});

function initializeUI() {
  // Tab functionality
  const tabBtns = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll("form");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all tabs and forms
      tabBtns.forEach((b) => b.classList.remove("active"));
      forms.forEach((f) => f.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Show corresponding form
      const formId = this.getAttribute("data-tab") + "Form";
      document.getElementById(formId).classList.add("active");

      // Clear any error messages
      document.querySelectorAll(".error-message").forEach((error) => {
        error.textContent = "";
      });
    });
  });

  // Password visibility toggle
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");

  togglePasswordBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const type =
        input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);

      // Change icon
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });
}

function setupEventListeners() {
  // Signup form submission
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const agreeTerms = document.getElementById("agreeTerms").checked;
      const errorMessage = document.getElementById("signupError");

      // Clear previous errors
      errorMessage.textContent = "";

      // Validate inputs
      if (!fullName || !email || !password || !confirmPassword) {
        errorMessage.textContent = "All fields are required!";
        shakeForm(signupForm);
        return;
      }

      if (!validateEmail(email)) {
        errorMessage.textContent = "Please enter a valid email address!";
        highlightInput("email");
        return;
      }

      if (password.length < 6) {
        errorMessage.textContent =
          "Password must be at least 6 characters long!";
        highlightInput("password");
        return;
      }

      if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        highlightInput("confirmPassword");
        return;
      }

      if (!agreeTerms) {
        errorMessage.textContent =
          "You must agree to the Terms of Service and Privacy Policy!";
        highlightInput("agreeTerms");
        return;
      }

      // Show loading state
      const submitBtn = signupForm.querySelector(".btn-submit");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-circle-notch fa-spin"></i> Creating Account...';
      submitBtn.disabled = true;

      try {
        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For demo purposes, just show success and redirect
        showSuccessMessage(
          "Account created successfully! Redirecting to dashboard..."
        );

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "../event-dashboard/index.html";
        }, 2000);
      } catch (error) {
        errorMessage.textContent = "Something went wrong. Please try again.";
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // Login form submission
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const errorMessage = document.getElementById("loginError");

      // Clear previous errors
      errorMessage.textContent = "";

      // Validate inputs
      if (!email || !password) {
        errorMessage.textContent = "Email and password are required!";
        shakeForm(loginForm);
        return;
      }

      if (!validateEmail(email)) {
        errorMessage.textContent = "Please enter a valid email address!";
        highlightInput("loginEmail");
        return;
      }

      // Show loading state
      const submitBtn = loginForm.querySelector(".btn-submit");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-circle-notch fa-spin"></i> Signing In...';
      submitBtn.disabled = true;

      try {
        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For demo purposes, just show success and redirect
        showSuccessMessage("Login successful! Redirecting to dashboard...");

        // Save user info to session storage (for demonstration)
        const userProfile = {
          name: email.split("@")[0], // Extract name from email for demo
          email: email,
          loggedIn: true,
        };

        sessionStorage.setItem("userProfile", JSON.stringify(userProfile));

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "../event-dashboard/index.html";
        }, 2000);
      } catch (error) {
        errorMessage.textContent =
          "Invalid email or password. Please try again.";
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }

  // Social login buttons
  const socialBtns = document.querySelectorAll(".social-btn");
  socialBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const provider = this.classList[1]; // google, facebook, or twitter

      // Show a message that this is just a demo
      showSuccessMessage(`${provider} login is not implemented in this demo`);
    });
  });
}

function addAnimations() {
  // Animate event cards
  const eventCards = document.querySelectorAll(".event-card");
  eventCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
    card.style.animation = "fadeIn 0.8s ease forwards";
  });

  // Add parallax effect to background
  document.addEventListener("mousemove", function (e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    const bgElement = document.querySelector(".background-animation::before");
    if (bgElement) {
      bgElement.style.transform = `translate(${mouseX * 20}px, ${
        mouseY * 20
      }px) scale(1.05)`;
    }

    const eventPreview = document.querySelector(".event-preview::before");
    if (eventPreview) {
      eventPreview.style.transform = `translate(${mouseX * -30}px, ${
        mouseY * -30
      }px) rotate(${mouseX * 10}deg)`;
    }
  });
}

// Utility Functions
function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function highlightInput(inputId) {
  const input = document.getElementById(inputId);
  input.classList.add("shake");
  input.focus();

  setTimeout(() => {
    input.classList.remove("shake");
  }, 600);
}

function shakeForm(form) {
  form.classList.add("shake");

  setTimeout(() => {
    form.classList.remove("shake");
  }, 600);
}

function showSuccessMessage(message) {
  // Create success message element if it doesn't exist
  let successMessage = document.querySelector(".success-message");

  if (!successMessage) {
    successMessage = document.createElement("div");
    successMessage.className = "success-message";
    document.body.appendChild(successMessage);

    // Add styles for success message
    const style = document.createElement("style");
    style.textContent = `
      .success-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--secondary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      }
      
      .success-message::before {
        content: '✓';
        font-size: 1.2rem;
        font-weight: bold;
      }
      
      .success-message.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  // Update message and show
  successMessage.textContent = message;
  successMessage.classList.add("show");

  // Hide after 5 seconds
  setTimeout(() => {
    successMessage.classList.remove("show");
  }, 5000);
}

// Add the shake animation
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-10px); }
    40%, 80% { transform: translateX(10px); }
  }
  
  .shake {
    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
  }
`;
document.head.appendChild(shakeStyle);
