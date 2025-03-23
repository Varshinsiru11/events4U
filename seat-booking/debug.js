// Debug script to test redirection functionality
console.log("Debug script loaded");

// Function to directly test the redirect
function testRedirect() {
  console.log("Testing redirect to payment page");

  try {
    // Log the current URL
    console.log("Current URL:", window.location.href);

    // Log the target URL
    const targetUrl = "../payment-method/index.html";
    console.log("Target URL:", targetUrl);

    // Test if the directory exists by loading an image
    const img = new Image();
    img.onload = function () {
      console.log("Directory exists - image loaded successfully");
    };
    img.onerror = function () {
      console.error("Directory may not exist - image failed to load");
    };
    img.src = "../payment-method/test-existence.png?" + new Date().getTime();

    // Attempt the redirect after 3 seconds
    console.log("Will attempt redirect in 3 seconds...");
    setTimeout(function () {
      console.log("Executing redirect now");
      window.location.href = targetUrl;
    }, 3000);
  } catch (error) {
    console.error("Error during redirect test:", error);
  }
}

// Add a button to the page for testing
function addDebugButton() {
  const button = document.createElement("button");
  button.textContent = "Test Redirect";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.padding = "10px";
  button.style.background = "red";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.onclick = testRedirect;

  document.body.appendChild(button);
  console.log("Debug button added");
}

// Run when the document is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Debug script DOM ready");
  addDebugButton();
});
