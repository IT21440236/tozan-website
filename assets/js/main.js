/**
 * Custom JavaScript for Tozan 2025 Website
 *
 * This file handles:
 * - Smooth scrolling navigation between sections
 * - Active section highlighting on scroll
 * - Gallery lightbox initialization
 * - Gallery filter functionality (photos/videos)
 * - Visa section collapse animations
 *
 * Dependencies:
 * - Bootstrap 5 (for collapse functionality)
 * - GLightbox (for image lightbox)
 */

// Wait for DOM to be fully loaded before initializing functionality
document.addEventListener("DOMContentLoaded", function () {
  // ============================================================================
  // SMOOTH SCROLL NAVIGATION
  // ============================================================================
  // Provides smooth scrolling to sections when navigation links are clicked
  // Also handles closing the mobile menu after navigation

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Only handle internal anchor links (starting with #)
      // External links are handled normally by the browser
      if (href.startsWith("#")) {
        e.preventDefault(); // Prevent default jump behavior
        const targetId = href.substring(1); // Remove the # symbol
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          // Smoothly scroll to the target section
          // The 'block: start' option aligns the section to the top of the viewport
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Close mobile hamburger menu if it's currently open
          // This improves UX on mobile devices by clearing the menu after navigation
          const navbarCollapse = document.querySelector(".navbar-collapse");
          if (navbarCollapse.classList.contains("show")) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
          }
        }
      }
    });
  });

  // ============================================================================
  // ACTIVE SECTION HIGHLIGHTING
  // ============================================================================
  // Highlights the navigation link corresponding to the currently visible section
  // Updates as the user scrolls through the page

  const sections = document.querySelectorAll("section[id]");

  /**
   * Updates navigation link active states based on scroll position
   * Adds 'active' class to the nav link whose section is currently in view
   */
  function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      // Offset by 100px to account for fixed navbar height
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      // Check if the current scroll position is within this section's bounds
      if (
        navLink &&
        scrollY > sectionTop &&
        scrollY <= sectionTop + sectionHeight
      ) {
        navLink.classList.add("active");
      } else if (navLink) {
        navLink.classList.remove("active");
      }
    });
  }

  // Listen for scroll events and update active navigation highlighting
  window.addEventListener("scroll", highlightNavigation);

  // ============================================================================
  // NAVBAR BACKGROUND ON SCROLL
  // ============================================================================
  // Changes navbar from transparent to solid black background when scrolling

  const navbar = document.getElementById("navbar");

  /**
   * Updates navbar background based on scroll position
   * Adds 'scrolled' class when user scrolls down from top
   */
  function updateNavbarBackground() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // Listen for scroll events and update navbar background
  window.addEventListener("scroll", updateNavbarBackground);

  // Initialize navbar state on page load
  updateNavbarBackground();

  // ============================================================================
  // GALLERY LIGHTBOX INITIALIZATION
  // ============================================================================
  // Initializes GLightbox for full-screen image viewing in the gallery
  // Only initializes if GLightbox library is loaded

  if (typeof GLightbox !== "undefined") {
    const lightbox = GLightbox({
      selector: ".glightbox", // Target elements with this class
      touchNavigation: true, // Enable swipe gestures on touch devices
      loop: true, // Allow looping through images
      autoplayVideos: false, // Don't auto-play videos in lightbox
    });
  }

  // ============================================================================
  // GALLERY FILTER FUNCTIONALITY
  // ============================================================================
  // Allows users to filter gallery items by type (all, photos, videos)
  // Implements smooth fade transitions when switching between filters

  const filterButtons = document.querySelectorAll(".gallery-filters .btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Update active button state
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Get the selected filter value (all, photos, or videos)
      const filter = this.getAttribute("data-filter");

      // Filter gallery items with smooth fade transitions
      // Uses opacity and display changes with setTimeout for animation effect
      galleryItems.forEach((item) => {
        const itemType = item.getAttribute("data-type");

        if (filter === "all") {
          // Show all items with fade-in effect
          item.style.opacity = "0";
          setTimeout(() => {
            item.style.display = "block";
            // Small delay ensures display change happens before opacity transition
            setTimeout(() => {
              item.style.opacity = "1";
            }, 10);
          }, 150);
        } else if (itemType === filter) {
          // Show matching items with fade-in effect
          item.style.opacity = "0";
          setTimeout(() => {
            item.style.display = "block";
            setTimeout(() => {
              item.style.opacity = "1";
            }, 10);
          }, 150);
        } else {
          // Hide non-matching items with fade-out effect
          item.style.opacity = "0";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // ============================================================================
  // VISA SECTION COLLAPSE ANIMATIONS
  // ============================================================================
  // Animates the chevron icon when visa step details are expanded/collapsed
  // Rotates the icon to indicate the current state (expanded/collapsed)

  const collapseElements = document.querySelectorAll(".step-details");

  collapseElements.forEach((element) => {
    // When a step is being shown (expanded)
    element.addEventListener("show.bs.collapse", function () {
      const stepTitle = this.previousElementSibling;
      const toggle = stepTitle.querySelector(".collapse-toggle i");
      if (toggle) {
        // Rotate chevron to point up (expanded state)
        toggle.style.transform = "rotate(0deg)";
      }
    });

    // When a step is being hidden (collapsed)
    element.addEventListener("hide.bs.collapse", function () {
      const stepTitle = this.previousElementSibling;
      const toggle = stepTitle.querySelector(".collapse-toggle i");
      if (toggle) {
        // Rotate chevron to point down (collapsed state)
        toggle.style.transform = "rotate(180deg)";
      }
    });
  });
});
