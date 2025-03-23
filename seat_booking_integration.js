/**
 * Integration code to connect the seat-booking page with the backend API.
 * Replace the proceedToPayment function in seat-booking/script.js with this version.
 */

function proceedToPayment() {
  if (selectedSeats.length === 0) {
    showToast("Please select at least one seat", "error");
    return;
  }

  // Show loading animation
  const button = this;

  // Create a ripple effect for visual feedback
  const ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  button.appendChild(ripple);

  // Position the ripple from the click event or center of button
  const buttonRect = button.getBoundingClientRect();
  const diameter = Math.max(buttonRect.width, buttonRect.height);
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `0px`;
  ripple.style.top = `0px`;

  // Add CSS for the ripple effect
  ripple.style.position = "absolute";
  ripple.style.borderRadius = "50%";
  ripple.style.transform = "scale(0)";
  ripple.style.background = "rgba(255, 255, 255, 0.5)";
  ripple.style.pointerEvents = "none";
  ripple.style.transition = "transform 0.6s, opacity 0.6s";

  // Trigger the animation
  setTimeout(() => {
    ripple.style.transform = "scale(2)";
    ripple.style.opacity = "0";
  }, 10);

  // Remove the ripple after animation completes
  setTimeout(() => {
    ripple.remove();
  }, 600);

  button.disabled = true;
  button.innerHTML =
    '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

  // Prepare the seat data
  const detailedSeats = selectedSeats.map((seatId) => {
    const seatElement = document.getElementById(`seat-${seatId}`);
    return {
      id: seatId,
      row: seatElement.dataset.row,
      number: seatElement.dataset.seatNumber,
      price: parseFloat(seatElement.dataset.price),
      type: seatElement.dataset.seatType,
    };
  });

  // Store directly in session storage as backup
  sessionStorage.setItem("selectedSeats", JSON.stringify(detailedSeats));

  // Calculate pricing information as backup
  const subtotal = detailedSeats.reduce((total, seat) => total + seat.price, 0);
  const bookingFeePercent = 10;
  const bookingFee = subtotal * (bookingFeePercent / 100);
  const totalPrice = subtotal + bookingFee;

  // Create simplified pricing info
  const pricingInfo = {
    subtotal: subtotal,
    bookingFeePercent: bookingFeePercent,
    bookingFee: bookingFee,
    totalPrice: totalPrice,
    seatCount: detailedSeats.length,
  };
  sessionStorage.setItem("pricingInfo", JSON.stringify(pricingInfo));

  // Get session ID (create if needed)
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = "temp-" + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("session_id", sessionId);
  }

  // Get event info
  const eventInfo = JSON.parse(sessionStorage.getItem("eventInfo") || "{}");
  const eventId = eventInfo.id || "event1";

  // Backend API URL (change to your actual backend URL)
  const apiUrl = "http://127.0.0.1:5000";

  console.log("Creating booking with backend...");

  // Try API approach first
  fetch(`${apiUrl}/api/booking/seats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      selected_seats: detailedSeats,
      event_id: eventId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        console.log("Booking created successfully:", data);
        sessionStorage.setItem("booking_id", data.booking_id);

        // Redirect via server-side redirect
        window.location.href = `${apiUrl}/redirect/payment?session=${sessionId}`;
      } else {
        throw new Error(data.message || "Unknown error");
      }
    })
    .catch((error) => {
      console.error("API error:", error);

      // Fallback approach - try the redirect proxy
      console.log("Trying redirect proxy...");

      fetch(`${apiUrl}/api/redirect/to-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          selected_seats: detailedSeats,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Redirect proxy successful:", data);
            window.location.href = data.redirect_url;
          } else {
            throw new Error(data.message || "Redirect proxy failed");
          }
        })
        .catch((proxyError) => {
          console.error("Redirect proxy error:", proxyError);

          // Final fallback - direct browser navigation
          console.log("Using direct browser navigation as final fallback");

          // Try each of these methods in sequence
          try {
            // Method 1: window.location.href
            window.location.href = "../payment-method/index.html";

            // If still on the same page after a delay, try method 2
            setTimeout(() => {
              if (window.location.href.includes("seat-booking")) {
                console.log("Method 1 failed, trying method 2");

                // Method 2: Use a real link and click it
                const link = document.createElement("a");
                link.href = "../payment-method/index.html";
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // If still on the same page after a delay, try method 3
                setTimeout(() => {
                  if (window.location.href.includes("seat-booking")) {
                    console.log("Method 2 failed, trying method 3");

                    // Method 3: window.location = "url"
                    window.location = "../payment-method/index.html";

                    // If still on the same page after a delay, show manual link
                    setTimeout(() => {
                      if (window.location.href.includes("seat-booking")) {
                        console.log("All navigation attempts failed");
                        button.disabled = false;
                        button.innerHTML =
                          '<span class="proceed-btn-text">Continue to Payment</span><i class="fas fa-chevron-circle-right"></i>';

                        // Add a manual link for the user
                        if (!document.getElementById("manual-redirect")) {
                          const manualLink = document.createElement("div");
                          manualLink.id = "manual-redirect";
                          manualLink.style.padding = "15px";
                          manualLink.style.margin = "15px 0";
                          manualLink.style.background = "#f8d7da";
                          manualLink.style.color = "#721c24";
                          manualLink.style.borderRadius = "5px";
                          manualLink.style.textAlign = "center";
                          manualLink.innerHTML = `
                            <p>Unable to redirect automatically. Please click the link below:</p>
                            <a href="../payment-method/index.html" style="display: inline-block; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Payment Page</a>
                          `;

                          // Find the booking-summary element and insert the manual link before it
                          const bookingSummary =
                            document.querySelector(".booking-summary");
                          bookingSummary.parentNode.insertBefore(
                            manualLink,
                            bookingSummary
                          );
                        }
                      }
                    }, 1000);
                  }
                }, 1000);
              }
            }, 1000);
          } catch (navError) {
            console.error("Navigation error:", navError);
            button.disabled = false;
            button.innerHTML =
              '<span class="proceed-btn-text">Continue to Payment</span><i class="fas fa-chevron-circle-right"></i>';
            alert(
              "Error navigating to payment page. Please use the direct link at the top of the page."
            );
          }
        });
    });
}
