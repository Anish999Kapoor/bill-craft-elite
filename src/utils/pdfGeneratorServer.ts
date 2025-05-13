import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface DeliveryScheduleItem {
  id: number;
  particulars: string;
  totalQuantity: string;
  deliveryDate: string;
  quantityToDelivery: string;
}

export interface DeliveryScheduleData {
  companyName: string;
  companyAddress: string;
  poNo: string;
  poDate: string;
  deliveryType: string;
  paymentTerms: string;
  gstin: string;
  panNo: string;
  clientName: string;
  clientAddress: string;
  clientGstin: string;
  shippedTo: string;
  items: DeliveryScheduleItem[];
  contactDetails: string;
  termsAndConditions: string;
  signature?: Buffer | null;
  logo?: Buffer | null;
}

export const generateDeliverySchedulePDF = async (data: DeliveryScheduleData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      // Collect the PDF data chunks
      const chunks: Buffer[] = [];
      
      // Setup document to capture chunks
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      
      // Define colors
      const primaryColor = '#0C1D49';
      const secondaryColor = '#EAF6FF';
      
      // Add company logo if available
      if (data.logo) {
        doc.image(data.logo, 50, 50, { width: 100 });
      }
      
      // Add header - "Delivery Schedule"
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor(primaryColor)
         .text('Delivery Schedule', 350, 50, { align: 'right' });
      
      // Add PO details
      doc.fontSize(10)
         .text(`PO No: ${data.poNo}`, 350, 80, { align: 'right' })
         .text(`PO Date: ${data.poDate}`, 350, 95, { align: 'right' })
         .text(`Delivery Type: ${data.deliveryType}`, 350, 110, { align: 'right' })
         .text(`Payment Terms: ${data.paymentTerms}`, 350, 125, { align: 'right' });
      
      // Add company details
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text(data.companyName, 50, 130);
      
      doc.font('Helvetica')
         .fontSize(10);
      
      // Handle multiline company address
      const companyAddressLines = data.companyAddress.split('\n');
      let yPos = 145;
      companyAddressLines.forEach(line => {
        doc.text(line, 50, yPos);
        yPos += 15;
      });
      
      // Company tax info
      doc.text(`GSTIN: ${data.gstin}`, 50, yPos + 15)
         .text(`PAN NO: ${data.panNo}`, 50, yPos + 30);
      
      // Client details with background
      doc.rect(50, yPos + 60, 250, 80)
         .fill(secondaryColor);
      
      doc.fillColor('black')
         .font('Helvetica-Bold')
         .text('Issued to:', 60, yPos + 70)
         .text(data.clientName, 60, yPos + 85);
      
      doc.font('Helvetica');
      
      // Handle multiline client address
      const clientAddressLines = data.clientAddress.split('\n');
      let clientYPos = yPos + 100;
      clientAddressLines.forEach(line => {
        doc.text(line, 60, clientYPos);
        clientYPos += 15;
      });
      
      // Client GSTIN
      doc.text(`GSTIN: ${data.clientGstin}`, 60, clientYPos);
      
      // Shipping details with background
      doc.rect(50, yPos + 150, 490, 70)
         .fill(secondaryColor);
      
      doc.fillColor('black')
         .font('Helvetica-Bold')
         .text('Shipped to:', 60, yPos + 160);
      
      doc.font('Helvetica');
      
      // Handle multiline shipping address
      const shippedToLines = data.shippedTo.split('\n');
      let shippedYPos = yPos + 175;
      shippedToLines.forEach((line, index) => {
        if (index < 3) { // Limit to prevent overflow
          doc.text(line, 60, shippedYPos, { width: 470 });
          shippedYPos += 15;
        }
      });
      
      // Item Details table header
      const tableTop = yPos + 240;
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor(primaryColor)
         .text('Item Wise Delivery Schedule:', 50, tableTop);
      
      // Create header for table
      const tableHeaders = ['S. NO.', 'PARTICULARS', 'TOTAL QUANTITY', 'DELIVERY DATE', 'QUANTITY TO DELIVERY'];
      const columnWidths = [50, 180, 100, 100, 110];
      const rowHeight = 25;
      
      // Draw table headers
      doc.rect(50, tableTop + 20, 490, rowHeight)
         .fill(primaryColor);
      
      let xPos = 60;
      doc.fillColor('white');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 30);
        xPos += columnWidths[i];
      });
      
      // Group items by id to handle multiple delivery dates
      const groupedItems = new Map<number, DeliveryScheduleItem[]>();
      data.items.forEach(item => {
        if (!groupedItems.has(item.id)) {
          groupedItems.set(item.id, []);
        }
        groupedItems.get(item.id)?.push(item);
      });
      
      // Draw table rows
      let rowY = tableTop + rowHeight + 20;
      let rowCount = 0;
      
      // Process grouped items
      groupedItems.forEach((items, id) => {
        // First row for this id will contain the main details
        const firstItem = items[0];
        
        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.rect(50, rowY, 490, rowHeight).fill(secondaryColor);
        }
        
        doc.fillColor('black');
        doc.text(id.toString(), 60, rowY + 7);
        doc.text(firstItem.particulars, 110, rowY + 7, { width: 170 });
        doc.text(firstItem.totalQuantity, 290, rowY + 7);
        doc.text(firstItem.deliveryDate, 390, rowY + 7);
        doc.text(firstItem.quantityToDelivery, 490, rowY + 7);
        
        rowY += rowHeight;
        rowCount++;
        
        // Additional rows for the same item (different delivery dates)
        for (let i = 1; i < items.length; i++) {
          // Alternate row background
          if (rowCount % 2 === 0) {
            doc.rect(50, rowY, 490, rowHeight).fill(secondaryColor);
          }
          
          doc.fillColor('black');
          doc.text('', 60, rowY + 7); // No ID for continuation rows
          doc.text('', 110, rowY + 7); // No particulars for continuation rows
          doc.text('', 290, rowY + 7); // No total quantity for continuation rows
          doc.text(items[i].deliveryDate, 390, rowY + 7);
          doc.text(items[i].quantityToDelivery, 490, rowY + 7);
          
          rowY += rowHeight;
          rowCount++;
        }
      });
      
      // Add terms and conditions
      const termsY = rowY + 30;
      doc.fontSize(10)
         .text('Terms and conditions:', 50, termsY);
      
      doc.fontSize(9)
         .text(data.termsAndConditions, 50, termsY + 15, { width: 400 });
      
      // Add signature if available
      if (data.signature) {
        doc.image(data.signature, 430, termsY + 20, { width: 100 });
      }
      
      doc.fontSize(10)
         .text('Authorised Signatory', 460, termsY + 130);
      
      // Add contact information
      doc.fontSize(9)
         .text(data.contactDetails, 50, termsY + 150);
      
      // Finalize the PDF
      doc.end();
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      reject(err);
    }
  });
};

// Stream version for API response
export const streamDeliverySchedulePDF = async (data: DeliveryScheduleData): Promise<Readable> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      // Create a readable stream from the PDF
      const stream = new Readable();
      stream._read = () => {}; // Required for readable stream
      
      doc.on('data', chunk => {
        stream.push(chunk);
      });
      
      doc.on('end', () => {
        stream.push(null);
        resolve(stream);
      });
      
      // Use the same logic as the buffer version
      // Define colors
      const primaryColor = '#0C1D49';
      const secondaryColor = '#EAF6FF';
      
      // Add company logo if available
      if (data.logo) {
        doc.image(data.logo, 50, 50, { width: 100 });
      }
      
      // Add header - "Delivery Schedule"
      doc.font('Helvetica-Bold')
         .fontSize(24)
         .fillColor(primaryColor)
         .text('Delivery Schedule', 350, 50, { align: 'right' });
      
      // Add PO details
      doc.fontSize(10)
         .text(`PO No: ${data.poNo}`, 350, 80, { align: 'right' })
         .text(`PO Date: ${data.poDate}`, 350, 95, { align: 'right' })
         .text(`Delivery Type: ${data.deliveryType}`, 350, 110, { align: 'right' })
         .text(`Payment Terms: ${data.paymentTerms}`, 350, 125, { align: 'right' });
      
      // Add company details
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text(data.companyName, 50, 130);
      
      doc.font('Helvetica')
         .fontSize(10);
      
      // Handle multiline company address
      const companyAddressLines = data.companyAddress.split('\n');
      let yPos = 145;
      companyAddressLines.forEach(line => {
        doc.text(line, 50, yPos);
        yPos += 15;
      });
      
      // Company tax info
      doc.text(`GSTIN: ${data.gstin}`, 50, yPos + 15)
         .text(`PAN NO: ${data.panNo}`, 50, yPos + 30);
      
      // Client details with background
      doc.rect(50, yPos + 60, 250, 80)
         .fill(secondaryColor);
      
      doc.fillColor('black')
         .font('Helvetica-Bold')
         .text('Issued to:', 60, yPos + 70)
         .text(data.clientName, 60, yPos + 85);
      
      doc.font('Helvetica');
      
      // Handle multiline client address
      const clientAddressLines = data.clientAddress.split('\n');
      let clientYPos = yPos + 100;
      clientAddressLines.forEach(line => {
        doc.text(line, 60, clientYPos);
        clientYPos += 15;
      });
      
      // Client GSTIN
      doc.text(`GSTIN: ${data.clientGstin}`, 60, clientYPos);
      
      // Shipping details with background
      doc.rect(50, yPos + 150, 490, 70)
         .fill(secondaryColor);
      
      doc.fillColor('black')
         .font('Helvetica-Bold')
         .text('Shipped to:', 60, yPos + 160);
      
      doc.font('Helvetica');
      
      // Handle multiline shipping address
      const shippedToLines = data.shippedTo.split('\n');
      let shippedYPos = yPos + 175;
      shippedToLines.forEach((line, index) => {
        if (index < 3) { // Limit to prevent overflow
          doc.text(line, 60, shippedYPos, { width: 470 });
          shippedYPos += 15;
        }
      });
      
      // Item Details table header
      const tableTop = yPos + 240;
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor(primaryColor)
         .text('Item Wise Delivery Schedule:', 50, tableTop);
      
      // Create header for table
      const tableHeaders = ['S. NO.', 'PARTICULARS', 'TOTAL QUANTITY', 'DELIVERY DATE', 'QUANTITY TO DELIVERY'];
      const columnWidths = [50, 180, 100, 100, 110];
      const rowHeight = 25;
      
      // Draw table headers
      doc.rect(50, tableTop + 20, 490, rowHeight)
         .fill(primaryColor);
      
      let xPos = 60;
      doc.fillColor('white');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 30);
        xPos += columnWidths[i];
      });
      
      // Group items by id to handle multiple delivery dates
      const groupedItems = new Map<number, DeliveryScheduleItem[]>();
      data.items.forEach(item => {
        if (!groupedItems.has(item.id)) {
          groupedItems.set(item.id, []);
        }
        groupedItems.get(item.id)?.push(item);
      });
      
      // Draw table rows
      let rowY = tableTop + rowHeight + 20;
      let rowCount = 0;
      
      // Process grouped items
      groupedItems.forEach((items, id) => {
        // First row for this id will contain the main details
        const firstItem = items[0];
        
        // Alternate row background
        if (rowCount % 2 === 0) {
          doc.rect(50, rowY, 490, rowHeight).fill(secondaryColor);
        }
        
        doc.fillColor('black');
        doc.text(id.toString(), 60, rowY + 7);
        doc.text(firstItem.particulars, 110, rowY + 7, { width: 170 });
        doc.text(firstItem.totalQuantity, 290, rowY + 7);
        doc.text(firstItem.deliveryDate, 390, rowY + 7);
        doc.text(firstItem.quantityToDelivery, 490, rowY + 7);
        
        rowY += rowHeight;
        rowCount++;
        
        // Additional rows for the same item (different delivery dates)
        for (let i = 1; i < items.length; i++) {
          // Alternate row background
          if (rowCount % 2 === 0) {
            doc.rect(50, rowY, 490, rowHeight).fill(secondaryColor);
          }
          
          doc.fillColor('black');
          doc.text('', 60, rowY + 7); // No ID for continuation rows
          doc.text('', 110, rowY + 7); // No particulars for continuation rows
          doc.text('', 290, rowY + 7); // No total quantity for continuation rows
          doc.text(items[i].deliveryDate, 390, rowY + 7);
          doc.text(items[i].quantityToDelivery, 490, rowY + 7);
          
          rowY += rowHeight;
          rowCount++;
        }
      });
      
      // Add terms and conditions
      const termsY = rowY + 30;
      doc.fontSize(10)
         .text('Terms and conditions:', 50, termsY);
      
      doc.fontSize(9)
         .text(data.termsAndConditions, 50, termsY + 15, { width: 400 });
      
      // Add signature if available
      if (data.signature) {
        doc.image(data.signature, 430, termsY + 20, { width: 100 });
      }
      
      doc.fontSize(10)
         .text('Authorised Signatory', 460, termsY + 130);
      
      // Add contact information
      doc.fontSize(9)
         .text(data.contactDetails, 50, termsY + 150);
      
      // Finalize the PDF
      doc.end();
      
    } catch (err) {
      console.error("Error generating PDF stream:", err);
      reject(err);
    }
  });
};
