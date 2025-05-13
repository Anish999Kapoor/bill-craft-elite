
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import InvoiceItem, { InvoiceItemType } from './InvoiceItem';
import { Button } from "@/components/ui/button";
import { Printer, FileText, Download } from "lucide-react";
import generatePDF from '../utils/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';

interface InvoiceProps {
  invoiceData: {
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
  };
}

const Invoice: React.FC<InvoiceProps> = ({ invoiceData }) => {
  const { toast } = useToast();
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your invoice PDF...",
      });

      // Generate PDF using our utility
      const pdfData = {
        ...invoiceData,
        companyLogo,
        signature
      };
      
      const pdfUrl = await generatePDF(pdfData);
      
      // Create an anchor element and trigger the download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `Invoice-${invoiceData.poNo}.pdf`;
      link.click();
      
      toast({
        title: "PDF Generated",
        description: "Your invoice PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center py-4 px-6 bg-white print:hidden">
        <h1 className="text-2xl font-bold text-invoice-dark">Invoice Generator</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-invoice-dark hover:bg-opacity-90">
            <Download className="mr-2 h-4 w-4" /> {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button onClick={handlePrint} className="bg-invoice-dark hover:bg-opacity-90">
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-lg mx-auto my-8 max-w-5xl w-full p-8 print:shadow-none print:my-0 print:mx-0 print:max-w-none print:p-0" id="invoice">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-invoice-dark pb-6">
          <div className="w-40 h-24">
            <FileUpload
              id="company-logo"
              label="Add Company Logo"
              onFileSelect={(file) => setCompanyLogo(file)}
              className="print:hidden"
            />
            {companyLogo && <div className="hidden print:block">
              <img 
                src={URL.createObjectURL(companyLogo)} 
                alt="Company Logo" 
                className="max-h-24 max-w-full object-contain" 
              />
            </div>}
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-invoice-dark mb-1">Purchase Order</h1>
            <div className="text-gray-600">
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">PO No:</span>
                <span>{invoiceData.poNo}</span>
              </div>
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">PO Date:</span>
                <span>{invoiceData.poDate}</span>
              </div>
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">Ref No:</span>
                <span>{invoiceData.refNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company and Client Details */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-invoice-dark">{invoiceData.companyName}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.companyAddress}</p>
            <p className="text-sm"><span className="font-semibold">GSTIN:</span> {invoiceData.gstin}</p>
            <p className="text-sm"><span className="font-semibold">PAN NO:</span> {invoiceData.panNo}</p>
          </div>

          <div className="bg-invoice-light p-4 rounded-md">
            <h3 className="font-bold mb-2">Issued to:</h3>
            <h2 className="text-lg font-semibold">{invoiceData.clientName}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{invoiceData.clientAddress}</p>
            <p className="text-sm mt-2"><span className="font-semibold">GSTIN:</span> {invoiceData.clientGstin}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mt-6 bg-invoice-light p-4 rounded-md">
          <h3 className="font-bold mb-2">Shipped to:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.shippedTo}</p>
        </div>

        {/* Delivery and Payment Details */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Delivery Date:</span>
              <span>{invoiceData.deliveryDate}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Payment Terms:</span>
              <span>{invoiceData.paymentTerms}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8">
          <div className="uppercase text-sm font-bold text-invoice-dark mb-2">Item Details:</div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-invoice-dark text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">S. NO.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">PARTICULARS</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">DELIVERY SCHEDULE</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">QUANTITY</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">RATE</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">AMOUNT(Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <InvoiceItem key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Sub Total</span>
              <span>{invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">IGST @ {invoiceData.igstRate}%</span>
              <span>{invoiceData.igstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Advance</span>
              <span>{invoiceData.advance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-invoice-dark pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{invoiceData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-right">
            <div className="w-40 h-24 ml-auto">
              <FileUpload
                id="signature"
                label="Add Signature"
                onFileSelect={(file) => setSignature(file)}
                className="print:hidden"
              />
              {signature && <div className="hidden print:block">
                <img 
                  src={URL.createObjectURL(signature)} 
                  alt="Authorised Signature" 
                  className="max-h-24 max-w-full object-contain ml-auto" 
                />
              </div>}
            </div>
            <p className="text-invoice-dark font-semibold mt-2">Authorised Signatory</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-sm text-gray-600 border-t border-gray-300 pt-4">
          <p>{invoiceData.contactDetails}</p>
          <p>{invoiceData.emailDetails}</p>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-6">
          <h3 className="font-bold mb-2">Terms and conditions:</h3>
          <p className="text-sm text-gray-600">
            {invoiceData.shippedTo}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
