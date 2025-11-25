# Tozan 2025 November - Pilgrimage Website

A static website dedicated to the Tozan pilgrimage - a Nichiren Shoshu pilgrimage to the Head Temple, Taisekiji, at the foot of Mt. Fuji in Japan. This website provides comprehensive information about the pilgrimage, visa process, and showcases photos and videos from the Tozan 2025 November group.

## 🌟 Features

- **Single-Page Design**: All content accessible on one scrollable page with smooth navigation
- **Responsive Layout**: Optimized for all devices (desktop, tablet, mobile)
- **Media Gallery**: Interactive photo and video gallery with lightbox functionality
- **Visa Guide**: Step-by-step visa application process with document checklist
- **Performance Optimized**: Lazy loading, minified assets, and optimized images
- **Automated Deployment**: GitHub Actions workflow for seamless deployment to GitHub Pages

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (v16 or higher) - only required for running tests
- Git

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/tozan-website.git
   cd tozan-website
   ```

2. **Open the website**

   Simply open `index.html` in your web browser:

   ```bash
   # On macOS
   open index.html

   # On Windows
   start index.html

   # On Linux
   xdg-open index.html
   ```

   Or use a local development server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js http-server (install with: npm install -g http-server)
   http-server
   ```

3. **View the website**

   Navigate to `http://localhost:8000` in your browser

### Running Tests

Install dependencies and run the test suite:

```bash
npm install
npm test
```

## 📁 Project Structure

```
tozan-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── assets/
│   ├── css/
│   │   ├── style.css           # Main stylesheet with CSS custom properties
│   │   └── style.min.css       # Minified CSS for production
│   ├── js/
│   │   ├── main.js             # Custom JavaScript functionality
│   │   └── main.min.js         # Minified JavaScript for production
│   ├── images/
│   │   ├── gallery/            # Gallery photos
│   │   ├── hero-bg.jpg         # Hero section background
│   │   └── ...
│   └── videos/
│       └── ...                 # Gallery videos
├── index.html                   # Main HTML file
├── package.json                 # Node.js dependencies and scripts
├── vitest.config.js            # Test configuration
└── README.md                    # This file
```

## 🎨 Customization

### Changing Colors

The website uses CSS custom properties for easy color customization. Edit the `:root` section in `assets/css/style.css`:

```css
:root {
  --primary-color: #6b8e23; /* Olive green */
  --secondary-color: #8b7355; /* Brown tone */
  --accent-color: #d4af37; /* Gold accent */
  --background-color: #ffffff;
  --text-color: #333333;
}
```

### Adding Content

- **Text Content**: Edit the HTML directly in `index.html`
- **Images**: Add images to `assets/images/gallery/` and update the gallery section
- **Videos**: Add videos to `assets/videos/` and update the gallery section

### Modifying Sections

The website is organized into distinct sections with IDs:

- `#home` - Hero section
- `#about` - About Tozan
- `#temple` - Taisekiji & Dai-Gohonzon
- `#details` - Pilgrimage Details
- `#gallery` - Media Gallery
- `#visa` - Visa Information

## 🚢 Deployment

### GitHub Pages (Automated)

The website automatically deploys to GitHub Pages when you push to the `main` branch.

1. **Enable GitHub Pages**

   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - Ensure HTTPS is enabled

2. **Push your changes**

   ```bash
   git add .
   git commit -m "Update website content"
   git push origin main
   ```

3. **Monitor deployment**
   - Check the Actions tab in your repository
   - Once complete, your site will be live at `https://yourusername.github.io/tozan-website/`

### Manual Deployment

To deploy to any static hosting service:

1. Upload all files to your hosting provider
2. Ensure the root directory contains `index.html`
3. Configure your hosting to serve `index.html` as the default page

## 🧪 Testing

The project includes property-based tests and unit tests:

- **Property Tests**: Verify universal properties across all inputs
- **Unit Tests**: Test specific functionality and edge cases

Run tests with:

```bash
npm test
```

Test files are located in:

- `assets/css/*.test.js` - CSS and responsive design tests
- `assets/js/*.test.js` - JavaScript functionality tests

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid, Flexbox, and Custom Properties
- **JavaScript (ES6+)**: Interactive features
- **Bootstrap 5**: Responsive framework
- **GLightbox**: Lightbox for image gallery
- **GitHub Actions**: CI/CD pipeline
- **Vitest**: Testing framework
- **fast-check**: Property-based testing library

## 📝 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Credits

- **Design Inspiration**: Based on reference images provided by the Tozan 2025 November group
- **Content**: Tozan 2025 November pilgrimage group
- **Framework**: Bootstrap 5
- **Lightbox**: GLightbox by biati-digital
- **Icons**: Bootstrap Icons

## 📧 Contact

For questions or support regarding the pilgrimage:

- Email: info@tozan2025.example.com
- Official Site: [Nichiren Shoshu](https://www.nichirenshoshu.or.jp/eng/)

## 🙏 Acknowledgments

Special thanks to all members of the Tozan 2025 November group and the organizers who made this pilgrimage possible.

---

**Note**: This is a static website project. No server-side processing or database is required.
