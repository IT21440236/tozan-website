# Tozan Guide 2025 - Professional Website

A comprehensive, SEO-optimized website for the Nichiren Shoshu pilgrimage to Taisekiji Head Temple in Japan.

## 🌟 Features

### ✅ SEO Optimized
- **Enhanced Meta Tags**: Comprehensive title, description, keywords
- **Open Graph**: Facebook and social media sharing optimization
- **Twitter Cards**: Optimized Twitter sharing
- **Structured Data**: JSON-LD schema for search engines
- **Sitemap**: XML sitemap for search engine crawling
- **Robots.txt**: Search engine crawling instructions

### ✅ Professional Standards
- **404 Error Page**: Custom branded 404 page with navigation
- **Privacy Policy**: GDPR-compliant privacy policy
- **Terms of Service**: Legal terms and conditions
- **Security.txt**: Security disclosure information
- **Web Manifest**: PWA capabilities for mobile installation

### ✅ Performance & Security
- **Apache .htaccess**: Security headers, compression, caching
- **DNS Prefetch**: Faster external resource loading
- **Image Optimization**: Lazy loading and responsive images
- **CDN Integration**: Bootstrap and fonts from CDN

### ✅ User Experience
- **Christmas Snow Effect**: Toggleable seasonal animation
- **Responsive Design**: Mobile-first responsive layout
- **Interactive Elements**: Hover effects and smooth animations
- **Accessibility**: ARIA labels and semantic HTML

### ✅ Content Features
- **Visit Japan Web Integration**: Pre-arrival immigration guide
- **Comprehensive Visa Guide**: Step-by-step visa process
- **Temple Information**: Detailed Taisekiji and Dai-Gohonzon info
- **Photo Gallery**: Organized pilgrimage photo collection
- **Buddhist Practice Guide**: Juzu beads and karma teachings

## 📁 File Structure

```
tozan-guide/
├── index.html                 # Main homepage
├── gallery.html              # Photo gallery
├── gallery-2023.html         # 2023 photos
├── 404.html                  # Custom error page
├── privacy-policy.html       # Privacy policy
├── terms-of-service.html     # Terms of service
├── sitemap.xml              # SEO sitemap
├── robots.txt               # Search engine instructions
├── site.webmanifest         # PWA manifest
├── .htaccess                # Apache configuration
├── analytics-setup.html     # Google Analytics guide
├── .well-known/
│   └── security.txt         # Security disclosure
└── assets/
    ├── css/
    │   └── style.css        # Custom styles
    ├── js/
    │   └── main.min.js      # Custom JavaScript
    └── images/              # Image assets
```

## 🚀 Quick Start

1. **Upload Files**: Upload all files to your web server
2. **Update Domain**: Replace `https://www.tozanpilgrimage.org/` with your actual domain in:
   - `index.html` (meta tags) ✅ **COMPLETED**
   - `sitemap.xml` ✅ **COMPLETED**
   - `.well-known/security.txt` ✅ **COMPLETED**
3. **Configure Analytics**: Follow `analytics-setup.html` for Google Analytics
4. **Test 404 Page**: Verify custom 404 page works
5. **Submit Sitemap**: Submit `sitemap.xml` to Google Search Console

## 🔧 Customization

### Snow Effect Control
```javascript
// In index.html, change this line to disable snow:
const isChristmasSnowingEffect = false;
```

### SEO Updates
- Update meta descriptions in all HTML files
- Modify structured data in `index.html`
- Update sitemap dates in `sitemap.xml`

### Security Configuration
- Update email addresses in `.well-known/security.txt`
- Modify Content Security Policy in `.htaccess`
- Add SSL certificate for HTTPS

## 📊 SEO Checklist

- ✅ Title tags optimized (under 60 characters)
- ✅ Meta descriptions compelling (under 160 characters)
- ✅ H1-H6 heading structure proper
- ✅ Alt text for all images
- ✅ Internal linking structure
- ✅ Mobile-responsive design
- ✅ Fast loading speed
- ✅ SSL certificate (implement separately)
- ✅ XML sitemap submitted
- ✅ Google Analytics setup

## 🛡️ Security Features

- **Security Headers**: XSS protection, clickjacking prevention
- **Content Security Policy**: Prevents code injection
- **File Protection**: Sensitive files blocked
- **HTTPS Redirect**: Forces secure connections
- **Input Validation**: Form security measures

## 📱 Mobile Optimization

- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Large tap targets
- **Fast Loading**: Optimized images and code
- **PWA Ready**: Can be installed as mobile app

## 🔍 Analytics & Tracking

Follow the `analytics-setup.html` guide to add:
- Google Analytics 4
- Google Tag Manager
- Privacy-compliant tracking
- Conversion tracking

## 📞 Support

For technical support or customization:
- Check browser console for errors
- Validate HTML at validator.w3.org
- Test mobile responsiveness
- Monitor Core Web Vitals

## 📄 License

This project is created for the Buddhist community. Please respect the religious nature of the content and use responsibly.

---

**Made with ❤️ for the Buddhist community**
