# 🚀 Astro Rank & Rent Template with Keystatic CMS

A professional, SEO-optimized template for creating Rank & Rent local business websites using Astro and Keystatic CMS. Perfect for quickly deploying high-quality local service business sites.

## ✨ Features

- **🎨 Modern Design**: Premium, responsive design optimized for local businesses
- **📝 Keystatic CMS**: Easy content management without technical knowledge
- **🔍 SEO Optimized**: Built-in SEO best practices, Schema.org markup, and sitemap
- **⚡ Lightning Fast**: Astro's static site generation for optimal performance
- **📱 Fully Responsive**: Mobile-first design that works on all devices
- **🎯 Conversion Focused**: WhatsApp integration and clear CTAs
- **🌐 Multi-Service**: Support for multiple service pages
- **📊 Analytics Ready**: Google Analytics integration with Partytown
- **🚀 Deploy Ready**: Configured for Netlify deployment

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build) v5.16.0
- **CMS**: [Keystatic](https://keystatic.com) v0.5.48
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v3.4.18
- **Deployment**: [Netlify](https://netlify.com)
- **UI Components**: React + Lucide Icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- A GitHub account
- A Netlify account (for deployment)

## 🚀 Quick Start

### 1. Clone this template

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git my-rank-rent-site
cd my-rank-rent-site
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Visit `http://localhost:4321` to see your site and `http://localhost:4321/keystatic` to access the CMS.

## 📝 Configuration

### Initial Setup

1. **Update Business Information**
   - Navigate to `/keystatic` in your browser
   - Go to "Settings" → "Business Info"
   - Update company name, contact details, and address

2. **Customize Services**
   - In Keystatic, go to "Services"
   - Edit existing services or create new ones
   - Add images and descriptions

3. **Update Homepage Content**
   - Edit hero section, about section, and testimonials
   - All editable through Keystatic CMS

### SEO Configuration

Edit the following in Keystatic:
- Meta titles and descriptions
- Business Schema.org data
- Social media links
- Google Analytics ID (optional)

## 📁 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── content/         # Keystatic content collections
│   ├── layouts/         # Page layouts
│   ├── pages/           # Site pages
│   │   ├── keystatic/   # Keystatic admin panel
│   │   └── servicios/   # Service pages
│   └── styles/          # Global styles
├── astro.config.mjs     # Astro configuration
├── keystatic.config.ts  # Keystatic CMS configuration
└── tailwind.config.mjs  # Tailwind configuration
```

## 🎨 Customization

### Colors & Branding

Edit `tailwind.config.mjs` to customize your color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Adding New Service Types

1. Create a new service in Keystatic CMS
2. Add relevant images to `/public/images/`
3. The service page will be automatically generated

## 🚀 Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build settings are already configured in `netlify.toml`
4. Deploy!

**Important**: After deployment, update your site URL in Keystatic settings for proper CMS access.

### Build Command

```bash
npm run build
```

## 📊 Built-in Features

### SEO Features
- ✅ Automatic sitemap generation
- ✅ Schema.org LocalBusiness markup
- ✅ Meta tags optimization
- ✅ Open Graph tags
- ✅ Robots.txt

### Performance Features
- ✅ Static site generation
- ✅ Optimized images
- ✅ Minimal JavaScript
- ✅ Fast page loads

### Business Features
- ✅ WhatsApp integration
- ✅ Contact forms
- ✅ Service area display
- ✅ Testimonials
- ✅ FAQ sections

## 🧞 Commands

| Command | Action |
|:--------|:-------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |

## 📝 Content Management

Access the Keystatic CMS at `/keystatic` when running locally or at `yourdomain.com/keystatic` in production.

### Content Types

- **Settings**: Global site settings and business info
- **Services**: Service pages and descriptions
- **Testimonials**: Customer reviews
- **FAQs**: Frequently asked questions
- **Pages**: Custom pages

## 🔧 Troubleshooting

### CMS not loading?
Make sure you're accessing `/keystatic` with a trailing slash and that you've run `npm install`.

### Build errors?
Clear the cache: `rm -rf .astro node_modules && npm install`

### Images not showing?
Ensure images are in `/public/images/` and referenced correctly in Keystatic.

## 📄 License

MIT License - feel free to use this template for your Rank & Rent projects!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for Rank & Rent entrepreneurs**
