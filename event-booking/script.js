// Event Booking Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get the book now button
  const bookButton = document.getElementById("bookNowBtn");
  if (bookButton) {
    bookButton.addEventListener("click", redirectToDashboard);
  }

  // Check if there's a direct booking requested
  const bookEvent = document.getElementById("bookEvent");
  if (bookEvent) {
    bookEvent.addEventListener("click", handleBookEvent);
  }

  // Check if user is logged in
  checkUserLoginStatus();
});

// Function to redirect to dashboard
function redirectToDashboard() {
  window.location.href = "../event-dashboard/index.html";
}

// Function to handle booking an event
function handleBookEvent() {
  // Show loading animation on button
  const bookButton = document.getElementById("bookEvent");
  const originalText = bookButton.innerHTML;
  bookButton.innerHTML =
    '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
  bookButton.disabled = true;

  // Event information
  const eventInfo = {
    id: 1,
    name: "Music Festival 2025",
    date: "April 15, 2025",
    time: "8:00 PM",
    location: "Central Park, NYC",
    venue: "Grand Stage Arena",
    price: 50.0,
    bookingFeePercent: 10,
    description:
      "Experience an unforgettable night of live performances, DJs, and incredible music.",
    image:
      "https://media.istockphoto.com/id/1189205501/photo/cheering-crowd-of-unrecognized-people-at-a-rock-music-concert-concert-crowd-in-front-of.jpg?s=612x612&w=0&k=20&c=_vgyStdIBHCbnDHdu3lNTwfJxt2fTcJc9PB345ryhZo=",
  };

  // Get user profile from sessionStorage or create a default one
  const userProfile = JSON.parse(sessionStorage.getItem("userProfile") || "{}");

  // Ensure the userProfile exists and has all required fields
  const updatedUserProfile = {
    name: userProfile.name || "John Doe",
    age: userProfile.age || "28",
    gender: userProfile.gender || "Male",
    email: userProfile.email || "john@example.com",
    phone: userProfile.phone || "+1 234 567 8900",
  };

  // Save to sessionStorage
  sessionStorage.setItem("eventInfo", JSON.stringify(eventInfo));
  sessionStorage.setItem("userProfile", JSON.stringify(updatedUserProfile));
  sessionStorage.setItem("seatPrice", eventInfo.price.toFixed(2));
  sessionStorage.setItem("bookingFeePercent", eventInfo.bookingFeePercent);

  // Simulate a delay for the booking process
  setTimeout(function () {
    // Redirect to seat booking page
    window.location.href = "../seat-booking/index.html";
  }, 1000);
}

// Function to check if user is logged in
function checkUserLoginStatus() {
  const userProfile = JSON.parse(sessionStorage.getItem("userProfile") || "{}");

  // If the user profile doesn't exist or user is not logged in, redirect to login page
  if (!userProfile || !userProfile.loggedIn) {
    // Add a toast message or alert
    createToast("Please log in to book tickets", "info");

    // Use setTimeout to give the user time to see the message
    setTimeout(function () {
      window.location.href = "../Signup and Login/index.html";
    }, 3000);
  }
}

// Function to create toast notification
function createToast(message, type = "info") {
  // Check if a toast container exists, create one if not
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);

    // Add CSS for the toast container if it doesn't exist
    const style = document.createElement("style");
    style.textContent = `
      .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }
      .toast {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .toast.info {
        background-color: #4f46e5;
      }
      .toast.success {
        background-color: #10b981;
      }
      .toast.error {
        background-color: #ef4444;
      }
      .toast.warning {
        background-color: #f59e0b;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  }

  // Create toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  // Add icon based on toast type
  const icon = document.createElement("i");
  icon.style.marginRight = "8px";

  switch (type) {
    case "info":
      icon.className = "fas fa-info-circle";
      break;
    case "success":
      icon.className = "fas fa-check-circle";
      break;
    case "error":
      icon.className = "fas fa-times-circle";
      break;
    case "warning":
      icon.className = "fas fa-exclamation-triangle";
      break;
  }

  toast.prepend(icon);
  toastContainer.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
