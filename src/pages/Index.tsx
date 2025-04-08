
import React, { useState, useEffect } from 'react';
import Invoice from '../components/Invoice';
import { InvoiceItemType } from '../components/InvoiceItem';
import { useToast } from '@/components/ui/use-toast';

// Define the API response type
interface InvoiceDataResponse {
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
}

const Index = () => {
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState<InvoiceDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Placeholder API URL - replace with your actual backend URL
  const API_URL = 'https://your-backend-api-url.com/invoice';

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        // Attempt to fetch data from the backend
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setInvoiceData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invoice data:', err);
        setError('Failed to load invoice data. Please try again later.');
        setLoading(false);
        
        toast({
          title: "Error",
          description: "Failed to load invoice data. Using sample data instead.",
          variant: "destructive",
        });
        
        // Fallback to sample data if API fails
        useSampleData();
      }
    };

    fetchInvoiceData();
  }, [toast]);

  // Function to use sample data as fallback
  const useSampleData = () => {
    const sampleInvoiceItems: InvoiceItemType[] = [
      {
        id: 1,
        particulars: 'HDPE Bags\nSize - 30"x45"',
        hsnCode: '3923',
        quantity: '2000\nunits',
        rate: 16.50,
        amount: 33000,
      },
    ];

    const sampleData = {
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
      items: sampleInvoiceItems,
      subtotal: 33000,
      igstRate: 18,
      igstAmount: 5940,
      totalAmount: 28940,
      advance: -10000,
      refNo: '2247',
      contactDetails: 'Mob: +919205279117, +919810676451',
      emailDetails: 'Email: contact@motherbags.in',
    };

    setInvoiceData(sampleData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0C1D49] mx-auto"></div>
          <p className="mt-4 text-lg text-[#0C1D49]">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  if (error && !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#0C1D49] text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {invoiceData && <Invoice invoiceData={invoiceData} />}
    </div>
  );
};

export default Index;
