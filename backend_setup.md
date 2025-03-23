# EventHub Backend Setup

This guide explains how to set up and integrate the backend server with your EventHub frontend application to solve page navigation issues and enable data persistence.

## Prerequisites

- Python 3.6 or higher
- Jupyter Notebook
- Basic understanding of Flask and REST APIs

## Getting Started

1. Install the required Python packages:

```bash
pip install flask flask-cors jupyter notebook
```

2. Start the Jupyter Notebook server:

```bash
jupyter notebook
```

3. Open the `event_backend.ipynb` notebook in your browser.

4. Run all cells in the notebook to start the Flask server.

## Backend Features

The backend provides the following features:

1. **Session Management** - Store and retrieve user data across page navigation
2. **Event Data** - Access information about available events
3. **Booking Flow** - Handle seat selection, booking creation, and payment processing
4. **Redirection Services** - Solve the navigation issues between pages

## Fixing the Seat Booking Redirect Issue

To fix the redirection issue from seat-booking to payment-method:

1. Open `seat-booking/script.js` in your code editor
2. Replace the `proceedToPayment` function with the one provided in `seat_booking_integration.js`
3. Make sure the `apiUrl` in the code points to your backend server (default: `http://127.0.0.1:5000`)
4. Save the file

## Integration Steps for All Pages

### 1. Event Dashboard to Event Booking

Add this code to the event dashboard page to handle event selection:

```javascript
function selectEvent(eventId) {
  // Get session ID or create a new one
  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    fetch("http://127.0.0.1:5000/api/session", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        sessionId = data.session_id;
        sessionStorage.setItem("session_id", sessionId);
        storeEventAndRedirect(eventId, sessionId);
      });
  } else {
    storeEventAndRedirect(eventId, sessionId);
  }
}

function storeEventAndRedirect(eventId, sessionId) {
  // Fetch event details from the backend
  fetch(`http://127.0.0.1:5000/api/events/${eventId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Store event info in session storage
        sessionStorage.setItem("eventInfo", JSON.stringify(data.data));

        // Update session on backend
        fetch(`http://127.0.0.1:5000/api/session/${sessionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventInfo: data.data,
          }),
        });

        // Redirect to event booking page
        window.location.href = "../event-booking/index.html";
      }
    });
}
```

### 2. Payment to Ticket Generation

Update the payment processing code to use the backend:

```javascript
function processPayment(paymentMethod) {
  const sessionId = sessionStorage.getItem("session_id");
  const bookingId = sessionStorage.getItem("booking_id");

  if (!sessionId || !bookingId) {
    showToast("Session information missing. Please try again.", "error");
    return;
  }

  // Show loading UI
  const button = document.getElementById(`pay${paymentMethod}Btn`);
  button.disabled = true;
  button.innerHTML =
    '<span class="spinner-border spinner-border-sm"></span> Processing...';

  // Process payment through backend
  fetch("http://127.0.0.1:5000/api/booking/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      booking_id: bookingId,
      payment_method: paymentMethod,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Store transaction info
        sessionStorage.setItem(
          "transactionInfo",
          JSON.stringify(data.data.payment)
        );

        // Show success message
        showPaymentSuccess(data.transaction_id);

        // Set up redirect to ticket page
        document
          .getElementById("viewTicketsBtn")
          .addEventListener("click", function () {
            window.location.href = data.redirect;
          });
      } else {
        showToast("Payment processing failed: " + data.message, "error");
        button.disabled = false;
        button.innerHTML = originalButtonText;
      }
    })
    .catch((error) => {
      console.error("Error processing payment:", error);
      showToast("An error occurred. Please try again.", "error");
      button.disabled = false;
      button.innerHTML = originalButtonText;
    });
}
```

## Testing the Integration

1. Make sure the backend server is running (all cells executed in the notebook)
2. Navigate to your EventHub website starting at the index.html page
3. Go through the booking flow:
   - Select an event on the dashboard
   - Book the event
   - Select seats
   - Proceed to payment
   - Complete payment
   - Generate ticket

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Look at the backend server logs in the Jupyter Notebook
3. Verify that the backend server URL is correctly set in your JavaScript code
4. Ensure that session IDs are being properly stored and passed between pages
5. Try using the fallback navigation methods included in the integration code

## Advanced Configuration

You can customize the backend by:

1. Adding authentication for API security
2. Connecting to a real database instead of in-memory storage
3. Deploying to a production server
4. Implementing email notifications for bookings and tickets
