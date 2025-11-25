/**
 * Unit Tests for Responsive Behavior
 * Tests responsive design at specific viewport widths
 */

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Responsive Behavior Tests", () => {
  let cssContent;
  let htmlContent;

  beforeEach(() => {
    // Load the actual CSS and HTML files
    cssContent = readFileSync(
      join(process.cwd(), "assets/css/style.css"),
      "utf-8"
    );
    htmlContent = readFileSync(join(process.cwd(), "index.html"), "utf-8");
  });

  /**
   * **Validates: Requirements 4.1-4.4**
   *
   * Test responsive behavior at mobile width (375px)
   */
  it("should have appropriate styles for mobile width (375px)", () => {
    // Check for mobile-specific media queries
    const mobileQuery = /@media[^{]*\(max-width:\s*575px\)/i;
    expect(cssContent).toMatch(mobileQuery);

    // Verify mobile-specific adjustments exist
    const mobileSection = cssContent.match(
      /@media[^{]*\(max-width:\s*575px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(mobileSection).toBeTruthy();
    expect(mobileSection.length).toBeGreaterThan(0);

    // Check for font-size adjustments for mobile
    const mobileFontSizeAdjustments = mobileSection[0].match(/font-size:/g);
    expect(mobileFontSizeAdjustments).toBeTruthy();
    expect(mobileFontSizeAdjustments.length).toBeGreaterThan(0);

    // Check for padding/spacing adjustments for mobile
    const mobileSpacingAdjustments =
      mobileSection[0].match(/(padding|margin):/g);
    expect(mobileSpacingAdjustments).toBeTruthy();
    expect(mobileSpacingAdjustments.length).toBeGreaterThan(0);
  });

  /**
   * **Validates: Requirements 4.1-4.4**
   *
   * Test responsive behavior at tablet width (768px)
   */
  it("should have appropriate styles for tablet width (768px)", () => {
    // Check for tablet-specific media queries
    const tabletQuery = /@media[^{]*\(max-width:\s*767px\)/i;
    expect(cssContent).toMatch(tabletQuery);

    // Verify tablet-specific adjustments exist
    const tabletSection = cssContent.match(
      /@media[^{]*\(max-width:\s*767px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(tabletSection).toBeTruthy();
    expect(tabletSection.length).toBeGreaterThan(0);

    // Check for gallery grid adjustments (should be 1 column on tablet)
    const galleryGridAdjustment = tabletSection[0].match(
      /\.gallery-grid[^}]*grid-template-columns:\s*1fr/
    );
    expect(galleryGridAdjustment).toBeTruthy();

    // Check for section title size adjustments
    const sectionTitleAdjustment = tabletSection[0].match(
      /\.section-title[^}]*font-size:/
    );
    expect(sectionTitleAdjustment).toBeTruthy();
  });

  /**
   * **Validates: Requirements 4.1-4.4**
   *
   * Test responsive behavior at desktop width (1920px)
   */
  it("should have appropriate styles for desktop width (1920px)", () => {
    // Check for large desktop media queries
    const desktopQuery = /@media[^{]*\(min-width:\s*1920px\)/i;
    expect(cssContent).toMatch(desktopQuery);

    // Verify desktop-specific adjustments exist
    const desktopSection = cssContent.match(
      /@media[^{]*\(min-width:\s*1920px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(desktopSection).toBeTruthy();
    expect(desktopSection.length).toBeGreaterThan(0);

    // Check for container max-width adjustments
    const containerAdjustment = desktopSection[0].match(
      /\.container[^}]*max-width:/
    );
    expect(containerAdjustment).toBeTruthy();

    // Check for hero content adjustments
    const heroAdjustment = desktopSection[0].match(/\.hero-content[^}]*h1/);
    expect(heroAdjustment).toBeTruthy();
  });

  /**
   * **Validates: Requirements 4.1-4.4**
   *
   * Verify no horizontal scrolling prevention
   */
  it("should prevent horizontal scrolling on all screen sizes", () => {
    // Check for overflow-x: hidden on body
    const bodyOverflow = cssContent.match(
      /body\s*\{[^}]*overflow-x:\s*hidden/s
    );
    expect(bodyOverflow).toBeTruthy();

    // Check for max-width: 100% on images
    const imgMaxWidth = cssContent.match(/img\s*\{[^}]*max-width:\s*100%/s);
    expect(imgMaxWidth).toBeTruthy();

    // Check for max-width: 100% on videos
    const videoMaxWidth = cssContent.match(/video\s*\{[^}]*max-width:\s*100%/s);
    expect(videoMaxWidth).toBeTruthy();

    // Check for overflow-x: hidden on containers
    const containerOverflow = cssContent.match(
      /\.container[^}]*overflow-x:\s*hidden/s
    );
    expect(containerOverflow).toBeTruthy();
  });

  /**
   * Test that gallery grid changes columns based on viewport
   */
  it("should adjust gallery grid columns for different viewports", () => {
    // Desktop: 3 columns
    const desktopGallery = cssContent.match(
      /\.gallery-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/s
    );
    expect(desktopGallery).toBeTruthy();

    // Tablet: 2 columns (at 991px breakpoint)
    const tabletGallerySection = cssContent.match(
      /@media[^{]*\(max-width:\s*991px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    if (tabletGallerySection) {
      const tabletGallery = tabletGallerySection[0].match(
        /\.gallery-grid[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/
      );
      expect(tabletGallery).toBeTruthy();
    }

    // Mobile: 1 column (at 767px breakpoint)
    const mobileGallerySection = cssContent.match(
      /@media[^{]*\(max-width:\s*767px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    if (mobileGallerySection) {
      const mobileGallery = mobileGallerySection[0].match(
        /\.gallery-grid[^}]*grid-template-columns:\s*1fr/
      );
      expect(mobileGallery).toBeTruthy();
    }
  });

  /**
   * Test that hero section adjusts for mobile
   */
  it("should adjust hero section for mobile devices", () => {
    // Check for hero content h1 size reduction on mobile
    const mobileHeroSection = cssContent.match(
      /@media[^{]*\(max-width:\s*575px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(mobileHeroSection).toBeTruthy();

    const heroH1Adjustment = mobileHeroSection[0].match(
      /\.hero-content\s+h1[^}]*font-size:/
    );
    expect(heroH1Adjustment).toBeTruthy();

    // Check for hero background-attachment change on mobile (in 767px breakpoint)
    const tabletHeroSection = cssContent.match(
      /@media[^{]*\(max-width:\s*767px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(tabletHeroSection).toBeTruthy();

    const heroAttachment = tabletHeroSection[0].match(
      /\.hero-section[^}]*background-attachment:\s*scroll/
    );
    expect(heroAttachment).toBeTruthy();
  });

  /**
   * Test that navigation adjusts for mobile
   */
  it("should adjust navigation for mobile devices", () => {
    // Check for navbar brand size adjustment
    const mobileNavSection = cssContent.match(
      /@media[^{]*\(max-width:\s*575px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(mobileNavSection).toBeTruthy();

    const navBrandAdjustment = mobileNavSection[0].match(
      /\.navbar-brand[^}]*font-size:/
    );
    expect(navBrandAdjustment).toBeTruthy();
  });

  /**
   * Test that visa timeline adjusts for mobile
   */
  it("should adjust visa timeline for mobile devices", () => {
    // Check for visa timeline adjustments on mobile
    const mobileVisaSection = cssContent.match(
      /@media[^{]*\(max-width:\s*575px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(mobileVisaSection).toBeTruthy();

    // Check for step number size reduction
    const stepNumberAdjustment = mobileVisaSection[0].match(
      /\.step-number[^}]*width:\s*40px/
    );
    expect(stepNumberAdjustment).toBeTruthy();

    // Check for timeline line position adjustment
    const timelineAdjustment = mobileVisaSection[0].match(
      /\.visa-timeline::before[^}]*left:\s*20px/
    );
    expect(timelineAdjustment).toBeTruthy();
  });

  /**
   * Test that spacing scales appropriately
   */
  it("should scale spacing appropriately for smaller screens", () => {
    // Check that content sections have reduced padding on mobile
    const mobileSpacingSection = cssContent.match(
      /@media[^{]*\(max-width:\s*575px\)[^{]*\{([^}]+\{[^}]+\})+[^}]*\}/gs
    );
    expect(mobileSpacingSection).toBeTruthy();

    const contentSectionPadding = mobileSpacingSection[0].match(
      /\.content-section[^}]*padding:/
    );
    expect(contentSectionPadding).toBeTruthy();
  });

  /**
   * Test that HTML has proper viewport meta tag
   */
  it("should have proper viewport meta tag in HTML", () => {
    // Check for viewport meta tag using regex
    const viewportMetaRegex =
      /<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*"/i;
    expect(htmlContent).toMatch(viewportMetaRegex);

    // Check for initial-scale
    const initialScaleRegex =
      /<meta\s+name="viewport"\s+content="[^"]*initial-scale=1\.0[^"]*"/i;
    expect(htmlContent).toMatch(initialScaleRegex);
  });

  /**
   * Test that Bootstrap responsive classes are used
   */
  it("should use Bootstrap responsive classes in HTML", () => {
    // Check for responsive column classes
    const colClassRegex = /class="[^"]*col-(?:md-|lg-)?[0-9]+/;
    expect(htmlContent).toMatch(colClassRegex);

    // Check for responsive margin/padding utilities
    const spacingUtilityRegex = /class="[^"]*(?:mb-|mt-|p-|m-)[0-9]+/;
    expect(htmlContent).toMatch(spacingUtilityRegex);

    // Check for Bootstrap container class (core responsive element)
    const containerRegex = /class="[^"]*container[^"]*"/;
    expect(htmlContent).toMatch(containerRegex);
  });

  /**
   * Test that all sections are present and properly structured
   */
  it("should have all required sections with proper IDs", () => {
    const requiredSections = [
      "home",
      "about",
      "temple",
      "details",
      "gallery",
      "visa",
    ];

    requiredSections.forEach((sectionId) => {
      const sectionRegex = new RegExp(`id="${sectionId}"`, "i");
      expect(htmlContent).toMatch(sectionRegex);
    });
  });
});
