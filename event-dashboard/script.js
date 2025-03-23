// your code goes here
document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard loaded successfully.");

  // Define event data
  const events = [
    {
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
    },
    {
      id: 2,
      name: "Tech Conference 2025",
      date: "May 20, 2025",
      time: "9:00 AM",
      location: "Silicon Valley",
      venue: "Tech Innovation Center",
      price: 75.0,
      bookingFeePercent: 10,
      description:
        "Join industry leaders and innovators to explore cutting-edge technologies and future trends.",
      image:
        "https://4.imimg.com/data4/VH/CO/MY-19253486/event-management-services-1000x1000.jpg",
    },
    {
      id: 3,
      name: "Wedding Expo",
      date: "June 10, 2025",
      time: "10:00 AM",
      location: "Downtown",
      venue: "Grand Ballroom",
      price: 30.0,
      bookingFeePercent: 10,
      description:
        "Discover everything you need for your dream wedding with top vendors and wedding planners.",
      image:
        "https://5.imimg.com/data5/SELLER/Default/2022/8/VC/TV/BK/22423502/wedding-management-1000x1000.jpg",
    },
  ];

  // Setup event booking buttons
  setupEventButtons();

  // Setup user profile data
  setupUserProfile();

  // Function to handle event booking
  function bookEvent(eventId) {
    // Find the selected event by id
    const selectedEvent = events.find((event) => event.id === eventId);

    if (selectedEvent) {
      // Store event information in sessionStorage
      sessionStorage.setItem("eventInfo", JSON.stringify(selectedEvent));

      // Get user profile from sessionStorage or create a default one
      const userProfile = JSON.parse(
        sessionStorage.getItem("userProfile") || "{}"
      );

      // Ensure the userProfile exists and has all required fields
      const updatedUserProfile = {
        name: userProfile.name || "John Doe",
        age: userProfile.age || "28",
        gender: userProfile.gender || "Male",
        email: userProfile.email || "john@example.com",
        phone: userProfile.phone || "+1 234 567 8900",
      };

      // Save user profile to sessionStorage
      sessionStorage.setItem("userProfile", JSON.stringify(updatedUserProfile));

      // Store pricing information separately for easy access
      sessionStorage.setItem("seatPrice", selectedEvent.price.toFixed(2));
      sessionStorage.setItem(
        "bookingFeePercent",
        selectedEvent.bookingFeePercent
      );

      // Redirect to seat booking page
      window.location.href = "../seat-booking/index.html";
    } else {
      console.error("Event not found with ID:", eventId);
    }
  }

  // Setup event booking buttons
  function setupEventButtons() {
    const bookButtons = document.querySelectorAll(".event-card .btn");

    bookButtons.forEach((button, index) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        bookEvent(index + 1); // Event IDs start from 1
      });

      // Update button text based on event type
      if (index === 0) {
        button.textContent = "Book Now";
      } else if (index === 1) {
        button.textContent = "Register";
      } else {
        button.textContent = "Get Tickets";
      }
    });
  }

  // Setup mock user profile
  function setupUserProfile() {
    // Check if we've already created a profile in this session
    if (!sessionStorage.getItem("userProfile")) {
      // Create a mock user profile
      const userProfile = {
        name: "John Doe",
        age: "28",
        gender: "Male",
        email: "john@example.com",
        phone: "+1 234 567 8900",
      };

      // Save to sessionStorage
      sessionStorage.setItem("userProfile", JSON.stringify(userProfile));
    }
  }

  // Setup navbar links
  setupNavLinks();

  function setupNavLinks() {
    // Get all navbar links
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    // Home link
    navLinks[0].addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "../event-dashboard/index.html";
    });

    // My Bookings link - Show tickets
    navLinks[1].addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "../ticket/index.html";
    });

    // Profile link
    navLinks[2].addEventListener("click", function (e) {
      e.preventDefault();
      alert("Profile feature coming soon!");
    });

    // Contact link
    navLinks[3].addEventListener("click", function (e) {
      e.preventDefault();
      alert("Contact feature coming soon!");
    });
  }
});
