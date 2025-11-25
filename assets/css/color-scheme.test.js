/**
 * Property-Based Tests for Color Scheme Flexibility
 * **Feature: tozan-pilgrimage-website, Property 4: Color Scheme Flexibility**
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "fs";
import { join } from "path";

describe("Property 4: Color Scheme Flexibility", () => {
  let cssContent;

  beforeEach(() => {
    // Load the actual CSS file
    cssContent = readFileSync(
      join(process.cwd(), "assets/css/style.css"),
      "utf-8"
    );
  });

  /**
   * **Validates: Requirements 10.5**
   *
   * Property: For any color value used in the website styling, the color SHALL
   * be defined using CSS custom properties (variables) rather than hardcoded
   * values, enabling future color scheme modifications without structural changes.
   *
   * This property verifies that:
   * 1. All color-related CSS properties use var() syntax
   * 2. No hardcoded color values exist in component styles
   * 3. All color variables are defined in :root
   */

  it("should define all color variables in :root", () => {
    // Extract :root section
    const rootMatch = cssContent.match(/:root\s*{([^}]+)}/s);
    expect(rootMatch).toBeTruthy();

    const rootContent = rootMatch[1];

    // Required color variables
    const requiredColorVars = [
      "--primary-color",
      "--secondary-color",
      "--accent-color",
      "--background-color",
      "--text-color",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...requiredColorVars), (colorVar) => {
        // Property: Each required color variable must be defined in :root
        const varRegex = new RegExp(`${colorVar}\\s*:`);
        expect(rootContent).toMatch(varRegex);
      }),
      { numRuns: 100 }
    );
  });

  it("should use CSS custom properties for all color values in component styles", () => {
    // Extract all CSS outside of :root
    const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]+}/s, "");

    // Find all color-related properties
    const colorProperties = [
      "color",
      "background-color",
      "border-color",
      "box-shadow",
    ];

    // Extract all property declarations
    const propertyMatches = cssWithoutRoot.matchAll(
      /(color|background-color|border-color):\s*([^;]+);/g
    );
    const declarations = Array.from(propertyMatches);

    // If there are color declarations, test them
    if (declarations.length > 0) {
      fc.assert(
        fc.property(fc.constantFrom(...declarations), (match) => {
          const property = match[1];
          const value = match[2].trim();

          // Property: Color values should use var() or be transparent/inherit/currentColor
          const isValidValue =
            value.includes("var(") ||
            value === "transparent" ||
            value === "inherit" ||
            value === "currentColor" ||
            (value.includes("rgba") && value.includes("var(")); // Allow rgba with var()

          expect(isValidValue).toBe(true);
        }),
        { numRuns: 100 }
      );
    }
  });

  it("should not have hardcoded hex color values in component styles", () => {
    // Extract all CSS outside of :root
    const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]+}/s, "");

    // Find all hex color patterns (#xxx or #xxxxxx)
    const hexColorMatches = cssWithoutRoot.matchAll(/#[0-9a-fA-F]{3,6}/g);
    const hexColors = Array.from(hexColorMatches);

    // Property: No hardcoded hex colors should exist outside :root
    expect(hexColors.length).toBe(0);
  });

  it("should not have hardcoded rgb/rgba color values in component styles", () => {
    // Extract all CSS outside of :root
    const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]+}/s, "");

    // Find rgb/rgba patterns that don't use var()
    const rgbMatches = cssWithoutRoot.matchAll(
      /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g
    );
    const rgbColors = Array.from(rgbMatches);

    // Property: No hardcoded rgb/rgba colors should exist outside :root
    // (unless they're using var() inside, which is allowed)
    expect(rgbColors.length).toBe(0);
  });

  it("should use var() syntax for all color references", () => {
    // Extract all CSS rules outside :root
    const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]+}/s, "");

    // Find all color-related property declarations
    const colorPropertyMatches = cssWithoutRoot.matchAll(
      /(color|background-color|border-color):\s*([^;]+);/g
    );
    const colorDeclarations = Array.from(colorPropertyMatches);

    if (colorDeclarations.length > 0) {
      fc.assert(
        fc.property(fc.constantFrom(...colorDeclarations), (match) => {
          const value = match[2].trim();

          // Property: If it's a color value (not transparent/inherit/currentColor),
          // it must use var() syntax
          if (
            value !== "transparent" &&
            value !== "inherit" &&
            value !== "currentColor" &&
            !value.includes("!important")
          ) {
            expect(value).toMatch(/var\(--[a-z-]+\)/);
          }
        }),
        { numRuns: 100 }
      );
    }
  });

  it("should have consistent variable naming convention", () => {
    // Extract :root section
    const rootMatch = cssContent.match(/:root\s*{([^}]+)}/s);
    const rootContent = rootMatch[1];

    // Extract all variable names
    const varMatches = rootContent.matchAll(/--([a-z0-9-]+):/g);
    const varNames = Array.from(varMatches).map((match) => match[1]);

    expect(varNames.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...varNames), (varName) => {
        // Property: All variable names should use kebab-case (lowercase with hyphens)
        expect(varName).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);

        // Property: Color variables should end with '-color' suffix
        if (
          varName.includes("primary") ||
          varName.includes("secondary") ||
          varName.includes("accent") ||
          varName.includes("background") ||
          varName.includes("text") ||
          varName.includes("overlay") ||
          varName.includes("shadow")
        ) {
          expect(varName).toMatch(/color$/);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should allow easy color scheme modifications through :root variables", () => {
    // Extract :root section
    const rootMatch = cssContent.match(/:root\s*{([^}]+)}/s);
    expect(rootMatch).toBeTruthy();

    const rootContent = rootMatch[1];

    // Core color variables that enable theme switching
    const coreColorVars = [
      "--primary-color",
      "--secondary-color",
      "--accent-color",
      "--background-color",
      "--text-color",
    ];

    // Property: All core color variables must be defined in one place (:root)
    // This enables easy theme switching by only modifying :root
    fc.assert(
      fc.property(fc.constantFrom(...coreColorVars), (colorVar) => {
        const varRegex = new RegExp(`${colorVar}\\s*:`);
        expect(rootContent).toMatch(varRegex);

        // Verify the variable is not redefined elsewhere
        const cssWithoutRoot = cssContent.replace(/:root\s*{[^}]+}/s, "");
        const redefinitionRegex = new RegExp(`${colorVar}\\s*:`, "g");
        const redefinitions = cssWithoutRoot.match(redefinitionRegex);
        expect(redefinitions).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
