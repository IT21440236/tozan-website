# Design Document

## Overview

The Tozan Pilgrimage Website is a single-page static website that provides comprehensive information about the Nichiren Shoshu pilgrimage to Taisekiji. The site will feature a modern, responsive design inspired by the reference images, with smooth scrolling navigation between sections. Content will include pilgrimage details, visa information, and a media gallery showcasing photos and videos from the Tozan 2025 November group.

The website will be built using modern web technologies with a focus on simplicity, performance, and maintainability. It will be deployed automatically via GitHub Actions to a static hosting platform.

## Architecture

### Technology Stack

- **HTML5**: Semantic markup for content structure
- **CSS3**: Styling with modern features (Grid, Flexbox, Custom Properties)
- **JavaScript (ES6+)**: Interactive features and smooth scrolling
- **Bootstrap 5**: Responsive framework for layout and components
- **GitHub Actions**: CI/CD pipeline for automated builds and deployment
- **GitHub Pages**: Static hosting platform (free, reliable, HTTPS support)

### Single-Page Architecture

The website follows a single-page application (SPA) pattern where all content is loaded on initial page load and organized into distinct sections:

1. **Hero Section**: Eye-catching introduction with background image
2. **About Tozan Section**: Information about the pilgrimage and its significance
3. **Taisekiji & Dai-Gohonzon Section**: Details about the Head Temple and object of worship
4. **Pilgrimage Details Section**: What to expect during the pilgrimage
5. **Media Gallery Section**: Photos and videos from Tozan 2025 November group
6. **Visa Information Section**: Comprehensive visa process guide
7. **Footer Section**: Contact information and additional links

Navigation will be handled through anchor links that trigger smooth scrolling to section IDs.

## Components and Interfaces

### 1. Navigation Component

**Purpose**: Provide quick access to different sections of the page

**Features**:

- Fixed/sticky navigation bar at the top
- Logo/title on the left
- Navigation links on the right
- Hamburger menu for mobile devices
- Active section highlighting
- Smooth scroll behavior

**Interface**:

```html
<nav class="navbar navbar-expand-lg navbar-light fixed-top">
  <div class="container">
    <a class="navbar-brand" href="#home">Tozan 2025</a>
    <button class="navbar-toggler">...</button>
    <div class="navbar-collapse">
      <ul class="navbar-nav">
        <li><a href="#about">About</a></li>
        <li><a href="#temple">Temple</a></li>
        <li><a href="#details">Details</a></li>
        <li><a href="#gallery">Gallery</a></li>
        <li><a href="#visa">Visa</a></li>
      </ul>
    </div>
  </div>
</nav>
```

### 2. Hero Section Component

**Purpose**: Create an impactful first impression with key messaging

**Features**:

- Full-viewport height background image
- Overlay for text readability
- Main heading and subheading
- Call-to-action button (scroll to learn more)
- Parallax effect (optional enhancement)

**Interface**:

```html
<section id="home" class="hero-section">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1>Transforming Spaces, Enhancing Homes</h1>
    <p>Experienced & Reliable Remodelers since 1968</p>
    <a href="#about" class="btn btn-primary">Learn More</a>
  </div>
</section>
```

### 3. Content Section Component

**Purpose**: Display textual information in an organized, readable format

**Features**:

- Consistent padding and spacing
- Responsive typography
- Support for headings, paragraphs, lists
- Optional background colors for visual separation
- Image support with captions

**Interface**:

```html
<section id="about" class="content-section">
  <div class="container">
    <h2 class="section-title">About Tozan</h2>
    <div class="section-content">
      <p>...</p>
    </div>
  </div>
</section>
```

### 4. Media Gallery Component

**Purpose**: Showcase photos and videos from the pilgrimage

**Features**:

- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Lightbox for full-size image viewing
- Video player integration (HTML5 video or YouTube embed)
- Lazy loading for performance
- Filter/category options (photos vs videos)

**Interface**:

```html
<section id="gallery" class="gallery-section">
  <div class="container">
    <h2 class="section-title">Gallery</h2>
    <div class="gallery-filters">
      <button data-filter="all">All</button>
      <button data-filter="photos">Photos</button>
      <button data-filter="videos">Videos</button>
    </div>
    <div class="gallery-grid">
      <div class="gallery-item" data-type="photo">
        <img src="..." alt="..." loading="lazy" />
      </div>
      <div class="gallery-item" data-type="video">
        <video controls>...</video>
      </div>
    </div>
  </div>
</section>
```

### 5. Visa Information Component

**Purpose**: Provide step-by-step visa process guidance

**Features**:

- Timeline or step-by-step layout
- Expandable sections for detailed information
- Document checklist
- Important dates and deadlines
- Contact information for visa assistance

**Interface**:

```html
<section id="visa" class="visa-section">
  <div class="container">
    <h2 class="section-title">Visa Process</h2>
    <div class="visa-timeline">
      <div class="visa-step">
        <h3>Step 1: Gather Documents</h3>
        <ul class="document-checklist">
          <li>Passport (valid 6+ months)</li>
          <li>...</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

## Data Models

### Page Content Structure

```javascript
const pageContent = {
  hero: {
    title: "Tozan 2025 November",
    subtitle: "Pilgrimage to Taisekiji",
    backgroundImage: "path/to/hero-image.jpg"
  },
  about: {
    title: "About Tozan",
    content: "Markdown or HTML content..."
  },
  temple: {
    title: "Taisekiji & Dai-Gohonzon",
    content: "...",
    images: ["path/to/image1.jpg", ...]
  },
  gallery: {
    photos: [
      { src: "path/to/photo1.jpg", alt: "Description", caption: "..." },
      ...
    ],
    videos: [
      { src: "path/to/video1.mp4", poster: "path/to/thumbnail.jpg", caption: "..." },
      ...
    ]
  },
  visa: {
    steps: [
      { title: "Step 1", description: "...", documents: [...] },
      ...
    ]
  }
}
```

### Configuration Model

```javascript
const siteConfig = {
  title: "Tozan 2025 November",
  description: "Nichiren Shoshu Pilgrimage to Taisekiji",
  colors: {
    primary: "#6B8E23", // Olive green from reference
    secondary: "#8B7355", // Brown tone
    accent: "#D4AF37", // Gold accent
    background: "#FFFFFF",
    text: "#333333",
  },
  navigation: [
    { label: "About", href: "#about" },
    { label: "Temple", href: "#temple" },
    { label: "Details", href: "#details" },
    { label: "Gallery", href: "#gallery" },
    { label: "Visa", href: "#visa" },
  ],
};
```

##

Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Acceptance Criteria Testing Prework

1.1 WHEN a visitor accesses the website THEN the Website System SHALL display information about Nichiren Shoshu pilgrimage to Taisekiji
Thoughts: This is about ensuring specific content is present on the page. We can test that the rendered HTML contains the required text/sections about the pilgrimage.
Testable: yes - example

1.2 WHEN a visitor views pilgrimage information THEN the Website System SHALL include details about the Dai-Gohonzon and its significance
Thoughts: This is verifying that specific content about Dai-Gohonzon is present. This is a specific example test.
Testable: yes - example

1.3 WHEN a visitor navigates the site THEN the Website System SHALL present information about the Head Temple location at the foot of Mt. Fuji
Thoughts: This is checking for specific content about the temple location. This is an example test.
Testable: yes - example

1.4 WHEN a visitor accesses pilgrimage content THEN the Website System SHALL organize information in a clear and logical structure
Thoughts: "Clear and logical" is subjective and not measurable. This is a design goal.
Testable: no

2.1 WHEN a visitor navigates to visa information THEN the Website System SHALL display comprehensive visa process details
Thoughts: This is checking that visa content exists on the page. This is an example test.
Testable: yes - example

2.2 WHEN a visitor views the website content THEN the Website System SHALL position visa information at the end of the pilgrimage trip details
Thoughts: This is verifying the order of sections. We can test that the visa section appears after other content sections in the DOM.
Testable: yes - example

2.3 WHEN a visitor accesses visa content THEN the Website System SHALL present step-by-step guidance for obtaining necessary travel documents
Thoughts: This is checking for specific structured content. This is an example test.
Testable: yes - example

3.1 WHEN a visitor accesses the media gallery THEN the Website System SHALL display photos from the Tozan 2025 November group pilgrimage
Thoughts: This is verifying that photo elements exist in the gallery. This is an example test.
Testable: yes - example

3.2 WHEN a visitor views the media section THEN the Website System SHALL present videos from the Tozan 2025 November group pilgrimage
Thoughts: This is verifying that video elements exist in the gallery. This is an example test.
Testable: yes - example

3.3 WHEN a visitor interacts with media content THEN the Website System SHALL provide an intuitive interface for browsing photos and videos
Thoughts: "Intuitive" is subjective and cannot be automatically tested. This is a UX goal.
Testable: no

3.4 WHEN media files are loaded THEN the Website System SHALL optimize images and videos for web delivery without compromising quality
Thoughts: We can test that images have appropriate attributes (loading="lazy", proper dimensions) and that file sizes are within reasonable limits. This is a property about all media files.
Testable: yes - property

4.1 WHEN a visitor accesses the website on a desktop computer THEN the Website System SHALL render content optimally for large screens
Thoughts: This is testing responsive behavior at a specific viewport size. This is an example test.
Testable: yes - example

4.2 WHEN a visitor accesses the website on a laptop THEN the Website System SHALL adapt layout for medium-sized screens
Thoughts: This is testing responsive behavior at a specific viewport size. This is an example test.
Testable: yes - example

4.3 WHEN a visitor accesses the website on a tablet THEN the Website System SHALL adjust content presentation for tablet dimensions
Thoughts: This is testing responsive behavior at a specific viewport size. This is an example test.
Testable: yes - example

4.4 WHEN a visitor accesses the website on a mobile phone THEN the Website System SHALL optimize layout for small touchscreen devices
Thoughts: This is testing responsive behavior at a specific viewport size. This is an example test.
Testable: yes - example

4.5 WHEN the viewport size changes THEN the Website System SHALL respond dynamically to maintain readability and usability
Thoughts: We can test that CSS media queries are properly defined and that elements have responsive classes. This is a property about all viewport changes.
Testable: yes - property

5.1 WHEN code is pushed to the repository THEN the Website System SHALL trigger an automated build process via GitHub Actions
Thoughts: This is testing CI/CD configuration. We can verify that the workflow file exists and is properly configured.
Testable: yes - example

5.2 WHEN the build process completes successfully THEN the Website System SHALL deploy the updated static files to the hosting platform
Thoughts: This is testing deployment configuration. We can verify the workflow includes deployment steps.
Testable: yes - example

5.3 WHEN the build process encounters errors THEN the Website System SHALL report failures and prevent deployment of broken builds
Thoughts: This is testing error handling in the CI/CD pipeline. We can verify the workflow has proper error handling.
Testable: yes - example

5.4 WHEN deployment completes THEN the Website System SHALL make the updated website accessible to visitors
Thoughts: This is an end-to-end integration test that requires actual deployment. This is difficult to test in isolation.
Testable: no

6.1 WHEN the website is developed THEN the Website System SHALL utilize a modern responsive CSS framework
Thoughts: We can verify that Bootstrap (or chosen framework) is included in the project dependencies and HTML.
Testable: yes - example

6.2 WHEN styling is applied THEN the Website System SHALL maintain consistent visual design across all pages
Thoughts: Since this is a single-page site, we can test that consistent CSS classes and variables are used throughout. This is a property about all sections.
Testable: yes - property

6.3 WHEN components are implemented THEN the Website System SHALL leverage framework utilities for common UI patterns
Thoughts: We can verify that framework classes are used in the HTML. This is an example test.
Testable: yes - example

6.4 WHEN the website is viewed THEN the Website System SHALL present a visually appealing and professional design
Thoughts: "Visually appealing" is subjective and cannot be automatically tested. This is a design goal.
Testable: no

7.1 WHEN a visitor requests a page THEN the Website System SHALL deliver optimized static assets
Thoughts: We can test that assets are minified and compressed. This is a property about all assets.
Testable: yes - property

7.2 WHEN images are loaded THEN the Website System SHALL serve appropriately sized images based on device capabilities
Thoughts: We can test that images have srcset attributes or responsive image techniques. This is a property about all images.
Testable: yes - property

7.3 WHEN the website is accessed THEN the Website System SHALL minimize load times through asset optimization
Thoughts: This is a performance goal that's difficult to test with specific thresholds. We can test that optimization techniques are applied.
Testable: no

7.4 WHEN a visitor navigates between pages THEN the Website System SHALL provide smooth transitions without delays
Thoughts: Since this is a single-page site with smooth scrolling, we can test that smooth scroll CSS is applied. This is an example test.
Testable: yes - example

8.1 WHEN the website is deployed THEN the Website System SHALL be hosted on a reliable static hosting platform
Thoughts: We can verify the deployment configuration points to a hosting platform (GitHub Pages). This is an example test.
Testable: yes - example

8.2 WHEN visitors access the site THEN the Website System SHALL serve content with high availability
Thoughts: High availability is a hosting platform characteristic, not something we can test in our code.
Testable: no

8.3 WHEN the hosting platform is configured THEN the Website System SHALL support HTTPS for secure connections
Thoughts: We can verify that the site is configured to use HTTPS (GitHub Pages provides this by default). This is an example test.
Testable: yes - example

8.4 WHEN DNS is configured THEN the Website System SHALL be accessible via a custom domain name
Thoughts: This is a configuration task that depends on external DNS setup. We can verify the CNAME file exists if using custom domain.
Testable: yes - example

9.1 WHEN a visitor accesses the website THEN the Website System SHALL present all content on a single page
Thoughts: We can verify that there's only one HTML file and no multi-page navigation. This is an example test.
Testable: yes - example

9.2 WHEN a visitor scrolls through the page THEN the Website System SHALL display different sections sequentially
Thoughts: We can verify that sections are arranged in the correct order in the DOM. This is an example test.
Testable: yes - example

9.3 WHEN navigation links are clicked THEN the Website System SHALL scroll smoothly to the corresponding section on the same page
Thoughts: We can test that navigation links have proper href attributes pointing to section IDs and that smooth scroll is enabled. This is a property about all navigation links.
Testable: yes - property

9.4 WHEN the page loads THEN the Website System SHALL organize content into distinct sections without requiring page transitions
Thoughts: We can verify that content is organized into section elements with proper IDs. This is an example test.
Testable: yes - example

10.1 WHEN the website is styled THEN the Website System SHALL replicate the layout and design patterns from the reference images
Thoughts: This requires visual comparison which is difficult to automate. This is a design goal.
Testable: no

10.2 WHEN colors are applied THEN the Website System SHALL use the color scheme from the reference images as the initial palette
Thoughts: We can verify that CSS variables or specific color values are defined and used. This is an example test.
Testable: yes - example

10.3 WHEN typography is implemented THEN the Website System SHALL match the font styles and hierarchy shown in the reference images
Thoughts: We can verify that specific fonts are loaded and applied. This is an example test.
Testable: yes - example

10.4 WHEN visual elements are created THEN the Website System SHALL maintain the modern, clean aesthetic demonstrated in the reference images
Thoughts: "Modern, clean aesthetic" is subjective and cannot be automatically tested. This is a design goal.
Testable: no

10.5 WHEN the design is finalized THEN the Website System SHALL support future color scheme modifications without structural changes
Thoughts: We can test that colors are defined using CSS custom properties (variables) rather than hardcoded. This is a property about all color definitions.
Testable: yes - property

### Property Reflection

After reviewing all testable properties, I've identified the following for consolidation:

- Properties 3.4, 7.1, and 7.2 all relate to asset optimization and can be combined into a comprehensive "Asset Optimization" property
- Properties 4.5 and 6.2 both relate to responsive consistency and can be combined
- Property 9.3 is the only navigation-specific property and provides unique value

Consolidated properties:

1. Asset optimization (combines 3.4, 7.1, 7.2)
2. Responsive design consistency (combines 4.5, 6.2)
3. Navigation smooth scrolling (9.3)
4. Color scheme flexibility (10.5)

### Correctness Properties

Property 1: Asset Optimization
_For any_ media file (image or video) in the gallery, the file SHALL have appropriate optimization attributes (lazy loading for images, proper dimensions, reasonable file size) to ensure efficient web delivery.
**Validates: Requirements 3.4, 7.1, 7.2**

Property 2: Responsive Design Consistency
_For any_ viewport size change, all sections SHALL maintain consistent styling through CSS media queries and responsive framework classes, ensuring readability and usability across all device types.
**Validates: Requirements 4.5, 6.2**

Property 3: Navigation Smooth Scrolling
_For any_ navigation link in the navbar, clicking the link SHALL trigger smooth scrolling to the corresponding section ID on the same page without page transitions.
**Validates: Requirements 9.3**

Property 4: Color Scheme Flexibility
_For any_ color value used in the website styling, the color SHALL be defined using CSS custom properties (variables) rather than hardcoded values, enabling future color scheme modifications without structural changes.
**Validates: Requirements 10.5**

## Error Handling

### Build Errors

**Scenario**: HTML/CSS/JS syntax errors during build

- **Handling**: GitHub Actions workflow will fail the build and prevent deployment
- **User Feedback**: Build log will show specific error messages
- **Recovery**: Developer fixes errors and pushes corrected code

### Missing Assets

**Scenario**: Referenced images or videos don't exist

- **Handling**: Use placeholder images with alt text
- **User Feedback**: Console warnings for missing assets
- **Recovery**: Add missing assets to the repository

### Browser Compatibility

**Scenario**: Older browsers don't support modern CSS/JS features

- **Handling**: Use progressive enhancement and graceful degradation
- **Fallbacks**: Provide basic functionality for older browsers
- **Testing**: Test on major browsers (Chrome, Firefox, Safari, Edge)

### Slow Network Conditions

**Scenario**: Large media files take long to load

- **Handling**: Implement lazy loading for images and videos
- **User Feedback**: Loading indicators or skeleton screens
- **Optimization**: Compress images and use appropriate formats (WebP, AVIF)

### JavaScript Disabled

**Scenario**: User has JavaScript disabled

- **Handling**: Core content remains accessible (HTML/CSS only)
- **Degradation**: Smooth scrolling falls back to jump scrolling
- **Accessibility**: Ensure semantic HTML works without JS

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **HTML Structure Tests**

   - Verify all required sections exist with correct IDs
   - Check that navigation links point to valid section IDs
   - Validate semantic HTML structure

2. **CSS Tests**

   - Verify CSS custom properties are defined
   - Check that responsive breakpoints are configured
   - Validate framework classes are properly applied

3. **JavaScript Tests**

   - Test smooth scroll functionality
   - Verify gallery filter functionality
   - Test mobile menu toggle

4. **Build Process Tests**
   - Verify GitHub Actions workflow syntax
   - Check that deployment steps are configured
   - Validate asset optimization in build output

### Property-Based Testing

Property-based tests will verify universal properties across all inputs. We'll use a JavaScript property testing library appropriate for web testing (such as fast-check for Node.js tests, or manual property verification for static HTML).

**Configuration**: Each property test should run a minimum of 100 iterations to ensure thorough coverage.

**Test Tagging**: Each property-based test must include a comment with this format:

```javascript
// **Feature: tozan-pilgrimage-website, Property 1: Asset Optimization**
```

**Property Test Implementations**:

1. **Property 1: Asset Optimization**

   - Generate random sets of media elements
   - Verify each has lazy loading attributes
   - Check file size constraints
   - Validate proper dimensions are set

2. **Property 2: Responsive Design Consistency**

   - Generate random viewport sizes
   - Verify CSS media queries apply correctly
   - Check that all sections remain readable
   - Validate framework responsive classes are present

3. **Property 3: Navigation Smooth Scrolling**

   - For each navigation link, verify href points to valid section
   - Check smooth-scroll CSS property is applied
   - Validate no external links in main navigation

4. **Property 4: Color Scheme Flexibility**
   - Parse all CSS files
   - Verify colors use CSS custom properties
   - Check no hardcoded color values in component styles
   - Validate all color variables are defined in root

### Integration Testing

1. **End-to-End Page Load**

   - Test complete page renders without errors
   - Verify all sections are visible
   - Check navigation works correctly

2. **Responsive Behavior**

   - Test at mobile (375px), tablet (768px), and desktop (1920px) widths
   - Verify layout adapts appropriately
   - Check that no horizontal scrolling occurs

3. **Media Gallery**

   - Test image lightbox functionality
   - Verify video playback
   - Check filter buttons work correctly

4. **Deployment Pipeline**
   - Test GitHub Actions workflow executes successfully
   - Verify deployed site is accessible
   - Check HTTPS is enabled

### Manual Testing Checklist

- [ ] Visual comparison with reference images
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS and Android)
- [ ] Accessibility testing (screen readers, keyboard navigation)
- [ ] Performance testing (Lighthouse scores)
- [ ] Content proofreading

## Implementation Notes

### Recommended Tools and Libraries

1. **Bootstrap 5.3+**: Modern responsive framework with excellent documentation
2. **GLightbox or Lightbox2**: Lightweight lightbox library for image gallery
3. **AOS (Animate On Scroll)**: Optional scroll animations for visual appeal
4. **ImageOptim or Sharp**: Image optimization tools for build process
5. **HTMLMinifier, CSSNano, Terser**: Asset minification for production

### File Structure

```
tozan-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── style.css           # Custom styles
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   └── main.js             # Custom JavaScript
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   ├── gallery/
│   │   │   ├── photo1.jpg
│   │   │   └── ...
│   │   └── temple/
│   │       └── ...
│   └── videos/
│       ├── video1.mp4
│       └── ...
├── index.html                   # Main single-page HTML
├── README.md
└── CNAME                        # Optional: for custom domain

```

### Performance Optimization

1. **Image Optimization**

   - Convert images to WebP format with JPEG fallback
   - Use responsive images with srcset
   - Implement lazy loading
   - Target: < 500KB per image

2. **Code Optimization**

   - Minify HTML, CSS, and JavaScript
   - Combine and compress assets
   - Use CDN for framework files
   - Enable gzip compression

3. **Loading Strategy**
   - Critical CSS inline in <head>
   - Defer non-critical JavaScript
   - Preload hero image
   - Lazy load gallery images

### Accessibility Considerations

1. **Semantic HTML**: Use proper heading hierarchy (h1-h6)
2. **Alt Text**: Provide descriptive alt text for all images
3. **ARIA Labels**: Add labels for interactive elements
4. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
5. **Color Contrast**: Maintain WCAG AA contrast ratios (4.5:1 for text)
6. **Focus Indicators**: Visible focus states for keyboard users

### Deployment Configuration

**GitHub Actions Workflow** (.github/workflows/deploy.yml):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: "."

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Content Management

Content can be easily updated by:

1. Editing the HTML directly for text content
2. Adding images/videos to the assets folder
3. Updating CSS custom properties for color changes
4. Modifying the navigation array for section links

For future enhancement, consider:

- Using a static site generator (11ty, Hugo) for easier content management
- Implementing a headless CMS for non-technical content updates
- Adding a JSON data file for content to separate from HTML structure
