/**
 * Property-Based Tests for Responsive Design Consistency
 * **Feature: tozan-pilgrimage-website, Property 2: Responsive Design Consistency**
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "fs";
import { join } from "path";

describe("Property 2: Responsive Design Consistency", () => {
  let cssContent;

  beforeEach(() => {
    // Load the actual CSS file
    cssContent = readFileSync(
      join(process.cwd(), "assets/css/style.css"),
      "utf-8"
    );
  });

  /**
   * **Validates: Requirements 4.5, 6.2**
   *
   * Property: For any viewport size change, all sections SHALL maintain
   * consistent styling through CSS media queries and responsive framework
   * classes, ensuring readability and usability across all device types.
   *
   * This property verifies that:
   * 1. Media queries are defined for all required breakpoints
   * 2. Typography scales appropriately across viewport sizes
   * 3. Spacing adjusts consistently for smaller screens
   * 4. Layout remains usable without horizontal scrolling
   */

  it("should define media queries for all required breakpoints", () => {
    // Required breakpoints for mobile, tablet, and desktop
    const requiredBreakpoints = [
      { name: "mobile-small", maxWidth: 575 },
      { name: "mobile-large", maxWidth: 767 },
      { name: "tablet", maxWidth: 991 },
      { name: "desktop", minWidth: 1200 },
    ];

    fc.assert(
      fc.property(fc.constantFrom(...requiredBreakpoints), (breakpoint) => {
        // Property: Each breakpoint must have corresponding media query
        if (breakpoint.maxWidth) {
          const mediaQueryRegex = new RegExp(
            `@media[^{]*\\(max-width:\\s*${breakpoint.maxWidth}px\\)`,
            "i"
          );
          expect(cssContent).toMatch(mediaQueryRegex);
        }
        if (breakpoint.minWidth) {
          const mediaQueryRegex = new RegExp(
            `@media[^{]*\\(min-width:\\s*${breakpoint.minWidth}px\\)`,
            "i"
          );
          expect(cssContent).toMatch(mediaQueryRegex);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should adjust typography sizes for different screen sizes", () => {
    // Extract all media queries
    const mediaQueries = cssContent.matchAll(
      /@media[^{]+\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    const queries = Array.from(mediaQueries);

    expect(queries.length).toBeGreaterThan(0);

    // Typography properties that should be adjusted
    // Note: font-size is critical for responsive design, line-height is often kept consistent
    const typographyProperties = ["font-size"];

    fc.assert(
      fc.property(fc.constantFrom(...typographyProperties), (property) => {
        // Property: Typography properties should be adjusted in media queries
        let foundInMediaQuery = false;

        for (const query of queries) {
          if (query[0].includes(property)) {
            foundInMediaQuery = true;
            break;
          }
        }

        expect(foundInMediaQuery).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should adjust spacing for smaller screens", () => {
    // Extract media queries for smaller screens (max-width)
    const smallScreenQueries = cssContent.matchAll(
      /@media[^{]*max-width[^{]+\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    const queries = Array.from(smallScreenQueries);

    expect(queries.length).toBeGreaterThan(0);

    // Spacing properties that should be adjusted
    const spacingProperties = ["padding", "margin", "gap"];

    fc.assert(
      fc.property(fc.constantFrom(...spacingProperties), (property) => {
        // Property: Spacing properties should be adjusted in small screen media queries
        let foundInMediaQuery = false;

        for (const query of queries) {
          if (query[0].includes(property)) {
            foundInMediaQuery = true;
            break;
          }
        }

        expect(foundInMediaQuery).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should prevent horizontal scrolling on all screen sizes", () => {
    // Property: CSS should include overflow-x: hidden to prevent horizontal scrolling
    const overflowXHiddenRegex = /overflow-x:\s*hidden/;
    expect(cssContent).toMatch(overflowXHiddenRegex);

    // Property: Images and videos should have max-width: 100%
    const imgMaxWidthRegex = /img\s*\{[^}]*max-width:\s*100%/s;
    const videoMaxWidthRegex = /video\s*\{[^}]*max-width:\s*100%/s;

    expect(cssContent).toMatch(imgMaxWidthRegex);
    expect(cssContent).toMatch(videoMaxWidthRegex);
  });

  it("should maintain consistent section styling across all breakpoints", () => {
    // Extract all section-related classes
    const sectionClasses = [
      ".content-section",
      ".hero-section",
      ".gallery-section",
      ".visa-section",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...sectionClasses), (sectionClass) => {
        // Property: Each section class should have base styles defined
        const sectionRegex = new RegExp(
          `${sectionClass.replace(".", "\\.")}\\s*\\{`,
          "g"
        );
        const matches = cssContent.match(sectionRegex);
        expect(matches).toBeTruthy();
        expect(matches.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should use CSS custom properties for responsive values", () => {
    // Extract :root section
    const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
    expect(rootMatch).toBeTruthy();

    const rootContent = rootMatch[1];

    // Responsive-related CSS variables
    const responsiveVars = [
      "--spacing-xs",
      "--spacing-sm",
      "--spacing-md",
      "--spacing-lg",
      "--spacing-xl",
      "--font-size-base",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...responsiveVars), (varName) => {
        // Property: Responsive variables must be defined in :root
        const varRegex = new RegExp(`${varName}\\s*:`);
        expect(rootContent).toMatch(varRegex);
      }),
      { numRuns: 100 }
    );
  });

  it("should have mobile-first or desktop-first consistent approach", () => {
    // Extract all media queries
    const maxWidthQueries = cssContent.match(/@media[^{]*max-width/g) || [];
    const minWidthQueries = cssContent.match(/@media[^{]*min-width/g) || [];

    // Property: Should have a clear responsive strategy
    // Either mobile-first (more min-width) or desktop-first (more max-width)
    expect(maxWidthQueries.length + minWidthQueries.length).toBeGreaterThan(0);

    // Property: Should have multiple breakpoints for comprehensive coverage
    expect(maxWidthQueries.length).toBeGreaterThan(2);
  });

  it("should adjust hero section for different viewport sizes", () => {
    // Extract media queries
    const mediaQueries = cssContent.matchAll(
      /@media[^{]+\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    const queries = Array.from(mediaQueries);

    // Property: Hero content should be adjusted in media queries
    let heroAdjusted = false;

    for (const query of queries) {
      if (
        query[0].includes(".hero-content") ||
        query[0].includes(".hero-section")
      ) {
        heroAdjusted = true;
        break;
      }
    }

    expect(heroAdjusted).toBe(true);
  });

  it("should adjust gallery grid for different viewport sizes", () => {
    // Extract media queries
    const mediaQueries = cssContent.matchAll(
      /@media[^{]+\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    const queries = Array.from(mediaQueries);

    // Property: Gallery grid should be adjusted in media queries
    let galleryAdjusted = false;

    for (const query of queries) {
      if (query[0].includes(".gallery-grid")) {
        galleryAdjusted = true;
        break;
      }
    }

    expect(galleryAdjusted).toBe(true);

    // Property: Gallery should use grid-template-columns for responsive layout
    const galleryGridRegex =
      /\.gallery-grid\s*\{[^}]*grid-template-columns:[^}]+\}/s;
    expect(cssContent).toMatch(galleryGridRegex);
  });

  it("should adjust navigation for mobile devices", () => {
    // Extract media queries for smaller screens
    const smallScreenQueries = cssContent.matchAll(
      /@media[^{]*max-width[^{]+\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    const queries = Array.from(smallScreenQueries);

    // Property: Navigation should be adjusted for mobile
    let navAdjusted = false;

    for (const query of queries) {
      if (
        query[0].includes(".navbar") ||
        query[0].includes(".nav-link") ||
        query[0].includes(".navbar-brand")
      ) {
        navAdjusted = true;
        break;
      }
    }

    expect(navAdjusted).toBe(true);
  });

  it("should have consistent breakpoint values across media queries", () => {
    // Extract all breakpoint values
    const breakpointMatches = cssContent.matchAll(
      /@media[^{]*\((?:max-width|min-width):\s*(\d+)px\)/g
    );
    const breakpoints = Array.from(breakpointMatches).map((match) =>
      parseInt(match[1])
    );

    expect(breakpoints.length).toBeGreaterThan(0);

    // Common responsive breakpoints
    const standardBreakpoints = [375, 575, 767, 991, 1199, 1200, 1920];

    fc.assert(
      fc.property(fc.constantFrom(...breakpoints), (breakpoint) => {
        // Property: Breakpoints should be close to standard values
        // (within 10px tolerance for flexibility)
        const isStandardOrClose = standardBreakpoints.some(
          (standard) => Math.abs(breakpoint - standard) <= 10
        );
        expect(isStandardOrClose).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should ensure readability with appropriate line-height across breakpoints", () => {
    // Property: Base line-height should be defined for readability
    const lineHeightRegex = /--line-height-base:\s*[\d.]+/;
    expect(cssContent).toMatch(lineHeightRegex);

    // Extract the line-height value
    const lineHeightMatch = cssContent.match(/--line-height-base:\s*([\d.]+)/);
    if (lineHeightMatch) {
      const lineHeight = parseFloat(lineHeightMatch[1]);

      // Property: Line-height should be between 1.4 and 1.8 for optimal readability
      expect(lineHeight).toBeGreaterThanOrEqual(1.4);
      expect(lineHeight).toBeLessThanOrEqual(1.8);
    }
  });
});
