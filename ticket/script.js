document.addEventListener("DOMContentLoaded", function () {
  // Initialize the form with today's date and default time
  initializeForm();

  // Set up form event listeners
  setupFormListeners();

  // Initialize QR code
  updateQRCode();
});

// Initialize form with defaults
function initializeForm() {
  // Load data from session storage
  const userProfile = JSON.parse(sessionStorage.getItem("userProfile") || "{}");
  const eventInfo = JSON.parse(sessionStorage.getItem("eventInfo") || "{}");
  const selectedSeats = JSON.parse(
    sessionStorage.getItem("selectedSeats") || "[]"
  );
  const transactionInfo = JSON.parse(
    sessionStorage.getItem("transactionInfo") || "{}"
  );

  // Default date to today if not in session storage
  const today = new Date();
  let eventDate = today;

  if (eventInfo.date) {
    eventDate = new Date(eventInfo.date);
  }

  const dateInput = document.getElementById("ticketDate");
  const formattedDate = eventDate.toISOString().split("T")[0];
  dateInput.value = formattedDate;
  dateInput.min = formattedDate;
  dateInput.disabled = true; // Make date not editable

  // Set event time from session storage or default
  const timeInput = document.getElementById("ticketTime");
  timeInput.value = eventInfo.time || "19:30";
  timeInput.disabled = true; // Make time not editable

  // Pre-fill form with user profile data if available
  if (userProfile.name)
    document.getElementById("fullName").value = userProfile.name;
  if (userProfile.age) document.getElementById("age").value = userProfile.age;
  if (userProfile.gender) {
    const genderSelect = document.getElementById("gender");
    for (let i = 0; i < genderSelect.options.length; i++) {
      if (genderSelect.options[i].value === userProfile.gender) {
        genderSelect.selectedIndex = i;
        break;
      }
    }
  }
  if (userProfile.email)
    document.getElementById("email").value = userProfile.email;
  if (userProfile.phone)
    document.getElementById("phone").value = userProfile.phone;

  // Pre-fill event data
  if (eventInfo.name) {
    const eventSelect = document.getElementById("eventName");
    // Check if the event is in the list
    let eventFound = false;
    for (let i = 0; i < eventSelect.options.length; i++) {
      if (eventSelect.options[i].value === eventInfo.name) {
        eventSelect.selectedIndex = i;
        eventFound = true;
        break;
      }
    }

    // If event not found in dropdown, add it
    if (!eventFound && eventInfo.name) {
      const option = document.createElement("option");
      option.value = eventInfo.name;
      option.textContent = eventInfo.name;
      eventSelect.appendChild(option);
      eventSelect.value = eventInfo.name;
    }

    // Make event name not editable
    eventSelect.disabled = true;
  }

  // Set ticket type based on selected seats
  // If we have different types of seats selected, use the highest tier (VIP > Premium > Standard)
  if (selectedSeats && selectedSeats.length > 0) {
    let highestTierSeat = "Standard";

    for (const seat of selectedSeats) {
      if (seat.type === "VIP") {
        highestTierSeat = "VIP";
        break; // VIP is highest, no need to check further
      } else if (seat.type === "Premium" && highestTierSeat !== "VIP") {
        highestTierSeat = "Premium";
      }
    }

    const ticketTypeSelect = document.getElementById("ticketType");
    ticketTypeSelect.value = highestTierSeat;
    ticketTypeSelect.disabled = true; // Make ticket type not editable
  } else {
    // Set ticket type to Standard by default
    const ticketTypeSelect = document.getElementById("ticketType");
    ticketTypeSelect.value = "Standard";
    ticketTypeSelect.disabled = true;
  }

  // Set venue
  if (eventInfo.venue) {
    document.getElementById("venue").value = eventInfo.venue;
    document.getElementById("venue").disabled = true; // Make venue not editable
  }

  // Format selected seats
  if (selectedSeats && selectedSeats.length > 0) {
    // Create a detailed seat string that includes seat type
    const seatStringDetails = selectedSeats
      .map((seat) => {
        return `${seat.type} - ${seat.row}${seat.number}`;
      })
      .join(", ");

    // Create a simple seat string for the actual input value
    const seatString = selectedSeats
      .map((seat) => `${seat.row}${seat.number}`)
      .join(", ");

    // Set the value and add a tooltip showing seat details
    const seatNumberInput = document.getElementById("seatNumber");
    seatNumberInput.value = seatString;
    seatNumberInput.disabled = true; // Make seat number not editable
    seatNumberInput.title = seatStringDetails; // Add tooltip with detailed info

    // For clear visual feedback that the field contains detailed information
    seatNumberInput.style.cursor = "help";

    // Add a small info icon to indicate there's more information on hover
    const seatFormGroup = seatNumberInput.closest(".form-group");
    const infoIcon = document.createElement("i");
    infoIcon.className = "fas fa-info-circle";
    infoIcon.style.color = "#3B82F6";
    infoIcon.style.marginLeft = "8px";
    infoIcon.style.cursor = "help";
    infoIcon.title = seatStringDetails;
    seatFormGroup.querySelector("label").appendChild(infoIcon);
  }

  // Set random ticket ID based on transaction or generate new one
  const ticketId = transactionInfo.id || generateTicketId();
  document.getElementById("previewTicketId").textContent = ticketId;

  // Set current year in footer
  document.querySelector(".footer-content").innerHTML = document
    .querySelector(".footer-content")
    .innerHTML.replace("2025", new Date().getFullYear());

  // Update the preview with all the loaded data
  updateTicketPreview();

  // If we have all necessary information from session storage, automatically generate the ticket
  if (
    userProfile.name &&
    eventInfo.name &&
    selectedSeats &&
    selectedSeats.length > 0
  ) {
    // Slight delay to ensure UI is fully loaded
    setTimeout(() => {
      // Highlight the form fields to show they're prefilled
      document
        .querySelectorAll("#ticketForm input, #ticketForm select")
        .forEach((el) => {
          el.classList.add("prefilled");
        });

      // Auto-generate if we have complete information
      if (userProfile.email && userProfile.phone) {
        generateTicket();
      }
    }, 500);
  }
}

// Set up form event listeners for live preview
function setupFormListeners() {
  const form = document.getElementById("ticketForm");
  const formInputs = form.querySelectorAll("input, select");

  // Update preview on input changes
  formInputs.forEach((input) => {
    input.addEventListener("input", function () {
      updateTicketPreview();
    });
  });

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    generateTicket();
  });

  // Download buttons
  document
    .getElementById("downloadPDF")
    .addEventListener("click", downloadTicketPDF);
  document
    .getElementById("downloadImage")
    .addEventListener("click", downloadTicketImage);
}

// Update the ticket preview based on form inputs
function updateTicketPreview() {
  const eventName =
    document.getElementById("eventName").value || "Music Festival 2025";
  const ticketType = document.getElementById("ticketType").value || "VIP";
  const fullName = document.getElementById("fullName").value || "John Doe";
  const age = document.getElementById("age").value || "25";
  const gender = document.getElementById("gender").value || "Male";
  const seatNumber = document.getElementById("seatNumber").value || "A12";
  const email = document.getElementById("email").value || "john@example.com";
  const phone = document.getElementById("phone").value || "+1 234 567 8900";
  const venue =
    document.getElementById("venue").value || "Grand Stadium, New York";

  // Update preview elements
  document.getElementById("previewEventName").textContent = eventName;
  document.getElementById(
    "previewTicketType"
  ).textContent = `${ticketType.toUpperCase()} ACCESS`;
  document.getElementById("previewName").textContent = fullName;
  document.getElementById("previewAge").textContent = age;
  document.getElementById("previewGender").textContent = gender;
  document.getElementById("previewSeat").textContent = seatNumber;
  document.getElementById("previewEmail").textContent = email;
  document.getElementById("previewPhone").textContent = phone;
  document.getElementById("previewVenue").textContent = venue;

  // Format date and time
  const date = document.getElementById("ticketDate").value;
  const time = document.getElementById("ticketTime").value;
  if (date) {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    document.getElementById("previewDate").textContent = formattedDate;
  }

  if (time) {
    const formattedTime = formatAMPM(time);
    document.getElementById("previewTime").textContent = formattedTime;
  }

  // Update QR code with new data
  updateQRCode();
}

// Format time to AM/PM
function formatAMPM(time) {
  const timeArray = time.split(":");
  let hours = parseInt(timeArray[0]);
  const minutes = timeArray[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  return `${hours}:${minutes} ${ampm}`;
}

// Generate QR code
function updateQRCode() {
  const qrcodeContainer = document.getElementById("qrcode");
  qrcodeContainer.innerHTML = ""; // Clear existing QR code

  // Get data for QR code
  const ticketData = {
    event: document.getElementById("previewEventName").textContent,
    ticketType: document.getElementById("previewTicketType").textContent,
    name: document.getElementById("previewName").textContent,
    seat: document.getElementById("previewSeat").textContent,
    date: document.getElementById("previewDate").textContent,
    time: document.getElementById("previewTime").textContent,
    ticketId: document.getElementById("previewTicketId").textContent,
  };

  // Convert to JSON string
  const qrData = JSON.stringify(ticketData);

  // Create QR code with specific styling
  new QRCode(qrcodeContainer, {
    text: qrData,
    width: 100,
    height: 100,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Add logo overlay to QR code
  setTimeout(() => {
    addLogoToQR();
  }, 100);
}

// Add a logo to the center of QR code
function addLogoToQR() {
  const qrCodeImg = document.querySelector("#qrcode img");
  if (!qrCodeImg) return;

  const logoOverlay = document.createElement("div");
  logoOverlay.className = "qr-logo-overlay";
  logoOverlay.innerHTML = '<i class="fas fa-ticket-alt"></i>';
  logoOverlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d4af37;
        font-size: 14px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        z-index: 2;
    `;

  document.getElementById("qrcode").appendChild(logoOverlay);
}

// Generate a random ticket ID
function generateTicketId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TKT";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Generate the final ticket and enable download buttons
function generateTicket() {
  // Validate form
  const form = document.getElementById("ticketForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Apply some animation to the ticket to indicate it's being generated
  const ticket = document.getElementById("ticketPreview");
  ticket.classList.add("generating");

  // Apply glare effect
  addGlareEffect(ticket);

  // Show loading indicator
  showLoadingIndicator();

  // Simulate processing time
  setTimeout(() => {
    // Remove loading and animation classes
    hideLoadingIndicator();
    ticket.classList.remove("generating");

    // Add generated class for final appearance
    ticket.classList.add("generated");

    // Enable download buttons
    document.getElementById("downloadPDF").disabled = false;
    document.getElementById("downloadImage").disabled = false;

    // Show success message
    showToast(
      "Ticket generated successfully! You can now download it.",
      "success"
    );

    // Scroll to ticket if needed
    ticket.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 1500);
}

// Add glare effect to make ticket look premium
function addGlareEffect(element) {
  const glare = document.createElement("div");
  glare.className = "glare-effect";
  glare.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0) 100%);
        z-index: 2;
        pointer-events: none;
        animation: glareAnimation 2s ease-in-out;
    `;

  // Add animation style
  const style = document.createElement("style");
  style.textContent = `
        @keyframes glareAnimation {
            0% { transform: translateX(-100%) translateY(-100%); }
            100% { transform: translateX(100%) translateY(100%); }
        }
        
        .generating {
            transform: scale(1.02);
            box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
            transition: all 0.5s ease;
        }
        
        .generated {
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.35);
            border: 1px solid rgba(212, 175, 55, 0.3);
            transition: all 0.5s ease;
        }
    `;
  document.head.appendChild(style);

  element.appendChild(glare);

  // Remove glare after animation completes
  setTimeout(() => {
    glare.remove();
  }, 2000);
}

// Show loading indicator
function showLoadingIndicator() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-cog fa-spin"></i>
        </div>
        <div class="loading-text">Generating Premium Ticket...</div>
    `;
  loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

  const spinnerStyle = document.createElement("style");
  spinnerStyle.textContent = `
        .loading-spinner {
            font-size: 3rem;
            color: #d4af37;
            margin-bottom: 1rem;
        }
        
        .loading-text {
            color: white;
            font-size: 1.2rem;
            font-family: 'Playfair Display', serif;
        }
    `;
  document.head.appendChild(spinnerStyle);

  document.body.appendChild(loadingOverlay);
}

// Hide loading indicator
function hideLoadingIndicator() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

// Download ticket as PDF
function downloadTicketPDF() {
  showLoadingIndicator();
  const ticketElement = document.getElementById("ticketPreview");

  // Import jsPDF
  const { jsPDF } = window.jspdf;

  setTimeout(() => {
    html2canvas(ticketElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", [210, 130]);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Get filename from ticket details
      const eventName = document.getElementById("previewEventName").textContent;
      const ticketId = document.getElementById("previewTicketId").textContent;
      const fileName = `${eventName.replace(/\s+/g, "-")}_${ticketId}.pdf`;

      pdf.save(fileName);
      hideLoadingIndicator();
      showToast("PDF downloaded successfully!", "success");
    });
  }, 500);
}

// Download ticket as image
function downloadTicketImage() {
  showLoadingIndicator();
  const ticketElement = document.getElementById("ticketPreview");

  setTimeout(() => {
    html2canvas(ticketElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#0a0a0a",
    }).then((canvas) => {
      const link = document.createElement("a");

      // Get filename from ticket details
      const eventName = document.getElementById("previewEventName").textContent;
      const ticketId = document.getElementById("previewTicketId").textContent;
      const fileName = `${eventName.replace(/\s+/g, "-")}_${ticketId}.png`;

      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
      hideLoadingIndicator();
      showToast("Image downloaded successfully!", "success");
    });
  }, 500);
}

// Show toast notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Set icon based on type
  let icon = "";
  if (type === "success") {
    icon = '<i class="fas fa-check-circle"></i>';
  } else if (type === "error") {
    icon = '<i class="fas fa-exclamation-circle"></i>';
  } else {
    icon = '<i class="fas fa-info-circle"></i>';
  }

  toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

  // Add toast styles
  toast.style.cssText = `
        display: flex;
        align-items: center;
        background-color: #1c1c1c;
        color: white;
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.3s ease, slideIn 0.3s ease;
        max-width: 350px;
        position: relative;
        border-left: 4px solid #d4af37;
    `;

  if (type === "success") {
    toast.style.borderLeftColor = "#4caf50";
  } else if (type === "error") {
    toast.style.borderLeftColor = "#f44336";
  }

  // Style icon
  const toastIcon = toast.querySelector(".toast-icon");
  toastIcon.style.cssText = `
        margin-right: 12px;
        font-size: 20px;
        color: #d4af37;
    `;

  if (type === "success") {
    toastIcon.style.color = "#4caf50";
  } else if (type === "error") {
    toastIcon.style.color = "#f44336";
  }

  // Style close button
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.style.cssText = `
        background: none;
        border: none;
        color: #999;
        font-size: 16px;
        cursor: pointer;
        margin-left: 12px;
        padding: 0;
    `;

  // Add closing functionality
  closeBtn.addEventListener("click", function () {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 300);
  });

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(50px); }
            to { transform: translateX(0); }
        }
    `;
  document.head.appendChild(style);

  // Add toast to container
  toastContainer.appendChild(toast);

  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}
