document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const seatMap = document.querySelector(".seat-map");
  const selectedSeatsList = document.getElementById("selected-seats-list");
  const seatCountElement = document.getElementById("seat-count");
  const seatTotalElement = document.getElementById("seat-total");
  const bookingFeeElement = document.getElementById("booking-fee");
  const totalPriceElement = document.getElementById("total-price");
  const proceedButton = document.getElementById("proceed-btn");
  const tooltip = document.getElementById("seat-tooltip");
  const eventNameElement = document.getElementById("event-name");

  // Load event info from sessionStorage
  const eventInfo = JSON.parse(sessionStorage.getItem("eventInfo") || "{}");
  if (eventInfo.name) {
    eventNameElement.textContent = eventInfo.name;
    document.title = `Seat Booking - ${eventInfo.name}`;
  }

  // Configuration
  const config = {
    rows: 6,
    seatsPerRow: 15,
    rowNames: ["A", "B", "C", "D", "E", "F"],
    seatPrice: parseFloat(sessionStorage.getItem("seatPrice") || "50.00"),
    premiumPriceMultiplier: 1.5, // Premium seats cost 1.5x the standard price
    vipPriceMultiplier: 2, // VIP seats cost 2x the standard price
    bookingFeePercent: parseFloat(
      sessionStorage.getItem("bookingFeePercent") || "10"
    ),
    aisleSeats: [3, 12], // Seat numbers where aisles should be (0-indexed)
  };

  // Mock data for already booked seats
  const bookedSeats = [
    "A5",
    "A6",
    "B8",
    "C10",
    "C11",
    "D4",
    "E7",
    "E8",
    "E9",
    "F2",
  ];

  // Mock data for confirmed (your) seats
  const confirmedSeats = ["B4", "B5"];

  // State
  let selectedSeats = [];
  let totalPrice = 0;

  // Initialize seat map
  createSeatMap();
  updateSummary();

  // Event listeners
  proceedButton.addEventListener("click", seat_booking_integration.js);

  // Determine seat type and price based on row
  function getSeatTypeAndPrice(row) {
    const firstRow = config.rowNames[0]; // Premium seats (first row)
    const lastRow = config.rowNames[config.rows - 1]; // VIP seats (last row)

    if (row === firstRow) {
      return {
        type: "Premium",
        price: config.seatPrice * config.premiumPriceMultiplier,
      };
    } else if (row === lastRow) {
      return {
        type: "VIP",
        price: config.seatPrice * config.vipPriceMultiplier,
      };
    } else {
      return {
        type: "Regular",
        price: config.seatPrice,
      };
    }
  }

  // Functions
  function createSeatMap() {
    // Add seat row labels
    for (let row = 0; row < config.rows; row++) {
      const rowName = config.rowNames[row];

      // Add row label at the beginning
      const rowLabelStart = document.createElement("div");
      rowLabelStart.className = "row-label";
      rowLabelStart.textContent = rowName;
      seatMap.appendChild(rowLabelStart);

      // Add seats for this row
      for (let seatNum = 0; seatNum < config.seatsPerRow; seatNum++) {
        // Skip for aisle
        if (config.aisleSeats.includes(seatNum)) {
          const aisleSeat = document.createElement("div");
          aisleSeat.className = "seat aisle";
          seatMap.appendChild(aisleSeat);
          continue;
        }

        const seatNumber = seatNum + 1;
        const seatId = `${rowName}${seatNumber}`;

        // Get seat type and price based on row
        const seatInfo = getSeatTypeAndPrice(rowName);

        const seat = document.createElement("div");
        seat.className = "seat";

        // Add seat type class
        if (seatInfo.type === "Premium") {
          seat.classList.add("premium");
        } else if (seatInfo.type === "VIP") {
          seat.classList.add("vip");
        }

        seat.id = `seat-${seatId}`;
        seat.dataset.seatId = seatId;
        seat.dataset.price = seatInfo.price.toFixed(2);
        seat.dataset.row = rowName;
        seat.dataset.seatNumber = seatNumber;
        seat.dataset.seatType = seatInfo.type;
        seat.textContent = seatNumber;

        // Check if seat is already booked
        if (bookedSeats.includes(seatId)) {
          seat.classList.add("booked");
          seat.title = "Already booked";
        }
        // Check if seat is already confirmed
        else if (confirmedSeats.includes(seatId)) {
          seat.classList.add("confirmed");
          seat.title = "Your confirmed seat";
        }

        // Add event listeners
        seat.addEventListener("click", handleSeatClick);
        seat.addEventListener("mouseenter", showTooltip);
        seat.addEventListener("mouseleave", hideTooltip);

        seatMap.appendChild(seat);
      }

      // Add row label at the end
      const rowLabelEnd = document.createElement("div");
      rowLabelEnd.className = "row-label";
      rowLabelEnd.textContent = rowName;
      seatMap.appendChild(rowLabelEnd);
    }
  }

  function handleSeatClick(e) {
    const seat = e.currentTarget;
    const seatId = seat.dataset.seatId;

    // Can't select booked or confirmed seats
    if (
      seat.classList.contains("booked") ||
      seat.classList.contains("confirmed")
    ) {
      return;
    }

    // Toggle selection
    if (seat.classList.contains("selected")) {
      // Remove from selected
      seat.classList.remove("selected");
      selectedSeats = selectedSeats.filter((id) => id !== seatId);
    } else {
      // Add to selected
      seat.classList.add("selected");
      selectedSeats.push(seatId);
    }

    // Update summary
    updateSummary();
  }

  function updateSummary() {
    // Update selected seats list
    if (selectedSeats.length === 0) {
      selectedSeatsList.innerHTML = '<p class="no-seats">No seats selected</p>';
      proceedButton.disabled = true;
      proceedButton.classList.remove("enabled");
    } else {
      // Clear list
      selectedSeatsList.innerHTML = "";

      // Sort seats for better display
      const sortedSeats = [...selectedSeats].sort();

      // Calculate total price
      let seatTotal = 0;

      // Add each seat to the list
      sortedSeats.forEach((seatId) => {
        const seat = document.getElementById(`seat-${seatId}`);
        const price = parseFloat(seat.dataset.price);
        const seatType = seat.dataset.seatType;

        // Add to running total
        seatTotal += price;

        const seatItem = document.createElement("div");
        seatItem.className = "selected-seat-item";
        seatItem.innerHTML = `
          <span class="seat-label">${seatType} Seat ${seatId}</span>
          <span class="seat-price">$${price.toFixed(2)}</span>
        `;

        // Add remove button
        const removeButton = document.createElement("span");
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.className = "remove-seat";
        removeButton.style.marginLeft = "8px";
        removeButton.style.cursor = "pointer";
        removeButton.style.color = "#ef4444";
        removeButton.addEventListener("click", () => removeSeat(seatId));

        seatItem.querySelector(".seat-price").appendChild(removeButton);
        selectedSeatsList.appendChild(seatItem);
      });

      // Check if the button was previously disabled
      const wasDisabled = proceedButton.disabled;
      proceedButton.disabled = false;

      // Add animation if button just became enabled
      if (wasDisabled) {
        // Apply pulse animation
        proceedButton.classList.add("enabled");
        proceedButton.style.animation = "btn-pulse 1.5s";

        // Reset animation after it completes
        setTimeout(() => {
          proceedButton.style.animation = "";
        }, 1500);
      }

      // Calculate prices
      const seatCount = selectedSeats.length;
      const bookingFee = seatTotal * (config.bookingFeePercent / 100);
      totalPrice = seatTotal + bookingFee;

      // Update UI
      seatCountElement.textContent = seatCount;
      seatTotalElement.textContent = `$${seatTotal.toFixed(2)}`;
      bookingFeeElement.textContent = `$${bookingFee.toFixed(2)}`;
      totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
  }

  function removeSeat(seatId) {
    const seat = document.getElementById(`seat-${seatId}`);
    seat.classList.remove("selected");
    selectedSeats = selectedSeats.filter((id) => id !== seatId);
    updateSummary();
  }

  function showTooltip(e) {
    const seat = e.currentTarget;
    const row = seat.dataset.row;
    const seatNumber = seat.dataset.seatNumber;
    const price = seat.dataset.price;
    const seatType = seat.dataset.seatType;
    const rect = seat.getBoundingClientRect();
    const seatId = seat.dataset.seatId;

    // Skip tooltip for unavailable seats
    if (seat.classList.contains("aisle")) {
      return;
    }

    // Update tooltip content
    document.querySelector(
      ".seat-section"
    ).textContent = `Row ${row} (${seatType})`;
    document.querySelector(".seat-number").textContent = `Seat ${seatNumber}`;
    document.querySelector(".seat-price").textContent = `$${price}`;

    // Position tooltip
    tooltip.style.left = `${
      rect.left + rect.width / 2 - tooltip.offsetWidth / 2
    }px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;

    // Show tooltip
    tooltip.classList.add("visible");

    // Add status to tooltip if not available
    if (seat.classList.contains("booked")) {
      document.querySelector(".seat-price").textContent = `Already Booked`;
      document.querySelector(".seat-price").style.color = "var(--seat-booked)";
    } else if (seat.classList.contains("confirmed")) {
      document.querySelector(".seat-price").textContent = `Your Confirmed Seat`;
      document.querySelector(".seat-price").style.color =
        "var(--seat-confirmed)";
    } else if (seat.classList.contains("selected")) {
      document.querySelector(
        ".seat-price"
      ).textContent = `$${price} - Selected`;
      document.querySelector(".seat-price").style.color =
        "var(--seat-selected)";
    } else {
      document.querySelector(".seat-price").style.color =
        "var(--primary-color)";
    }
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  function proceedToPayment() {
    if (selectedSeats.length === 0) {
      showToast("Please select at least one seat", "error");
      return;
    }

    // Show loading animation
    const button = this;

    // Create a ripple effect
    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    button.appendChild(ripple);

    // Position the ripple from the click event or center of button
    const buttonRect = button.getBoundingClientRect();
    const diameter = Math.max(buttonRect.width, buttonRect.height);
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `0px`;
    ripple.style.top = `0px`;

    // Add CSS for the ripple effect - can be added to CSS file as well
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

    // SIMPLIFIED VERSION - Store essential seat information
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

    // Store basic information in session storage
    sessionStorage.setItem("selectedSeats", JSON.stringify(detailedSeats));

    // Calculate basic pricing
    const subtotal = detailedSeats.reduce(
      (total, seat) => total + seat.price,
      0
    );
    const bookingFeePercent = 10;
    const bookingFee = subtotal * (bookingFeePercent / 100);
    const totalPrice = subtotal + bookingFee;

    // Store simplified pricing info
    const simplePricingInfo = {
      subtotal: subtotal,
      bookingFeePercent: bookingFeePercent,
      bookingFee: bookingFee,
      totalPrice: totalPrice,
      seatCount: detailedSeats.length,
    };
    sessionStorage.setItem("pricingInfo", JSON.stringify(simplePricingInfo));

    console.log("Navigation process starting");
    console.log("Selected seats:", detailedSeats);
    console.log("Pricing info:", simplePricingInfo);

    // SIMPLIFIED REDIRECTION - Use multiple approaches
    try {
      // Create an anchor element for navigation
      const link = document.createElement("a");
      link.href = "../payment-method/index.html";

      console.log("About to navigate to:", link.href);

      // First approach - standard location change
      window.location.href = "../payment-method/index.html";

      // If the above didn't work after a delay, try using the anchor click
      setTimeout(function () {
        if (window.location.href.includes("seat-booking")) {
          console.log("First navigation attempt failed, trying anchor click");
          // Append the link to the document
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Last resort - direct assignment
          setTimeout(function () {
            if (window.location.href.includes("seat-booking")) {
              console.log(
                "Second navigation attempt failed, trying direct assignment"
              );
              window.location = "../payment-method/index.html";

              // Absolute last resort
              setTimeout(function () {
                if (window.location.href.includes("seat-booking")) {
                  console.log(
                    "All navigation attempts failed, showing error message"
                  );
                  button.disabled = false;
                  button.innerHTML = "Continue to Payment";
                  alert(
                    "Navigation to payment page failed. Please use the direct link at the top of the page."
                  );
                }
              }, 1000);
            }
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Error during navigation:", error);
      button.disabled = false;
      button.innerHTML = "Continue to Payment";
      alert(
        "Navigation error: " +
          error.message +
          ". Please use the direct link at the top of the page."
      );
    }
  }

  // Toast notification function (for error messages)
  function showToast(message, type = "info") {
    // Create toast element if it doesn't exist
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    // Set toast type and message
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Show toast
    toast.classList.add("show");

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
});
