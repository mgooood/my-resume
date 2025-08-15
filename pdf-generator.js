/**
 * PDF generation and print functionality
 * This script handles the print/save PDF button functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  const downloadPdfButton = document.getElementById('downloadPdf');
  
  if (downloadPdfButton) {
    downloadPdfButton.addEventListener('click', function() {
      // Temporarily hide elements that shouldn't be in the PDF
      const pdfButton = document.querySelector('.pdf-container');
      const originalDisplay = pdfButton.style.display;
      
      // Hide the button when printing
      pdfButton.style.display = 'none';
      
      // Print the document
      window.print();
      
      // Restore button visibility after printing dialog is closed
      setTimeout(() => {
        pdfButton.style.display = originalDisplay;
      }, 100);
    });
  }
});
