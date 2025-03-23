document.addEventListener("DOMContentLoaded", function () {
  // Add page load animation
  document.body.classList.add("page-loaded");

  // Update price information from sessionStorage if available
  updatePriceFromSession();

  // Generate QR Code
  generateQRCode();

  // Setup UPI App Selection
  setupUpiAppSelection();

  // Setup Card Form Formatting
  setupCardFormFormatting();

  // Setup Payment Buttons
  setupPaymentButtons();

  // Add visual animation effects
  addVisualEffects();
});

// Update pricing from session storage
function updatePriceFromSession() {
  // Get pricing info
  const pricingInfo = JSON.parse(sessionStorage.getItem("pricingInfo") || "{}");
  const selectedSeats = JSON.parse(
    sessionStorage.getItem("selectedSeats") || "[]"
  );

  // If we have pricing info with seat types, use it
  if (pricingInfo && pricingInfo.seatTypeTotals) {
    const seatTypeTotals = pricingInfo.seatTypeTotals;
    const priceSummary = document.querySelector(".price-summary");

    if (priceSummary) {
      // Clear existing price rows except the last one (total)
      while (priceSummary.children.length > 1) {
        priceSummary.removeChild(priceSummary.firstChild);
      }

      // Add rows for each seat type that has at least one seat
      let insertPoint = 0;

      // Add Standard seats if any
      if (seatTypeTotals.Standard.count > 0) {
        const standardRow = document.createElement("div");
        standardRow.className = "d-flex justify-content-between";
        standardRow.innerHTML = `
          <span>Standard Tickets (${
            seatTypeTotals.Standard.count
          }x $${pricingInfo.seatPrice.toFixed(2)})</span>
          <span>$${seatTypeTotals.Standard.total.toFixed(2)}</span>
        `;
        priceSummary.insertBefore(
          standardRow,
          priceSummary.children[insertPoint]
        );
        insertPoint++;
      }

      // Add Premium seats if any
      if (seatTypeTotals.Premium.count > 0) {
        const premiumRow = document.createElement("div");
        premiumRow.className = "d-flex justify-content-between";
        premiumRow.innerHTML = `
          <span>Premium Tickets (${
            seatTypeTotals.Premium.count
          }x $${pricingInfo.premiumSeatPrice.toFixed(2)})</span>
          <span>$${seatTypeTotals.Premium.total.toFixed(2)}</span>
        `;
        priceSummary.insertBefore(
          premiumRow,
          priceSummary.children[insertPoint]
        );
        insertPoint++;
      }

      // Add VIP seats if any
      if (seatTypeTotals.VIP.count > 0) {
        const vipRow = document.createElement("div");
        vipRow.className = "d-flex justify-content-between";
        vipRow.innerHTML = `
          <span>VIP Tickets (${
            seatTypeTotals.VIP.count
          }x $${pricingInfo.vipSeatPrice.toFixed(2)})</span>
          <span>$${seatTypeTotals.VIP.total.toFixed(2)}</span>
        `;
        priceSummary.insertBefore(vipRow, priceSummary.children[insertPoint]);
        insertPoint++;
      }

      // Add service fee row
      const feeRow = document.createElement("div");
      feeRow.className = "d-flex justify-content-between";
      feeRow.innerHTML = `
        <span>Service Fee (${pricingInfo.bookingFeePercent}%)</span>
        <span>$${pricingInfo.bookingFee.toFixed(2)}</span>
      `;
      priceSummary.insertBefore(feeRow, priceSummary.children[insertPoint]);

      // Update total price
      const totalRow = priceSummary.querySelector(
        ".d-flex.justify-content-between.mt-2"
      );
      if (totalRow) {
        totalRow.querySelector(
          "strong:last-child"
        ).textContent = `$${pricingInfo.totalPrice.toFixed(2)}`;
      }

      // Update general price counters
      document.querySelector(
        ".total-price"
      ).textContent = `$${pricingInfo.totalPrice.toFixed(2)}`;
      document.querySelector(".ticket-count").textContent =
        pricingInfo.seatCount;

      // Update event summary - include seat type breakdown
      const seatTypeText = [];
      if (seatTypeTotals.Standard.count > 0) {
        seatTypeText.push(`${seatTypeTotals.Standard.count} Standard`);
      }
      if (seatTypeTotals.Premium.count > 0) {
        seatTypeText.push(`${seatTypeTotals.Premium.count} Premium`);
      }
      if (seatTypeTotals.VIP.count > 0) {
        seatTypeText.push(`${seatTypeTotals.VIP.count} VIP`);
      }

      const ticketCount = document.querySelector(
        ".order-summary p:nth-child(3)"
      );
      if (ticketCount) {
        ticketCount.innerHTML = `<i class="fas fa-ticket-alt"></i> ${seatTypeText.join(
          ", "
        )}`;
      }
    }
  }
  // Fall back to old calculation method if we don't have detailed pricing
  else if (selectedSeats && selectedSeats.length > 0) {
    const eventInfo = JSON.parse(sessionStorage.getItem("eventInfo") || "{}");
    const seatPrice = eventInfo.price || 50.0; // Default to $50 if not set
    const bookingFeePercent = 10; // Default to 10%

    const seatCount = selectedSeats.length;
    const subtotal = seatCount * seatPrice;
    const bookingFee = subtotal * (bookingFeePercent / 100);
    const totalPrice = subtotal + bookingFee;

    // Update DOM
    document.querySelector(".ticket-count").textContent = seatCount;
    document.querySelector(
      ".ticket-subtotal"
    ).textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector(".service-fee").textContent = `$${bookingFee.toFixed(
      2
    )}`;
    document.querySelector(".total-price").textContent = `$${totalPrice.toFixed(
      2
    )}`;
  }
}

// Generate QR Code for Payment
function generateQRCode() {
  const qrContainer = document.getElementById("qrcode");

  if (qrContainer) {
    // Clear any existing QR code
    qrContainer.innerHTML = "";

    // Get total price from session storage or use default
    const totalPrice = sessionStorage.getItem("totalPrice") || "110.00";
    const seatsInfo = JSON.parse(
      sessionStorage.getItem("selectedSeats") || "[]"
    );
    const numTickets = seatsInfo.length || 2;
    const seatsList = seatsInfo.length > 0 ? seatsInfo.join(", ") : "A12, B5";

    // Create payment data
    const paymentData = {
      amount: totalPrice,
      name: "Event Manager",
      description: `Music Festival 2025 - ${numTickets} Tickets (${seatsList})`,
      transactionId: "TXN" + Math.floor(Math.random() * 1000000),
    };

    // Add loading animation
    qrContainer.innerHTML =
      '<div class="qr-loading"><div class="spinner"></div><span>Generating QR...</span></div>';

    setTimeout(() => {
      qrContainer.innerHTML = "";

      // Convert payment data to string
      const qrText = `upi://pay?pa=eventmanager@upi&pn=${paymentData.name}&am=${paymentData.amount}&tn=${paymentData.description}&tr=${paymentData.transactionId}`;

      // Generate QR code with colors matching our theme
      new QRCode(qrContainer, {
        text: qrText,
        width: 180,
        height: 180,
        colorDark: "#2c3e50",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });

      // Add success indicator
      const successIndicator = document.createElement("div");
      successIndicator.className = "qr-success";
      successIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
      qrContainer.appendChild(successIndicator);
    }, 1500);
  }
}

// Setup UPI App Selection
function setupUpiAppSelection() {
  const upiApps = document.querySelectorAll(".upi-app");

  upiApps.forEach((app) => {
    app.addEventListener("click", function () {
      // Add click effect
      this.classList.add("app-clicked");
      setTimeout(() => this.classList.remove("app-clicked"), 300);

      // Remove selection from all apps
      upiApps.forEach((a) => a.classList.remove("selected"));

      // Add selection to clicked app
      this.classList.add("selected");

      // Get the app name
      const appName = this.getAttribute("data-app");

      // Show toast notification
      showToast(
        `${
          appName.charAt(0).toUpperCase() + appName.slice(1)
        } selected for payment`,
        "success"
      );
    });
  });

  // UPI ID verification (simulate)
  const verifyUpiBtn = document.getElementById("verifyUpi");
  const upiIdInput = document.getElementById("upiId");

  if (verifyUpiBtn && upiIdInput) {
    // Add input animation
    upiIdInput.addEventListener("focus", function () {
      this.parentElement.classList.add("input-focused");
    });

    upiIdInput.addEventListener("blur", function () {
      if (!this.value) {
        this.parentElement.classList.remove("input-focused");
      }
    });

    verifyUpiBtn.addEventListener("click", function () {
      const upiId = upiIdInput.value.trim();

      if (upiId === "") {
        showToast("Please enter UPI ID", "error");
        shakeElement(upiIdInput);
        return;
      }

      if (!upiId.includes("@")) {
        showToast("Invalid UPI ID format", "error");
        shakeElement(upiIdInput);
        return;
      }

      // Simulate verification process
      verifyUpiBtn.disabled = true;
      verifyUpiBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';

      setTimeout(() => {
        verifyUpiBtn.disabled = false;
        verifyUpiBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
        verifyUpiBtn.classList.add("btn-success");

        showConfetti();
        showToast("UPI ID verified successfully", "success");

        setTimeout(() => {
          verifyUpiBtn.innerHTML = "Verify";
          verifyUpiBtn.classList.remove("btn-success");
        }, 3000);
      }, 1500);
    });
  }
}

// Setup Card Form Formatting
function setupCardFormFormatting() {
  const cardNumber = document.getElementById("cardNumber");
  const cardExpiry = document.getElementById("cardExpiry");
  const cardCvv = document.getElementById("cardCvv");
  const cardName = document.getElementById("cardName");

  // Add floating label effect to all inputs
  const formInputs = document.querySelectorAll("#cardForm .form-control");
  formInputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("input-focused");
      this.classList.add("active-input");
    });

    input.addEventListener("blur", function () {
      if (!this.value) {
        this.parentElement.classList.remove("input-focused");
        this.classList.remove("active-input");
      }
    });
  });

  if (cardNumber) {
    // Format card number with spaces (e.g., 1234 5678 9012 3456)
    cardNumber.addEventListener("input", function (e) {
      let value = this.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      let formattedValue = "";

      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += " ";
        }
        formattedValue += value[i];
      }

      this.value = formattedValue;

      // Show card type based on first digit
      const cardTypeIcons = this.nextElementSibling.querySelectorAll("i");
      const firstDigit = value.charAt(0);

      cardTypeIcons.forEach((icon) => {
        icon.style.opacity = "0.3";
      });

      if (firstDigit === "4") {
        // Visa
        cardTypeIcons[0].style.opacity = "1";
        cardTypeIcons[0].style.color = "#1a1f71";
        highlightCard(0);
      } else if (firstDigit === "5") {
        // Mastercard
        cardTypeIcons[1].style.opacity = "1";
        cardTypeIcons[1].style.color = "#eb001b";
        highlightCard(1);
      } else if (firstDigit === "3") {
        // Amex
        cardTypeIcons[2].style.opacity = "1";
        cardTypeIcons[2].style.color = "#006fcf";
        highlightCard(2);
      }
    });
  }

  if (cardExpiry) {
    // Format expiry date (MM/YY)
    cardExpiry.addEventListener("input", function (e) {
      let value = this.value.replace(/\D/g, "");

      if (value.length > 0) {
        if (value.length <= 2) {
          this.value = value;
        } else {
          this.value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }

        // Validate month
        const month = parseInt(value.slice(0, 2));
        if (month > 12) {
          this.value = "12" + this.value.slice(2);
          pulseElement(this);
        }
      }
    });
  }

  // Add visual feedback for CVV
  if (cardCvv) {
    cardCvv.addEventListener("focus", function () {
      showToast(
        "CVV is the 3-digit security code on the back of your card",
        "info"
      );
    });
  }
}

// Highlight card type animation
function highlightCard(cardIndex) {
  const cardTypes = ["visa", "mastercard", "amex"];
  const selectedCard = cardTypes[cardIndex];

  // Add a visual effect to indicate the card type
  const cardForm = document.getElementById("cardForm");
  cardForm.className = "card-form";
  cardForm.classList.add("card-type-" + selectedCard);

  // Add a little animation
  pulseElement(document.querySelector(".fab.fa-cc-" + selectedCard));
}

// Setup Payment Buttons
function setupPaymentButtons() {
  const payButtons = document.querySelectorAll('[id$="Btn"]');

  payButtons.forEach((button) => {
    // Add hover effect
    button.addEventListener("mouseenter", function () {
      this.classList.add("button-hover");
    });

    button.addEventListener("mouseleave", function () {
      this.classList.remove("button-hover");
    });

    button.addEventListener("click", function () {
      const paymentMethod = this.id
        .replace("pay", "")
        .replace("Btn", "")
        .toLowerCase();

      // Validate form based on payment method
      if (paymentMethod === "card") {
        if (!validateCardForm()) {
          return;
        }
      } else if (paymentMethod === "upi") {
        const upiId = document.getElementById("upiId").value.trim();
        const selectedApp = document.querySelector(".upi-app.selected");

        if (!upiId && !selectedApp) {
          showToast("Please enter UPI ID or select a UPI app", "error");
          shakeElement(document.getElementById("upi"));
          return;
        }
      } else if (paymentMethod === "netbanking") {
        const selectedBank = document.getElementById("bankSelect").value;

        if (!selectedBank) {
          showToast("Please select a bank", "error");
          shakeElement(document.getElementById("bankSelect"));
          return;
        }
      }

      // Simulate payment processing
      simulatePaymentProcessing(paymentMethod);
    });
  });
}

// Validate Card Form
function validateCardForm() {
  const cardNumber = document.getElementById("cardNumber").value.trim();
  const cardExpiry = document.getElementById("cardExpiry").value.trim();
  const cardCvv = document.getElementById("cardCvv").value.trim();
  const cardName = document.getElementById("cardName").value.trim();

  if (!cardNumber) {
    showToast("Please enter card number", "error");
    shakeElement(document.getElementById("cardNumber"));
    return false;
  }

  if (cardNumber.replace(/\s/g, "").length < 16) {
    showToast("Card number should be 16 digits", "error");
    shakeElement(document.getElementById("cardNumber"));
    return false;
  }

  if (!cardExpiry) {
    showToast("Please enter expiry date", "error");
    shakeElement(document.getElementById("cardExpiry"));
    return false;
  }

  if (!cardExpiry.includes("/") || cardExpiry.length !== 5) {
    showToast("Invalid expiry date format (MM/YY)", "error");
    shakeElement(document.getElementById("cardExpiry"));
    return false;
  }

  if (!cardCvv) {
    showToast("Please enter CVV", "error");
    shakeElement(document.getElementById("cardCvv"));
    return false;
  }

  if (cardCvv.length < 3) {
    showToast("CVV should be 3 digits", "error");
    shakeElement(document.getElementById("cardCvv"));
    return false;
  }

  if (!cardName) {
    showToast("Please enter name on card", "error");
    shakeElement(document.getElementById("cardName"));
    return false;
  }

  return true;
}

// Simulate Payment Processing
function simulatePaymentProcessing(paymentMethod) {
  // Show loading animation based on payment method
  const button = document.getElementById(
    `pay${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}Btn`
  );
  const originalText = button.textContent;

  button.disabled = true;
  button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;

  // Add a progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "payment-progress";
  progressBar.innerHTML = '<div class="progress-bar"></div>';

  const tabContent = document.querySelector(".tab-pane.active");
  tabContent.appendChild(progressBar);

  setTimeout(() => {
    progressBar.querySelector(".progress-bar").style.width = "100%";
  }, 100);

  // Simulate API call to payment gateway
  setTimeout(() => {
    button.disabled = false;
    button.textContent = originalText;
    progressBar.remove();

    // Show success message and redirect
    showPaymentSuccess();
  }, 2000);
}

// Show Payment Success
function showPaymentSuccess() {
  // Create a form to get email and phone number
  const userProfile = JSON.parse(sessionStorage.getItem("userProfile") || "{}");

  // Play success sound
  const audio = new Audio(
    "https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3"
  );
  audio.volume = 0.5;
  audio.play();

  // Show confetti
  showConfetti();

  // Create a success overlay with user information form
  const overlay = document.createElement("div");
  overlay.className = "payment-success-overlay";
  overlay.innerHTML = `
        <div class="payment-success-modal">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Payment Successful!</h3>
            <p>Your booking has been confirmed.</p>
            <p class="transaction-id">Transaction ID: TXN${Math.floor(
              Math.random() * 1000000
            )}</p>
            
            <div class="user-info-form">
                <h4>Contact Information</h4>
                <p class="form-note">Please confirm your contact information for the ticket</p>
                
                <div class="form-group">
                    <label for="ticketEmail">Email</label>
                    <input type="email" id="ticketEmail" class="form-control" value="${
                      userProfile.email || ""
                    }" required>
                </div>
                
                <div class="form-group">
                    <label for="ticketPhone">Phone Number</label>
                    <input type="tel" id="ticketPhone" class="form-control" value="${
                      userProfile.phone || ""
                    }" required>
                </div>
            </div>
            
            <div class="success-actions">
                <button class="btn btn-primary mt-3" id="viewTicketsBtn">
                    <i class="fas fa-ticket-alt"></i> Generate Ticket
                </button>
                <button class="btn btn-outline-primary mt-3" id="backToEventsBtn">
                    <i class="fas fa-arrow-left"></i> Back to Events
                </button>
            </div>
        </div>
    `;

  // Add styles for the overlay
  const style = document.createElement("style");
  style.textContent = `
        .payment-success-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        
        .payment-success-modal {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            animation: scaleIn 0.5s ease;
            box-shadow: 0 15px 30px rgba(0, 0, 255, 0.2);
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .success-icon {
            font-size: 70px;
            color: #4BB543;
            margin-bottom: 25px;
            animation: pulse 1.5s infinite;
        }
        
        .payment-success-modal h3 {
            color: #1E40AF;
            font-size: 28px;
            margin-bottom: 15px;
        }
        
        .transaction-id {
            background: #E3F2FD;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            margin: 20px 0;
            color: #1E40AF;
        }
        
        .user-info-form {
            text-align: left;
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .user-info-form h4 {
            color: #1E40AF;
            margin-bottom: 10px;
        }
        
        .form-note {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #495057;
        }
        
        .form-control {
            width: 100%;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        .success-actions {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        #backToEventsBtn {
            border: 2px solid #3B82F6;
            color: #3B82F6;
        }
        
        #backToEventsBtn:hover {
            background: #E3F2FD;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // Handle "Generate Ticket" button
  document
    .getElementById("viewTicketsBtn")
    .addEventListener("click", function () {
      const ticketEmail = document.getElementById("ticketEmail").value.trim();
      const ticketPhone = document.getElementById("ticketPhone").value.trim();

      // Validate inputs
      if (!ticketEmail || !ticketPhone) {
        showToast("Please fill in both email and phone number", "error");
        return;
      }

      if (!isValidEmail(ticketEmail)) {
        showToast("Please enter a valid email address", "error");
        return;
      }

      // Update user profile with possibly changed email and phone
      const userProfile = JSON.parse(
        sessionStorage.getItem("userProfile") || "{}"
      );
      userProfile.email = ticketEmail;
      userProfile.phone = ticketPhone;
      sessionStorage.setItem("userProfile", JSON.stringify(userProfile));

      // Save transaction info for the ticket
      const transactionInfo = {
        id: "TXN" + Math.floor(Math.random() * 1000000),
        date: new Date().toISOString(),
        status: "Confirmed",
      };
      sessionStorage.setItem(
        "transactionInfo",
        JSON.stringify(transactionInfo)
      );

      // Redirect to ticket page
      window.location.href = "../ticket/index.html";
    });

  // Handle "Back to Events" button
  document
    .getElementById("backToEventsBtn")
    .addEventListener("click", function () {
      window.location.href = "../event-dashboard/index.html";
    });
}

// Validate email format
function isValidEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Show Confetti Animation
function showConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);

  // Create confetti pieces
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 3 + "s";
    confetti.style.backgroundColor = getRandomColor();
    confettiContainer.appendChild(confetti);
  }

  // Remove confetti after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 6000);

  // Add styles for confetti
  const style = document.createElement("style");
  style.textContent = `
    .confetti-container {
      position: fixed;
      top: -20px;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9998;
      pointer-events: none;
    }
    
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: fall 5s ease-in-out forwards;
    }
    
    @keyframes fall {
      0% {
        opacity: 1;
        top: -20px;
        transform: rotate(0deg) translateX(0);
      }
      100% {
        opacity: 0;
        top: 100vh;
        transform: rotate(360deg) translateX(100px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Get random color for confetti
function getRandomColor() {
  const colors = [
    "#3B82F6",
    "#2563EB",
    "#1E40AF",
    "#DBEAFE",
    "#60A5FA",
    "#93C5FD",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Add visual effects to elements
function addVisualEffects() {
  // Add style for visual effects
  const style = document.createElement("style");
  style.textContent = `
    .page-loaded .card {
      animation: fadeInUp 0.8s ease;
    }
    
    .app-clicked {
      animation: clickEffect 0.3s ease;
    }
    
    .button-hover {
      transform: translateY(-3px) scale(1.05) !important;
    }
    
    .qr-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #E3F2FD;
      border-top: 4px solid #1E40AF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    
    .qr-success-indicator {
      position: absolute;
      bottom: -15px;
      right: -15px;
      background: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 5px 10px rgba(0, 0, 255, 0.2);
      animation: popIn 0.5s ease;
    }
    
    .qr-success-indicator i {
      color: #4BB543;
    }
    
    .input-focused {
      transform: translateY(-5px);
      transition: transform 0.3s ease;
    }
    
    .active-input {
      border-color: #3B82F6 !important;
      box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2) !important;
    }
    
    .card-type-visa {
      border-left: 5px solid #1a1f71;
    }
    
    .card-type-mastercard {
      border-left: 5px solid #eb001b;
    }
    
    .card-type-amex {
      border-left: 5px solid #006fcf;
    }
    
    .payment-progress {
      width: 100%;
      height: 5px;
      background: #E3F2FD;
      border-radius: 5px;
      margin-top: 15px;
      overflow: hidden;
    }
    
    .progress-bar {
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #1E40AF);
      transition: width 2s ease-in-out;
    }
    
    .shake {
      animation: shake 0.5s ease;
    }
    
    .pulse {
      animation: pulse 0.5s ease;
    }
    
    @keyframes clickEffect {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-5px); }
      40%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  // Add staggered animation to tabs
  const tabs = document.querySelectorAll(".nav-tabs .nav-link");
  tabs.forEach((tab, index) => {
    tab.style.animationDelay = index * 0.1 + "s";
    tab.style.animation = "fadeInDown 0.5s ease forwards";
  });
}

// Shake element for error feedback
function shakeElement(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 500);
}

// Pulse element for visual feedback
function pulseElement(element) {
  element.classList.add("pulse");
  setTimeout(() => element.classList.remove("pulse"), 500);
}

// Show Toast Notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");

  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);

    // Add styles for the toast
    const style = document.createElement("style");
    style.textContent = `
      .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
      }
      
      .toast {
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 15px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          animation: slideInRight 0.5s ease, fadeOut 0.5s ease 3.5s forwards;
          max-width: 350px;
          backdrop-filter: blur(10px);
          border-left: 4px solid transparent;
      }
      
      .toast.info {
          background: rgba(204, 229, 255, 0.9);
          color: #004085;
          border-left-color: #3B82F6;
      }
      
      .toast.success {
          background: rgba(212, 237, 218, 0.9);
          color: #155724;
          border-left-color: #4BB543;
      }
      
      .toast.error {
          background: rgba(248, 215, 218, 0.9);
          color: #721c24;
          border-left-color: #dc3545;
      }
      
      .toast-icon {
          margin-right: 15px;
          font-size: 22px;
      }
      
      @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes fadeOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(10px) scale(0.9); }
      }
    `;
    document.head.appendChild(style);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Set icon based on toast type
  let icon = "";
  if (type === "success") {
    icon = '<i class="fas fa-check-circle toast-icon"></i>';
  } else if (type === "error") {
    icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';
  } else {
    icon = '<i class="fas fa-info-circle toast-icon"></i>';
  }

  toast.innerHTML = `${icon}<div>${message}</div>`;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Remove toast after animation
  setTimeout(() => {
    toast.addEventListener("animationend", function () {
      if (this.style.animationName === "fadeOut") {
        this.remove();
      }
    });
  }, 4000);
}
