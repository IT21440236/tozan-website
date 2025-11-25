/**
 * Property-Based Tests for Navigation Component
 * **Feature: tozan-pilgrimage-website, Property 3: Navigation Smooth Scrolling**
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "fs";
import { join } from "path";

describe("Property 3: Navigation Smooth Scrolling", () => {
  let htmlContent;
  let cssContent;

  beforeEach(() => {
    // Load the actual HTML and CSS files
    htmlContent = readFileSync(join(process.cwd(), "index.html"), "utf-8");
    cssContent = readFileSync(
      join(process.cwd(), "assets/css/style.css"),
      "utf-8"
    );
  });

  /**
   * **Validates: Requirements 9.3**
   *
   * Property: For any navigation link in the navbar, clicking the link SHALL
   * trigger smooth scrolling to the corresponding section ID on the same page
   * without page transitions.
   *
   * This property verifies that:
   * 1. All navigation links have valid href attributes pointing to section IDs
   * 2. The smooth-scroll CSS property is applied
   * 3. No external links exist in main navigation
   */
  it("should have valid internal anchor links for all navigation items", () => {
    // Extract all nav links from HTML
    const navLinkMatches = htmlContent.matchAll(
      /class="nav-link"[^>]*href="([^"]+)"/g
    );
    const navLinks = Array.from(navLinkMatches).map((match) => match[1]);

    expect(navLinks.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...navLinks), (href) => {
        // Property 1: All nav links must start with # (internal links)
        expect(href).toMatch(/^#/);

        // Property 2: The target section must exist in the HTML
        const targetId = href.substring(1);
        const sectionRegex = new RegExp(`id="${targetId}"`, "g");
        expect(htmlContent).toMatch(sectionRegex);

        // Property 3: Links should be same-page anchors (no external URLs)
        expect(href).not.toMatch(/^(https?:)?\/\//);
      }),
      { numRuns: 100 }
    );
  });

  it("should have smooth scroll CSS property enabled", () => {
    // Check that smooth scroll is enabled in the CSS
    expect(cssContent).toMatch(/scroll-behavior:\s*smooth/);
  });

  it("should maintain internal navigation without external links", () => {
    // Extract all nav links
    const navLinkMatches = htmlContent.matchAll(
      /class="nav-link"[^>]*href="([^"]+)"/g
    );
    const navLinks = Array.from(navLinkMatches).map((match) => match[1]);

    fc.assert(
      fc.property(fc.constantFrom(...navLinks), (href) => {
        // Property: No navigation link should be external (http://, https://, //)
        expect(href).not.toMatch(/^(https?:)?\/\//);

        // Property: All links should be same-page anchors
        expect(href).toMatch(/^#[a-zA-Z0-9-_]+$/);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all required navigation sections present", () => {
    const requiredSections = ["about", "temple", "details", "gallery", "visa"];

    fc.assert(
      fc.property(fc.constantFrom(...requiredSections), (sectionId) => {
        // Property: Each required section must exist in the HTML
        const sectionRegex = new RegExp(`id="${sectionId}"`, "g");
        expect(htmlContent).toMatch(sectionRegex);

        // Property: Each section must have a corresponding nav link
        const navLinkRegex = new RegExp(
          `class="nav-link"[^>]*href="#${sectionId}"`,
          "g"
        );
        expect(htmlContent).toMatch(navLinkRegex);
      }),
      { numRuns: 100 }
    );
  });

  it("should have consistent href-to-id mapping for all nav links", () => {
    // Extract all nav links and their targets
    const navLinkMatches = htmlContent.matchAll(
      /class="nav-link"[^>]*href="#([^"]+)"/g
    );
    const targetIds = Array.from(navLinkMatches).map((match) => match[1]);

    expect(targetIds.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...targetIds), (targetId) => {
        // Property: The target element with this ID must exist in the HTML
        const idRegex = new RegExp(`id="${targetId}"`, "g");
        expect(htmlContent).toMatch(idRegex);
      }),
      { numRuns: 100 }
    );
  });

  it("should have navigation bar with fixed positioning", () => {
    // Verify the navbar has the fixed-top class for sticky navigation
    expect(htmlContent).toMatch(/navbar[^>]*fixed-top/);
  });

  it("should have mobile hamburger menu toggle", () => {
    // Verify the navbar toggler exists for mobile menu
    expect(htmlContent).toMatch(/navbar-toggler/);
    expect(htmlContent).toMatch(/data-bs-toggle="collapse"/);
  });
});
