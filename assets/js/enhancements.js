/**
 * UX Enhancements for Tozan Pilgrimage Website
 *
 * - Scroll-triggered reveal animations on content sections / cards
 * - Active section highlighting on the Pilgrimage Details sidebar
 * - Reading progress bar at top of page
 *
 * Pure vanilla JS, no dependencies. Loaded with `defer`.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* 1. Reading progress bar                                            */
  /* ------------------------------------------------------------------ */
  function initReadingProgress() {
    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = h.scrollHeight - h.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ------------------------------------------------------------------ */
  /* 2. Reveal-on-scroll                                                */
  /* ------------------------------------------------------------------ */
  function initRevealOnScroll() {
    // Respect reduced-motion preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Only animate small/medium child elements. Large section wrappers
    // (.content-section, .detail-section) are intentionally excluded because
    // when they are taller than the viewport the IntersectionObserver
    // threshold can fail to fire and the whole block would stay invisible.
    const targets = document.querySelectorAll(
      ".section-content > .card, .feature-card, .step-item"
    );
    if (!targets.length || !("IntersectionObserver" in window)) return;

    targets.forEach(function (el) {
      el.classList.add("reveal");
    });

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 }
    );

    // Safety net: any reveal element that hasn't been marked visible
    // within 3s (e.g. due to layout/observer edge cases) should be shown.
    window.setTimeout(function () {
      targets.forEach(function (el) {
        if (!el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
        }
      });
    }, 3000);

    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Sidebar scroll-spy for Pilgrimage Details                       */
  /* ------------------------------------------------------------------ */
  function initSidebarScrollSpy() {
    const sidebarLinks = document.querySelectorAll(".sidebar-link[data-section]");
    if (!sidebarLinks.length || !("IntersectionObserver" in window)) return;

    const linkBySection = {};
    const sectionEls = [];
    sidebarLinks.forEach(function (link) {
      const id = link.getAttribute("data-section");
      const el = document.getElementById(id);
      if (el) {
        linkBySection[id] = link;
        sectionEls.push(el);
      }
    });

    const visible = new Set();

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        });

        // Pick the topmost visible section
        let active = null;
        let topY = Infinity;
        visible.forEach(function (id) {
          const el = document.getElementById(id);
          if (!el) return;
          const y = el.getBoundingClientRect().top;
          if (y < topY) {
            topY = y;
            active = id;
          }
        });

        sidebarLinks.forEach(function (l) {
          l.classList.toggle(
            "active",
            l.getAttribute("data-section") === active
          );
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sectionEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Smooth scroll for sidebar anchors (account for fixed navbar)    */
  /* ------------------------------------------------------------------ */
  function initSidebarSmoothScroll() {
    const links = document.querySelectorAll(".sidebar-link[href^='#']");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const id = link.getAttribute("href").substring(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const top =
          el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */
  function boot() {
    initReadingProgress();
    initRevealOnScroll();
    initSidebarScrollSpy();
    initSidebarSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
