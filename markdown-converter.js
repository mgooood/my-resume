#!/usr/bin/env node

/**
 * Markdown to HTML Converter (Command Line Tool)
 * This script converts resume.md to HTML format to maintain a single source of truth
 * 
 * Usage: node markdown-converter.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Paths for files
const markdownPath = path.join(__dirname, 'resume.md');
const htmlPath = path.join(__dirname, 'index.html');

/**
 * Main function to run the conversion
 */
async function convertMarkdownToHtml() {
  try {
    console.log('Reading Markdown and HTML files...');
    
    // Read the markdown and HTML files
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Create a DOM from the HTML content
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    console.log('Updating HTML with markdown content...');
    
    // Update the HTML with markdown content
    updateHtmlFromMarkdown(document, markdownContent);
    
    // Save the updated HTML
    // Preserve original DOCTYPE and structure by avoiding full serialization
    const updatedHtml = dom.serialize();
    fs.writeFileSync(htmlPath, updatedHtml);
    
    console.log('Successfully updated HTML from Markdown!');
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    process.exit(1);
  }
}

/**
 * Updates the HTML document with content from markdown
 * @param {Document} document - The HTML document
 * @param {string} markdown - The markdown content
 */
function updateHtmlFromMarkdown(document, markdown) {
  // Parse sections
  const sections = parseMarkdownSections(markdown);
  
  // Update header info
  if (sections.header) {
    updateHeader(document, sections.header);
  }
  
  // Update professional summary
  if (sections.summary) {
    updateSection(document, 'summary', sections.summary);
  }
  
  // Update experience
  if (sections.experience) {
    updateExperience(document, sections.experience);
  }
  
  // Update education
  if (sections.education) {
    updateEducation(document, sections.education);
  }
  
  // Update skills
  if (sections.skills) {
    updateSkills(document, sections.skills);
  }
  
  // Update certifications
  if (sections.certifications) {
    updateCertifications(document, sections.certifications);
  }
  
  // Update learning section
  if (sections.learning) {
    updateSection(document, 'learning', sections.learning);
  }
  
  // Remove any duplicate or unnecessary horizontal rules
  // cleanupHorizontalRules(document);
}

/**
 * Parses markdown content into sections
 * @param {string} markdown - The markdown content
 * @returns {Object} - Object containing different resume sections
 */
function parseMarkdownSections(markdown) {
  const sections = {};
  let currentSection = null;
  let content = '';
  
  // Split by lines and process
  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for header (level 1)
    if (line.startsWith('# ')) {
      sections.header = sections.header || [];
      sections.header.push(line.substring(2).trim());
      continue;
    }
    
    // Check for major sections (level 2)
    if (line.startsWith('## ')) {
      // Save previous section content if exists
      if (currentSection) {
        sections[currentSection] = content.trim();
        content = '';
      }
      
      // Set new current section
      const sectionName = line.substring(3).trim().toLowerCase();
      switch (sectionName) {
        case 'professional summary':
          currentSection = 'summary';
          break;
        case 'professional experience':
          currentSection = 'experience';
          break;
        case 'education':
          currentSection = 'education';
          break;
        case 'skills':
        case 'technical skills':  // Add support for 'TECHNICAL SKILLS' heading
          currentSection = 'skills';
          break;
        case 'certifications':
          currentSection = 'certifications';
          break;
        case 'continuous learning':
          currentSection = 'learning';
          break;
        default:
          currentSection = sectionName.replace(/\s+/g, '_');
      }
      continue;
    }
    
    // Add line to current section content
    if (currentSection) {
      content += line + '\n';
    }
  }
  
  // Save the last section
  if (currentSection && content.trim()) {
    sections[currentSection] = content.trim();
  }
  
  return sections;
}

/**
 * Updates the header section in the HTML document
 * @param {Document} document - The HTML document
 * @param {Array} headerData - Array containing header information
 */
function updateHeader(document, headerData) {
  if (headerData && headerData.length > 0) {
    const name = document.querySelector('.resume-header h1');
    if (name) {
      name.textContent = headerData[0];
    }
    
    if (headerData.length > 1) {
      const title = document.querySelector('.resume-title');
      if (title) {
        title.textContent = headerData[1];
      }
    }
  }
}

/**
 * Updates a simple section with markdown content
 * @param {Document} document - The HTML document
 * @param {string} sectionId - The HTML section ID
 * @param {string} markdown - The markdown content
 */
function updateSection(document, sectionId, markdown) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  // Keep the heading
  const heading = section.querySelector('h2');
  
  // Clear existing content except heading
  section.innerHTML = '';
  if (heading) {
    // Add section-divider class to the heading
    heading.classList.add('section-divider');
    section.appendChild(heading);
  }
  
  // Preserve markdown formatting for headings and lists
  const markdownWithPreservedLineBreaks = markdown.replace(/\n- /g, '\n\n- ');
  
  // Parse markdown into HTML
  const htmlContent = parseSimpleMarkdown(markdownWithPreservedLineBreaks, sectionId);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Add each parsed element to the section
  while (tempDiv.firstChild) {
    section.appendChild(tempDiv.firstChild);
  }
}

/**
 * Updates the experience section
 * @param {Document} document - The HTML document
 * @param {string} markdown - The experience section markdown
 */
function updateExperience(document, markdown) {
  const section = document.getElementById('experience');
  if (!section) return;
  
  // Keep the heading
  const heading = section.querySelector('h2');
  
  // Clear existing content except heading
  section.innerHTML = '';
  if (heading) {
    // Add section-divider class to the heading
    heading.classList.add('section-divider');
    section.appendChild(heading);
  }
  
  // Parse job entries (separated by ### headers)
  const jobEntries = markdown.split(/(?=### )/g);
  
  jobEntries.forEach(entry => {
    if (!entry.trim()) return;
    
    const jobDiv = document.createElement('div');
    jobDiv.className = 'experience-item';
    
    const lines = entry.split('\n');
    
    // Job title
    if (lines[0].startsWith('### ')) {
      const titleH3 = document.createElement('h3');
      titleH3.className = 'experience-title';
      titleH3.textContent = lines[0].substring(4).trim();
      jobDiv.appendChild(titleH3);
    }
    
    // Company and Time Period
    if (lines.length > 1 && lines[1].trim()) {
      const companyLine = lines[1].trim();
      const companyMatch = companyLine.match(/\*\*(.+?)\*\*(.*)/); // Match company name and rest of line
      
      // Process line which typically has format: **Company** | Location | Time Period
      if (companyMatch) {
        const companyName = companyMatch[1].trim();
        const restOfLine = companyMatch[2] ? companyMatch[2].trim() : '';
        
        // Split the rest of line by pipe (|) to separate location and time period
        const parts = restOfLine.split('|');
        
        // Create company and location element
        const companyP = document.createElement('p');
        companyP.className = 'experience-company';
        
        // If there's a time period (last part after pipe)
        if (parts.length > 1) {
          // Last part contains the date, the rest is company/location info
          const datePart = parts[parts.length - 1].trim();
          
          // Filter out any empty parts before joining to avoid empty segments creating unwanted pipes
          const filteredLocationParts = parts.slice(0, parts.length - 1).filter(part => part.trim() !== '');
          const locationParts = filteredLocationParts.join(' | ').trim();
          
          // Company and location - handle pipe properly
          companyP.textContent = locationParts ? `${companyName} | ${locationParts}` : companyName;
          jobDiv.appendChild(companyP);
          
          // Create separate period element
          const periodP = document.createElement('p');
          periodP.className = 'experience-period';
          periodP.textContent = datePart;
          jobDiv.appendChild(periodP);
        } else {
          // No date part found, use whole line
          companyP.textContent = companyName + (restOfLine ? ' ' + restOfLine : '');
          jobDiv.appendChild(companyP);
        }
      } else {
        // No company formatting, use the whole line
        const companyP = document.createElement('p');
        companyP.className = 'experience-company';
        companyP.textContent = companyLine;
        jobDiv.appendChild(companyP);
      }
    }
    
    // Period - we now handle this in the company section above
    // Keeping this for entries that might have period on a separate line
    if (lines.length > 2 && lines[2].trim() && !lines[2].trim().startsWith('- ')) {
      const periodP = document.createElement('p');
      periodP.className = 'experience-period';
      periodP.textContent = lines[2].trim();
      jobDiv.appendChild(periodP);
    }
    
    // Responsibilities (bullet points)
    const bullets = [];
    for (let i = 3; i < lines.length; i++) {
      if (lines[i].trim().startsWith('- ')) {
        bullets.push(lines[i].substring(2).trim());
      }
    }
    
    if (bullets.length > 0) {
      const ul = document.createElement('ul');
      bullets.forEach(bullet => {
        const li = document.createElement('li');
        li.textContent = bullet;
        ul.appendChild(li);
      });
      jobDiv.appendChild(ul);
    }
    
    section.appendChild(jobDiv);
  });
}

/**
 * Updates the skills section in the sidebar
 * @param {Document} document - The HTML document
 * @param {string} markdown - The skills section markdown
 */
function updateSkills(document, markdown) {
  const skillsList = document.querySelector('.skills-list');
  if (!skillsList) return;
  
  // Clear existing skills
  skillsList.innerHTML = '';
  
  // Add skills from markdown
  const lines = markdown.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('- ')) {
      const li = document.createElement('li');
      
      // Parse out asterisks/bold formatting
      const lineText = line.substring(2).trim();
      // Match **text** pattern and extract content
      const boldMatch = lineText.match(/\*\*(.+?)\*\*/g);
      
      if (boldMatch) {
        // Extract content without asterisks
        const cleanedText = lineText.replace(/\*\*/g, '');
        li.textContent = cleanedText;
      } else {
        li.textContent = lineText;
      }
      
      skillsList.appendChild(li);
    }
  });
}

/**
 * Updates the education section in the sidebar
 * @param {Document} document - The HTML document
 * @param {string} markdown - The education section markdown
 */
function updateEducation(document, markdown) {
  // Find the education section in the sidebar
  const sidebar = document.querySelector('.sidebar');
  const educationHeaders = Array.from(sidebar.querySelectorAll('h3'))
    .filter(h3 => h3.textContent.includes('Education'));
  
  if (!educationHeaders.length) return;
  
  const educationContainer = educationHeaders[0].parentElement;
  if (!educationContainer) return;
  
  // Keep the heading
  const heading = educationContainer.querySelector('h3');
  
  // Clear existing content except heading
  educationContainer.innerHTML = '';
  if (heading) {
    educationContainer.appendChild(heading);
  }
  
  // Parse the education section from markdown
  // Expected format:
  // **Institution Name**
  // Degree, Program (Year - Year)
  // Honors: Honor Level
  
  // Split the content by double line breaks to identify separate entries
  const entries = markdown.split(/\n\s*\n+/);
  
  // Process each entry
  entries.forEach(entry => {
    if (!entry.trim() || entry.trim() === '## EDUCATION') return;
    
    const lines = entry.split('\n').map(line => line.trim());
    if (lines.length < 2) return; // Need at least institution and degree
    
    let institution = '';
    let degree = '';
    let period = '';
    let honors = '';
    
    // Parse institution from bold formatting
    const institutionMatch = lines[0].match(/\*\*(.+?)\*\*/);
    if (institutionMatch) {
      institution = institutionMatch[1];
    }
    
    // Parse degree and period
    if (lines.length > 1) {
      const degreeLine = lines[1];
      // Check for degree with period in parentheses
      const degreeMatch = degreeLine.match(/(.*?)\((\d{4})\s*-\s*(\d{4})\)/);
      
      if (degreeMatch) {
        degree = degreeMatch[1].trim();
        period = `${degreeMatch[2]} - ${degreeMatch[3]}`;
      } else {
        degree = degreeLine;
        // Try to find period in the text
        const periodMatch = degreeLine.match(/(\d{4})\s*-\s*(\d{4})/i);
        if (periodMatch) {
          period = `${periodMatch[1]} - ${periodMatch[2]}`;
        }
      }
    }
    
    // Check for honors
    if (lines.length > 2 && lines[2].startsWith('Honors:')) {
      honors = lines[2];
    }
    
    // Add education item if we have institution and degree
    if (institution && degree) {
      addEducationItem(document, educationContainer, degree, institution, period, honors);
    }
  });
}

/**
 * Adds an education item to the education container
 * @param {Document} document - The HTML document
 * @param {Element} container - The container element
 * @param {string} degree - Education degree
 * @param {string} institution - Education institution
 * @param {string} period - Education period
 * @param {string} honors - Education honors
 */
function addEducationItem(document, container, degree, institution, period, honors) {
  const eduDiv = document.createElement('div');
  eduDiv.className = 'sidebar-education-item';
  
  const degreeP = document.createElement('p');
  degreeP.className = 'sidebar-education-degree';
  degreeP.textContent = degree;
  eduDiv.appendChild(degreeP);
  
  const instP = document.createElement('p');
  instP.className = 'sidebar-education-institution';
  instP.textContent = institution;
  eduDiv.appendChild(instP);
  
  if (period) {
    const periodP = document.createElement('p');
    periodP.className = 'sidebar-education-period';
    periodP.textContent = period;
    eduDiv.appendChild(periodP);
  }
  
  if (honors) {
    const honorsP = document.createElement('p');
    honorsP.className = 'sidebar-education-honors';
    honorsP.textContent = honors;
    eduDiv.appendChild(honorsP);
  }
  
  container.appendChild(eduDiv);
}

/**
 * Updates the certifications section
 * @param {Document} document - The HTML document
 * @param {string} markdown - The certifications section markdown
 */
function updateCertifications(document, markdown) {
  const sidebar = document.querySelector('.sidebar');
  const certificationHeaders = Array.from(sidebar.querySelectorAll('h3'))
    .filter(h3 => h3.textContent.includes('Certifications'));
  
  if (!certificationHeaders.length) return;
  
  const certificationContainer = certificationHeaders[0].parentElement;
  if (!certificationContainer) return;
  
  // Find the certifications list
  let certsList = certificationContainer.querySelector('.sidebar-certifications-list');
  
  // If the list doesn't exist, create it
  if (!certsList) {
    certsList = document.createElement('ul');
    certsList.className = 'sidebar-certifications-list';
    certificationContainer.appendChild(certsList);
  } else {
    // Clear existing certifications
    certsList.innerHTML = '';
  }
  
  // Parse certification entries from markdown bullet points
  // Format expected: - **Certification Name** - Issuer (Date)
  const lines = markdown.split('\n');
  let certCount = 0;
  const maxCertsInSidebar = 3; // Limit to first 3 certifications in sidebar
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, section headers, or non-bullet points
    if (!line || line === '## CERTIFICATIONS' || line === '---' || !line.startsWith('-')) {
      continue;
    }
    
    // Extract certification details from bullet point
    // Remove the bullet point marker
    let certLine = line.substring(1).trim();
    
    // Extract the certification name from between ** markers
    const nameMatch = certLine.match(/\*\*(.*?)\*\*/i);
    if (nameMatch) {
      const certName = nameMatch[1].trim();
      
      // Extract the date which is typically at the end in parentheses or after a hyphen
      let certDate = null;
      
      // Try to find date patterns like: (Month Year) or - Issuer (Month Year)
      const dateMatch = certLine.match(/\(([A-Za-z]+ \d{4})\)$/);
      if (dateMatch) {
        certDate = dateMatch[1];
      }
      
      // Only add first 3 certifications to sidebar
      if (certCount < maxCertsInSidebar) {
        addCertificationItem(document, certsList, certName, null, certDate);
        certCount++;
      }
    }
  }
}

/**
 * Adds a certification item to the certifications list
 * @param {Document} document - The HTML document
 * @param {Element} container - The container element
 * @param {string} title - Certification title
 * @param {string} issuer - Certification issuer
 * @param {string} date - Certification date
 */
function addCertificationItem(document, container, title, issuer, date) {
  const li = document.createElement('li');
  
  const titleP = document.createElement('p');
  titleP.className = 'sidebar-certification-title';
  titleP.textContent = title;
  li.appendChild(titleP);
  
  if (date) {
    const dateP = document.createElement('p');
    dateP.className = 'sidebar-certification-date';
    dateP.textContent = date;
    li.appendChild(dateP);
  }
  
  container.appendChild(li);
}

/**
 * Simple markdown parser for basic formatting
 * @param {string} markdown - The markdown text to parse
 * @param {string} sectionId - The ID of the section being processed (for data attributes)
 * @returns {string} - HTML representation
 */
function parseSimpleMarkdown(markdown, sectionId = '') {
  let html = '';
  
  // Parse paragraphs
  const paragraphs = markdown.split(/\n\n+/);
  
  paragraphs.forEach(paragraph => {
    paragraph = paragraph.trim();
    
    if (!paragraph) return;
    
    // Skip horizontal rules completely
    if (paragraph === '---') {
      return;
    }
    
    // Headers (h3, h4)
    if (paragraph.startsWith('### ')) {
      html += `<h3>${paragraph.substring(4)}</h3>`;
    } else if (paragraph.startsWith('#### ')) {
      html += `<h4>${paragraph.substring(5)}</h4>`;
    } 
    // Lists - special handling for nested lists
    else if (paragraph.startsWith('- ') || paragraph.includes('\n- ')) {
      const lines = paragraph.split('\n');
      let currentList = [];
      let inList = false;
      
      lines.forEach(line => {
        if (line.startsWith('- ')) {
          inList = true;
          currentList.push(parseInlineMarkdown(line.substring(2).trim()));
        } else if (inList) {
          // Add the list
          html += '<ul>';
          currentList.forEach(item => {
            html += `<li>${item}</li>`;
          });
          html += '</ul>';
          
          // Reset and add the non-list line
          inList = false;
          currentList = [];
          if (line.trim()) {
            html += `<p>${parseInlineMarkdown(line)}</p>`;
          }
        } else if (line.trim()) {
          html += `<p>${parseInlineMarkdown(line)}</p>`;
        }
      });
      
      // Don't forget any remaining list items
      if (inList && currentList.length > 0) {
        html += '<ul>';
        currentList.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
      }
    } 
    // Regular paragraph
    else {
      html += `<p>${parseInlineMarkdown(paragraph)}</p>`;
    }
  });
  
  return html;
}

/**
 * Parses inline markdown formatting
 * @param {string} text - The text to parse
 * @returns {string} - HTML with inline formatting
 */
function parseInlineMarkdown(text) {
  // Bold: **text** or __text__
  text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  
  // Italic: *text* or _text_
  text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Preserve markdown syntax for lists in learning section
  if (text.startsWith('- **')) {
    return text;
  }
  
  return text;
}

/**
 * Cleans up horizontal rules in the document by removing unnecessary duplicates
 * @param {Document} document - The HTML document to clean up
 */
/* Commented out for now
function cleanupHorizontalRules(document) {
  // Find all hr elements
  const hrs = document.querySelectorAll('hr');
  
  // First, ensure all hr elements have a data-hr attribute
  hrs.forEach(hr => {
    if (!hr.hasAttribute('data-hr')) {
      // Try to determine which section this hr belongs to
      let section = hr.closest('section');
      let sectionId = section ? section.id || 'unknown' : 'global';
      hr.setAttribute('data-hr', sectionId);
    }
  });
  
  // Check for consecutive hr elements and empty text nodes between them
  for (let i = 0; i < hrs.length - 1; i++) {
    const current = hrs[i];
    const next = hrs[i + 1];
    
    // Check if they are adjacent or separated only by whitespace
    let node = current.nextSibling;
    let hasOnlyWhitespace = true;
    
    while (node && node !== next) {
      // If there's any non-whitespace text content or elements other than line breaks
      if (node.nodeType === 1 && node.tagName !== 'BR') {
        hasOnlyWhitespace = false;
        break;
      } else if (node.nodeType === 3 && node.textContent.trim() !== '') {
        hasOnlyWhitespace = false;
        break;
      }
      node = node.nextSibling;
    }
    
    // If they are consecutive without meaningful content between them, remove the second one
    if (hasOnlyWhitespace) {
      next.parentNode.removeChild(next);
      // Adjust index to account for removed element
      i--;
    }
  }
}
*/

// Run the converter
convertMarkdownToHtml();
