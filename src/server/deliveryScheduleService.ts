
import express from 'express';
import multer from 'multer';
import { generateDeliverySchedulePDF, streamDeliverySchedulePDF, DeliveryScheduleData } from '../utils/pdfGeneratorServer';

// Setup file upload for logo and signature
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Sample data for preview
const sampleData: DeliveryScheduleData = {
  companyName: 'Company Name',
  companyAddress: 'Plot No. 70, B-Block, Ground Floor, Lions Enclave,\nVikas Nagar, Uttam Nagar, New Delhi-110059',
  poNo: '224',
  poDate: '25/07/2024',
  deliveryType: 'Multiple',
  paymentTerms: 'x days',
  gstin: '07APJPK9045B1ZY',
  panNo: '07APJPK9045B',
  clientName: 'M/s: Dealberg Technologies Pvt Ltd',
  clientAddress: '2751, 31st main road\nPWD Quarters 1st Sector HSR Layout, Bangalore,\nKarnataka 560102 India',
  clientGstin: '29AAFCD7015E1ZT',
  shippedTo: 'VOI JEANS RETAIL INDIA PVT LTD SF/ 43/44/45 D3/4/A-3/10/11 1 ST PHASE DODDABALLAPURA INDUSTRIAL AREA, KASABA HOBLI BANGALORE NOTH TALUK, DODDABALLAPURA, Bangalore 561203 Karnataka India',
  items: [
    {
      id: 1,
      particulars: 'HDPE Bags\nSize - 30"x45"',
      totalQuantity: '400',
      deliveryDate: '2/3/25',
      quantityToDelivery: '100'
    },
    {
      id: 1,
      particulars: 'HDPE Bags\nSize - 30"x45"',
      totalQuantity: '400',
      deliveryDate: '10/3/25',
      quantityToDelivery: '200'
    },
    {
      id: 2,
      particulars: 'HDPE Bags\nSize - 23"x45"',
      totalQuantity: '100',
      deliveryDate: '2/3/25',
      quantityToDelivery: '100'
    }
  ],
  contactDetails: 'Mob: +919205279117, +919810676451',
  termsAndConditions: 'VOI JEANS RETAIL INDIA PVT LTD SF/ 43/44/45 D3/4/A-3/10/11 1 ST PHASE DODDABALLAPURA INDUSTRIAL AREA, KASABA HOBLI BANGALORE NOTH TALUK, DODDABALLAPURA, Bangalore 561203 Karnataka India',
  signature: null,
  logo: null
};

// Endpoint to generate delivery schedule PDF
router.post('/generate', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Get data from request body
    const data: DeliveryScheduleData = {
      ...req.body,
      items: JSON.parse(req.body.items || '[]'),
      logo: files?.logo?.[0]?.buffer || null,
      signature: files?.signature?.[0]?.buffer || null
    };
    
    // Generate PDF
    const pdfBuffer = await generateDeliverySchedulePDF(data);
    
    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=delivery-schedule-${data.poNo}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating delivery schedule:', error);
    res.status(500).json({ error: 'Failed to generate delivery schedule PDF' });
  }
});

// Endpoint to preview delivery schedule PDF using sample data
router.get('/preview', async (req, res) => {
  try {
    // Generate PDF with sample data
    const pdfBuffer = await generateDeliverySchedulePDF(sampleData);
    
    // Send PDF as inline preview
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=delivery-schedule-preview.pdf');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview PDF' });
  }
});

export default router;
