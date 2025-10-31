import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFFont, rgb } from 'pdf-lib';

export class PDFService {
  private static browserInstance: Browser | null = null;

  /**
   * Launch or reuse a Puppeteer browser instance.
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browserInstance) {
      this.browserInstance = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browserInstance;
  }

  /**
   * Gracefully close the Puppeteer browser instance.
   * Useful for cleanup during shutdown.
   */
  static async closeBrowser(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
    }
  }

  /**
   * Generate a PDF from SVG content.
   */
  static async generateFromSVG(svgContent: string, outputPath: string): Promise<string> {
    return this.generatePDF(svgContent, outputPath);
  }

  /**
   * Generate a PDF from HTML content.
   */
  static async generateFromHTML(htmlContent: string, outputPath: string): Promise<string> {
    return this.generatePDF(htmlContent, outputPath);
  }

  /**
   * Core reusable PDF generation logic.
   */
  private static async generatePDF(content: string, outputPath: string): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Make sure parent directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await page.setContent(content, { waitUntil: 'networkidle0' });
      await page.setViewport({ width: 1200, height: 900 });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true, // more consistent PDF layout
      });

      return outputPath;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      await page.close();
    }
  }

  /**
   * Extract placeholders from PDF text content.
   * Placeholders should be in the format {{placeholder}}
   */
  static async extractPlaceholdersFromPDF(pdfBuffer: Buffer): Promise<string[]> {
    try {
      // Dynamic require for pdf-parse (CommonJS module)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      
      // Handle different export formats
      const pdfParseFn = pdfParse.default || pdfParse;
      
      // Use pdf-parse to extract text from PDF
      const data = await pdfParseFn(pdfBuffer);
      const fullText = data.text;
      
      // Find all placeholders using regex
      const placeholders: Set<string> = new Set();
      const regex = /\{\{([^}]+)\}\}/g;
      let match;
      while ((match = regex.exec(fullText)) !== null) {
        placeholders.add(match[0]); // Add full placeholder like {{NAME}}
      }

      return Array.from(placeholders);
    } catch (error) {
      console.error('Error extracting placeholders from PDF:', error);
      throw new Error('Failed to extract placeholders from PDF');
    }
  }

  /**
   * Replace placeholders in PDF with actual data.
   * Uses pdfjs-dist to read text positions and pdf-lib to modify the PDF.
   */
  static async replacePlaceholdersInPDF(
    pdfBuffer: Buffer,
    replacements: { [key: string]: string },
    qrDataURL?: string
  ): Promise<Buffer> {
    try {
      // Dynamic import of pdfjs-dist (ES Module) for Node.js compatibility
      // @ts-ignore - pdfjs-dist types may not be perfect
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      
      // Configure pdfjs-dist for Node.js environment
      // Note: pdfjs-dist requires canvas package for Node.js
      const loadingTask = pdfjsLib.getDocument({ 
        data: pdfBuffer,
        verbosity: 0, // Suppress warnings
      });
      const pdf = await loadingTask.promise;
      
      // Also load with pdf-lib for modifications
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pdfLibPages = pdfDoc.getPages();

      // Embed default font
      const helveticaFont = await pdfDoc.embedFont('Helvetica');

      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const pdfLibPage = pdfLibPages[pageNum - 1];
        const pageSize = pdfLibPage.getSize();
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Get text content with positions
        const textContent = await page.getTextContent();
        
        // Build a map of placeholders to their positions
        const placeholderPositions: Array<{
          placeholder: string;
          key: string;
          x: number;
          y: number;
          width: number;
          height: number;
          fontSize: number;
          color: any;
        }> = [];

        // Extract placeholder positions from text content
        for (const item of textContent.items as any[]) {
          if (item.str) {
            const text = item.str;
            const regex = /\{\{([^}]+)\}\}/g;
            let match;
            
            while ((match = regex.exec(text)) !== null) {
              const placeholder = match[0];
              const key = match[1];
              
              // Get position and styling from the text item
              const transform = item.transform || [1, 0, 0, 1, 0, 0];
              const x = transform[4] || 0;
              // Convert from pdfjs coordinate system (top-left origin) to pdf-lib (bottom-left origin)
              const y = viewport.height - (transform[5] || 0);
              
              // Calculate font size from transform matrix
              const fontSize = Math.abs(transform[0]) || item.height || 12;
              const width = item.width || (placeholder.length * fontSize * 0.6);
              
              placeholderPositions.push({
                placeholder,
                key,
                x,
                y,
                width,
                height: fontSize,
                fontSize,
                color: item.color ? rgb(item.color.r || 0, item.color.g || 0, item.color.b || 0) : rgb(0, 0, 0),
              });
            }
          }
        }

        // Remove old text by drawing white rectangles and draw new text
        for (const pos of placeholderPositions) {
          const replacement = replacements[pos.key.toUpperCase()] || replacements[pos.key.toLowerCase()] || replacements[pos.key] || '';
          
          if (replacement && replacement !== pos.placeholder) {
            // Calculate text width for the replacement
            const textWidth = helveticaFont.widthOfTextAtSize(replacement, pos.fontSize);
            
            // Draw a white rectangle to cover the old text (with some padding)
            pdfLibPage.drawRectangle({
              x: pos.x - 2,
              y: pos.y - pos.fontSize - 2,
              width: Math.max(pos.width, textWidth) + 4,
              height: pos.fontSize + 4,
              color: rgb(1, 1, 1), // White background
              opacity: 1,
            });

            // Draw the replacement text
            pdfLibPage.drawText(replacement, {
              x: pos.x,
              y: pos.y - pos.fontSize,
              size: pos.fontSize,
              font: helveticaFont,
              color: pos.color,
            });
          }
        }

        // Handle QR code placeholder - embed QR code image if provided
        if (qrDataURL) {
          try {
            // Convert data URL to buffer
            const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
            const qrImageBytes = Buffer.from(base64Data, 'base64');
            
            // Embed the image
            const qrImage = await pdfDoc.embedPng(qrImageBytes);
            const qrDims = qrImage.scale(0.3);
            
            // Try to find QR placeholder position or use default
            const qrPlaceholder = placeholderPositions.find(p => 
              p.key.toUpperCase() === 'QR' || p.key.toLowerCase() === 'qr'
            );
            
            if (qrPlaceholder) {
              pdfLibPage.drawImage(qrImage, {
                x: qrPlaceholder.x,
                y: qrPlaceholder.y - qrDims.height,
                width: qrDims.width,
                height: qrDims.height,
              });
            } else {
              // Default position (bottom right)
              pdfLibPage.drawImage(qrImage, {
                x: pageSize.width - qrDims.width - 50,
                y: 50,
                width: qrDims.width,
                height: qrDims.height,
              });
            }
          } catch (error) {
            console.error('Error embedding QR code in PDF:', error);
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      return Buffer.from(modifiedPdfBytes);
    } catch (error) {
      console.error('Error replacing placeholders in PDF:', error);
      throw new Error('Failed to replace placeholders in PDF');
    }
  }

  /**
   * Generate PDF from PDF template with placeholder replacement.
   */
  static async generateFromPDFTemplate(
    pdfBuffer: Buffer,
    replacements: { [key: string]: string },
    outputPath: string,
    qrDataURL?: string
  ): Promise<string> {
    try {
      // Make sure parent directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Replace placeholders in PDF
      const modifiedPdfBuffer = await this.replacePlaceholdersInPDF(
        pdfBuffer,
        replacements,
        qrDataURL
      );

      // Write the modified PDF to disk
      fs.writeFileSync(outputPath, modifiedPdfBuffer);

      return outputPath;
    } catch (error) {
      console.error('PDF template generation error:', error);
      throw new Error('Failed to generate PDF from template');
    }
  }
}
