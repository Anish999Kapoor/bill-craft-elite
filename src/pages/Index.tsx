
import React from 'react';
import Invoice from '../components/Invoice';
import { InvoiceItemType } from '../components/InvoiceItem';

const Index = () => {
  // Sample invoice data based on the provided information
  const invoiceItems: InvoiceItemType[] = [
    {
      id: 1,
      particulars: 'HDPE Bags\nSize - 30"x45"',
      hsnCode: '3923',
      quantity: '2000\nunits',
      rate: 16.50,
      amount: 33000,
    },
  ];

  const invoiceData = {
    companyName: 'Company Name',
    companyAddress: 'Plot No. 70, B-Block, Ground Floor, Lions Enclave, Vikas Nagar, Uttam Nagar, New Delhi-110059',
    poNo: '2247',
    poDate: '25/07/2024',
    gstin: '07APJPK9045B1ZY',
    panNo: '07APJPK9045B',
    clientName: 'M/s: Dealberg Technologies Pvt Ltd',
    clientAddress: '2751, 31st main road PWD Quarters 1st Sector HSR Layout, Bangalore, Karnataka 560102 India',
    clientGstin: '29AAFCD7015E1ZT',
    shippedTo: 'VOI JEANS RETAIL INDIA PVT LTD SF/ 43/44/45 D3/4/A-3/10/11 1 ST PHASE DODDABALLAPURA INDUSTRIAL AREA, KASABA HOBLI BANGALORE NOTH TALUK , DODDABALLAPURA, Bangalore 561203 Karnataka India',
    deliveryDate: '31/07/24 or Multiple',
    paymentTerms: 'x days',
    items: invoiceItems,
    subtotal: 33000,
    igstRate: 18,
    igstAmount: 5940,
    totalAmount: 28940,
    advance: -10000,
    refNo: '2247',
    contactDetails: 'Mob: +919205279117, +919810676451',
    emailDetails: 'Email: contact@motherbags.in',
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Invoice invoiceData={invoiceData} />
    </div>
  );
};

export default Index;
