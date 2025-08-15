# Markdown-Driven Resume Project

A modern, responsive online resume that converts markdown to HTML and can be hosted on GitHub Pages.

## Project Overview

This project provides a solution for maintaining a professional resume in markdown format, converting it to HTML, and hosting it online through GitHub Pages. It includes:

- A clean HTML/CSS implementation with a responsive, mobile-first design
- Automatic conversion from markdown to HTML via a custom Node.js script
- PDF generation functionality for easy resume downloads
- Dark/light mode support via CSS media queries
- Structured, semantic markup for accessibility

## Files Included

- `index.html`: The main resume page structure
- `styles.css`: Complete styling with mobile-first responsive design
- `markdown-converter.js`: Node.js script that converts resume.md to HTML
- `pdf-generator.js`: JavaScript for generating downloadable PDFs
- `resume.md`: Markdown version of the resume (source of truth for content)
- `package.json`: NPM configuration for required dependencies

## Setup Instructions

### GitHub Pages Deployment

1. Create a new GitHub repository
2. Upload all the files in this project to your repository
3. Go to repository Settings > Pages
4. Under "Source", select "main" branch and click Save
5. Your resume will be published at `https://[your-username].github.io/[repository-name]/`

### Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Edit `resume.md` with your resume content
4. Run the converter: `npm run convert`
5. Preview locally: `npm run serve`

## How It Works

1. Write your resume in markdown format in `resume.md`
2. Run the converter script (`npm run convert`) which:
   - Reads the markdown content
   - Parses it into sections (header, experience, education, etc.)
   - Updates the appropriate sections in `index.html`
3. The HTML file maintains the structure while content is updated from markdown
4. Style the resume using CSS variables and responsive design
5. Host on GitHub Pages for a public, accessible version

## Customization

### Personalizing Content

1. Edit `resume.md` to update your personal information
2. Replace placeholder text (like `[Your Email]`) with your actual contact details
3. Run the converter (`npm run convert`) to update the HTML
4. All content should be managed in the markdown file, not directly in HTML

### Styling Changes

- The `styles.css` file uses CSS variables for easy theming
- Modify the `:root` section to change colors, fonts, and spacing
- Additional styles can be added for custom elements

### PDF Configuration

- The PDF generation is handled by `pdf-generator.js` using the html2pdf.js library
- Adjust PDF margins, format, and orientation in the `options` object
- Modify the filename in the `options.filename` property

## Additional Resources

### GitHub Pages Documentation
- [GitHub Pages Basics](https://docs.github.com/en/pages/getting-started-with-github-pages)
- [Custom Domains with GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

### Static Site Generators
If you prefer using a static site generator over plain HTML/CSS:

- **Jekyll**: Native support with GitHub Pages
  - [Jekyll Documentation](https://jekyllrb.com/docs/)
  
- **Hugo**: Fast, powerful static site generator
  - [Hugo Documentation](https://gohugo.io/documentation/)
  
- **Eleventy**: JavaScript-based static site generator
  - [Eleventy Documentation](https://www.11ty.dev/docs/)

## License

Feel free to modify and use this template for your personal resume.
