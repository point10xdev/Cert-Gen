import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export class PDFService {
  private static async getBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  static async generateFromSVG(
    svgContent: string,
    outputPath: string
  ): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(svgContent, { waitUntil: 'networkidle0' });
      await page.setViewport({ width: 1200, height: 900 });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
      });

      return outputPath;
    } finally {
      await browser.close();
    }
  }

  static async generateFromHTML(
    htmlContent: string,
    outputPath: string
  ): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.setViewport({ width: 1200, height: 900 });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
      });

      return outputPath;
    } finally {
      await browser.close();
    }
  }
}

