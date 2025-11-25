/**
 * Property-Based Test for Asset Optimization
 * **Feature: tozan-pilgrimage-website, Property 1: Asset Optimization**
 * **Validates: Requirements 3.4, 7.1, 7.2**
 *
 * Property: For any media file (image or video) in the gallery, the file SHALL have
 * appropriate optimization attributes (lazy loading for images, proper dimensions,
 * reasonable file size) to ensure efficient web delivery.
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";

describe("Property 1: Asset Optimization", () => {
  let dom;
  let document;

  beforeAll(() => {
    const html = readFileSync("index.html", "utf-8");
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  it("should have lazy loading attributes on all gallery images", () => {
    const galleryImages = document.querySelectorAll(
      ".gallery-item[data-type='photo'] img"
    );

    expect(galleryImages.length).toBeGreaterThan(0);

    galleryImages.forEach((img) => {
      expect(img.getAttribute("loading")).toBe("lazy");
    });
  });

  it("should have proper dimensions (width and height) on all gallery images", () => {
    const galleryImages = document.querySelectorAll(
      ".gallery-item[data-type='photo'] img"
    );

    expect(galleryImages.length).toBeGreaterThan(0);

    galleryImages.forEach((img) => {
      const width = img.getAttribute("width");
      const height = img.getAttribute("height");

      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
      expect(parseInt(width)).toBeGreaterThan(0);
      expect(parseInt(height)).toBeGreaterThan(0);
    });
  });

  it("should have proper dimensions (width and height) on all gallery videos", () => {
    const galleryVideos = document.querySelectorAll(
      ".gallery-item[data-type='video'] video"
    );

    expect(galleryVideos.length).toBeGreaterThan(0);

    galleryVideos.forEach((video) => {
      const width = video.getAttribute("width");
      const height = video.getAttribute("height");

      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
      expect(parseInt(width)).toBeGreaterThan(0);
      expect(parseInt(height)).toBeGreaterThan(0);
    });
  });

  it("should have preload='metadata' on all gallery videos for optimization", () => {
    const galleryVideos = document.querySelectorAll(
      ".gallery-item[data-type='video'] video"
    );

    expect(galleryVideos.length).toBeGreaterThan(0);

    galleryVideos.forEach((video) => {
      expect(video.getAttribute("preload")).toBe("metadata");
    });
  });

  it("should have poster images for all gallery videos", () => {
    const galleryVideos = document.querySelectorAll(
      ".gallery-item[data-type='video'] video"
    );

    expect(galleryVideos.length).toBeGreaterThan(0);

    galleryVideos.forEach((video) => {
      const poster = video.getAttribute("poster");
      expect(poster).toBeTruthy();
      expect(poster.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property-based test: For any media element in the gallery,
   * it must have optimization attributes
   */
  it("property: all gallery media elements have optimization attributes", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllGalleryMediaElements()),
        (element) => {
          const { type, element: mediaElement } = element;

          if (type === "image") {
            // Images must have lazy loading
            expect(mediaElement.getAttribute("loading")).toBe("lazy");

            // Images must have dimensions
            const width = mediaElement.getAttribute("width");
            const height = mediaElement.getAttribute("height");
            expect(width).toBeTruthy();
            expect(height).toBeTruthy();
            expect(parseInt(width)).toBeGreaterThan(0);
            expect(parseInt(height)).toBeGreaterThan(0);

            // Images must have alt text for accessibility
            const alt = mediaElement.getAttribute("alt");
            expect(alt).toBeTruthy();
          } else if (type === "video") {
            // Videos must have dimensions
            const width = mediaElement.getAttribute("width");
            const height = mediaElement.getAttribute("height");
            expect(width).toBeTruthy();
            expect(height).toBeTruthy();
            expect(parseInt(width)).toBeGreaterThan(0);
            expect(parseInt(height)).toBeGreaterThan(0);

            // Videos must have preload metadata
            expect(mediaElement.getAttribute("preload")).toBe("metadata");

            // Videos must have poster images
            const poster = mediaElement.getAttribute("poster");
            expect(poster).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Helper function to get all gallery media elements
   */
  function getAllGalleryMediaElements() {
    const images = Array.from(
      document.querySelectorAll(".gallery-item[data-type='photo'] img")
    ).map((img) => ({ type: "image", element: img }));

    const videos = Array.from(
      document.querySelectorAll(".gallery-item[data-type='video'] video")
    ).map((video) => ({ type: "video", element: video }));

    return [...images, ...videos];
  }
});
