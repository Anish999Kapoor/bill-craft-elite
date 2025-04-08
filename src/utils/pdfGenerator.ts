
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import { InvoiceItemType } from '../components/InvoiceItem';

interface PDFInvoiceData {
  companyName: string;
  companyAddress: string;
  poNo: string;
  poDate: string;
  gstin: string;
  panNo: string;
  clientName: string;
  clientAddress: string;
  clientGstin: string;
  shippedTo: string;
  deliveryDate: string;
  paymentTerms: string;
  items: InvoiceItemType[];
  subtotal: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
  advance: number;
  refNo: string;
  contactDetails: string;
  emailDetails: string;
  companyLogo?: File | null;
  signature?: File | null;
}

const generatePDF = async (invoiceData: PDFInvoiceData): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50 });
      const stream = doc.pipe(blobStream());

      // Define colors
      const primaryColor = '#0C1D49';
      const secondaryColor = '#EAF6FF';

      // Set up fonts
      doc.font('Helvetica');

      // Add company logo if available
      if (invoiceData.companyLogo) {
        try {
          const logoUrl = URL.createObjectURL(invoiceData.companyLogo);
          const logoResponse = await fetch(logoUrl);
          const logoBuffer = await logoResponse.arrayBuffer();
          doc.image(Buffer.from(logoBuffer), 50, 50, { width: 100 });
        } catch (err) {
          console.error("Error adding logo to PDF:", err);
        }
      }

      // Add header
      doc.fontSize(24)
         .fillColor(primaryColor)
         .text('Purchase Order', { align: 'right' })
         .fontSize(10)
         .text(`PO No: ${invoiceData.poNo}`, { align: 'right' })
         .text(`PO Date: ${invoiceData.poDate}`, { align: 'right' })
         .text(`Ref No: ${invoiceData.refNo}`, { align: 'right' })
         .moveDown(1);

      // Add company details
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text(invoiceData.companyName, 50, 120)
         .fontSize(10)
         .fillColor('black')
         .text(invoiceData.companyAddress)
         .text(`GSTIN: ${invoiceData.gstin}`)
         .text(`PAN NO: ${invoiceData.panNo}`)
         .moveDown(1);

      // Add client details (in a box with light background)
      doc.rect(50, doc.y, 250, 80)
         .fill(secondaryColor)
         .fillColor('black');
      
      const clientYStart = doc.y - 75;
      doc.text('Issued to:', 60, clientYStart)
         .fontSize(11)
         .text(invoiceData.clientName, 60, clientYStart + 15)
         .fontSize(9)
         .text(invoiceData.clientAddress, 60, clientYStart + 30)
         .text(`GSTIN: ${invoiceData.clientGstin}`, 60, clientYStart + 60);

      // Add shipping details
      doc.rect(50, clientYStart + 90, doc.page.width - 100, 60)
         .fill(secondaryColor)
         .fillColor('black');
      
      doc.text('Shipped to:', 60, clientYStart + 95)
         .fontSize(9)
         .text(invoiceData.shippedTo, 60, clientYStart + 110, { width: doc.page.width - 120 });

      // Add delivery and payment terms
      doc.fontSize(10)
         .fillColor('black')
         .text(`Delivery Date: ${invoiceData.deliveryDate}`, 50, clientYStart + 160)
         .text(`Payment Terms: ${invoiceData.paymentTerms}`, 50, clientYStart + 175)
         .moveDown(2);

      // Item Details table header
      const tableTop = doc.y;
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text('Item Details:', 50, tableTop)
         .rect(50, tableTop + 15, doc.page.width - 100, 20)
         .fill(primaryColor);

      // Table headers
      doc.fillColor('white')
         .text('S. NO.', 60, tableTop + 20)
         .text('PARTICULARS', 110, tableTop + 20)
         .text('HSN CODE', 250, tableTop + 20)
         .text('QUANTITY', 320, tableTop + 20)
         .text('RATE', 400, tableTop + 20)
         .text('AMOUNT(Rs.)', 460, tableTop + 20);

      // Table rows
      let tableY = tableTop + 40;
      
      invoiceData.items.forEach((item, index) => {
        // Check if we need a new page
        if (tableY > doc.page.height - 150) {
          doc.addPage();
          tableY = 50;
        }

        // Add alternating row background
        if (index % 2 === 0) {
          doc.rect(50, tableY - 5, doc.page.width - 100, 25)
             .fill(secondaryColor);
        }

        doc.fillColor('black')
           .text(item.id.toString(), 60, tableY)
           .text(item.particulars.replace(/\n/g, ' '), 110, tableY, { width: 130 })
           .text(item.hsnCode, 250, tableY)
           .text(item.quantity.replace(/\n/g, ' '), 320, tableY)
           .text((item.rate?.toFixed(2) || '0.00'), 400, tableY)
           .text((item.amount?.toFixed(2) || '0.00'), 460, tableY);

        tableY += 25;
      });

      // Add totals
      doc.rect(350, tableY + 10, doc.page.width - 400, 80)
         .stroke();
      
      doc.text('Sub Total', 360, tableY + 20)
         .text(`IGST @ ${invoiceData.igstRate}%`, 360, tableY + 35)
         .text('Advance', 360, tableY + 50)
         .text('Total', 360, tableY + 65, { fontWeight: 'bold' });

      doc.text(invoiceData.subtotal.toFixed(2), 460, tableY + 20, { align: 'right' })
         .text(invoiceData.igstAmount.toFixed(2), 460, tableY + 35, { align: 'right' })
         .text(invoiceData.advance.toFixed(2), 460, tableY + 50, { align: 'right' })
         .text(invoiceData.totalAmount.toFixed(2), 460, tableY + 65, { align: 'right', fontWeight: 'bold' });

      // Add signature if available
      if (invoiceData.signature) {
        try {
          const signatureUrl = URL.createObjectURL(invoiceData.signature);
          const signatureResponse = await fetch(signatureUrl);
          const signatureBuffer = await signatureResponse.arrayBuffer();
          doc.image(Buffer.from(signatureBuffer), 400, tableY + 100, { width: 80 });
        } catch (err) {
          console.error("Error adding signature to PDF:", err);
        }
      }

      doc.text('Authorised Signatory', 400, tableY + 140, { align: 'center' });

      // Add terms and contact information
      doc.moveDown(4)
         .fontSize(9)
         .text(invoiceData.contactDetails, 50, doc.y)
         .text(invoiceData.emailDetails)
         .moveDown(1)
         .text('Terms and conditions:')
         .text(invoiceData.shippedTo);

      // Finalize PDF file
      doc.end();

      stream.on('finish', () => {
        // Get the blob URL and return it
        const url = stream.toBlobURL('application/pdf');
        resolve(url);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      reject(err);
    }
  });
};

export default generatePDF;
