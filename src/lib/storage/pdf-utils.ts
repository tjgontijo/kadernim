import { PDFDocument } from 'pdf-lib'
import { getFromR2 } from './r2'

/**
 * Counts the number of pages in a PDF from R2
 * @param key The R2 object key
 * @returns The number of pages
 */
export async function countPdfPagesFromR2(key: string): Promise<number> {
  try {
    const pdfBuffer = await getFromR2(key)
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    })
    return pdfDoc.getPageCount()
  } catch (error) {
    console.error(`Error counting PDF pages for key: ${key}`, error)
    return 0
  }
}

/**
 * Counts the number of pages in a PDF from a Buffer
 * @param buffer The PDF buffer
 * @returns The number of pages
 */
export async function countPdfPagesFromBuffer(buffer: Buffer): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(buffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    })
    return pdfDoc.getPageCount()
  } catch (error) {
    console.error('Error counting PDF pages from buffer', error)
    return 0
  }
}
