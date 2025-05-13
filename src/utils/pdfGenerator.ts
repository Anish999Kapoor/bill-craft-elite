
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
      // Create a document - A4 is 210 x 297 mm
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Define colors
      const primaryColor = '#0C1D49';
      const secondaryColor = '#EAF6FF';
      
      // Set up fonts
      doc.setFont('helvetica');

      // Add company logo if available
      if (invoiceData.companyLogo) {
        try {
          const logoUrl = URL.createObjectURL(invoiceData.companyLogo);
          const logoImg = await loadImage(logoUrl);
          doc.addImage(logoImg, 'JPEG', 20, 20, 40, 20);
        } catch (err) {
          console.error("Error adding logo to PDF:", err);
        }
      }

      // Add header - "Delivery Schedule"
      doc.setFontSize(24);
      doc.setTextColor(primaryColor);
      doc.text('Delivery Schedule', 190, 25, { align: 'right' });
      doc.setFontSize(10);
      doc.text(`PO No: ${invoiceData.poNo}`, 190, 32, { align: 'right' });
      doc.text(`PO Date: ${invoiceData.poDate}`, 190, 37, { align: 'right' });
      doc.text(`Ref No: ${invoiceData.refNo}`, 190, 42, { align: 'right' });

      // Add company details
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text(invoiceData.companyName, 20, 50);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const companyAddressLines = invoiceData.companyAddress.split('\n');
      let yPos = 55;
      companyAddressLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 5;
      });
      
      doc.text(`GSTIN: ${invoiceData.gstin}`, 20, yPos + 5);
      doc.text(`PAN NO: ${invoiceData.panNo}`, 20, yPos + 10);

      // Add client details with light background
      doc.setFillColor(parseInt(secondaryColor.substring(1, 3), 16), 
                     parseInt(secondaryColor.substring(3, 5), 16), 
                     parseInt(secondaryColor.substring(5, 7), 16));
      doc.rect(20, yPos + 20, 80, 30, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text('Issued to:', 25, yPos + 25);
      doc.setFontSize(11);
      doc.text(invoiceData.clientName, 25, yPos + 30);
      doc.setFontSize(9);
      
      const clientAddressLines = invoiceData.clientAddress.split('\n');
      let clientYPos = yPos + 35;
      clientAddressLines.forEach(line => {
        doc.text(line, 25, clientYPos);
        clientYPos += 4;
      });
      
      doc.text(`GSTIN: ${invoiceData.clientGstin}`, 25, yPos + 45);

      // Add shipping details with light background
      doc.setFillColor(parseInt(secondaryColor.substring(1, 3), 16), 
                     parseInt(secondaryColor.substring(3, 5), 16), 
                     parseInt(secondaryColor.substring(5, 7), 16));
      doc.rect(20, yPos + 55, 170, 25, 'F');
      doc.text('Shipped to:', 25, yPos + 60);
      doc.setFontSize(9);
      
      const shippedToLines = invoiceData.shippedTo.split('\n');
      let shippedYPos = yPos + 65;
      shippedToLines.forEach(line => {
        doc.text(line, 25, shippedYPos, { maxWidth: 160 });
        shippedYPos += 4;
      });

      // Add delivery and payment terms
      doc.setFontSize(10);
      doc.text(`Delivery Date: ${invoiceData.deliveryDate}`, 20, yPos + 85);
      doc.text(`Payment Terms: ${invoiceData.paymentTerms}`, 20, yPos + 90);

      // Item Details table header - "Item Wise Delivery Schedule:"
      const tableTop = yPos + 100;
      doc.setFontSize(10);
      doc.setTextColor(primaryColor);
      doc.text('Item Wise Delivery Schedule:', 20, tableTop);

      // Create table for items using autotable plugin
      const tableData = invoiceData.items.map(item => [
        item.id.toString(),
        item.particulars,
        item.quantity,
        item.deliveryDate || invoiceData.deliveryDate,
        item.quantityToDelivery || item.quantity
      ]);

      autoTable(doc, {
        head: [['S. NO.', 'PARTICULARS', 'TOTAL QUANTITY', 'DELIVERY DATE', 'QUANTITY TO DELIVERY']],
        body: tableData,
        startY: tableTop + 5,
        headStyles: { 
          fillColor: [parseInt(primaryColor.substring(1, 3), 16), 
                     parseInt(primaryColor.substring(3, 5), 16), 
                     parseInt(primaryColor.substring(5, 7), 16)],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [parseInt(secondaryColor.substring(1, 3), 16), 
                     parseInt(secondaryColor.substring(3, 5), 16), 
                     parseInt(secondaryColor.substring(5, 7), 16)]
        },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 50 }
        }
      });

      // Get the Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY + 10;

      // Add totals
      doc.setTextColor(0, 0, 0);
      doc.text('Sub Total', 130, finalY + 10);
      doc.text(`IGST @ ${invoiceData.igstRate}%`, 130, finalY + 20);
      doc.text('Advance', 130, finalY + 30);
      doc.text('Total', 130, finalY + 40);

      doc.text(invoiceData.subtotal.toFixed(2), 190, finalY + 10, { align: 'right' });
      doc.text(invoiceData.igstAmount.toFixed(2), 190, finalY + 20, { align: 'right' });
      doc.text(invoiceData.advance.toFixed(2), 190, finalY + 30, { align: 'right' });
      doc.text(invoiceData.totalAmount.toFixed(2), 190, finalY + 40, { align: 'right' });

      // Add signature if available
      if (invoiceData.signature) {
        try {
          const signatureUrl = URL.createObjectURL(invoiceData.signature);
          const signImg = await loadImage(signatureUrl);
          doc.addImage(signImg, 'JPEG', 150, finalY + 50, 30, 15);
        } catch (err) {
          console.error("Error adding signature to PDF:", err);
        }
      }

      doc.text('Authorised Signatory', 165, finalY + 70, { align: 'center' });

      // Add terms and contact information
      doc.setFontSize(9);
      doc.text(invoiceData.contactDetails, 20, finalY + 85);
      doc.text(invoiceData.emailDetails, 20, finalY + 90);
      doc.text('Terms and conditions:', 20, finalY + 95);
      
      const termsLines = invoiceData.shippedTo.split('\n').slice(0, 3); // Limit terms to avoid going off page
      let termsYPos = finalY + 100;
      termsLines.forEach(line => {
        doc.text(line, 20, termsYPos, { maxWidth: 170 });
        termsYPos += 4;
      });

      // Generate PDF as blob URL
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      resolve(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      reject(err);
    }
  });
};

// Helper function to convert image URL to Image object
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export default generatePDF;
