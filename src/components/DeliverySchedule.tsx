
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { Button } from "@/components/ui/button";
import { Printer, FileText, Download } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

interface DeliveryScheduleItem {
  id: number;
  particulars: string;
  totalQuantity: string;
  deliveryDate: string;
  quantityToDelivery: string;
}

interface DeliveryScheduleItemProps {
  item: DeliveryScheduleItem;
  isFirstRow?: boolean;
}

const DeliveryScheduleItem: React.FC<DeliveryScheduleItemProps> = ({ item, isFirstRow = true }) => {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-sm text-left">{isFirstRow ? item.id : ''}</td>
      <td className="px-4 py-3 text-sm text-left whitespace-pre-line">{isFirstRow ? item.particulars : ''}</td>
      <td className="px-4 py-3 text-sm text-center">{isFirstRow ? item.totalQuantity : ''}</td>
      <td className="px-4 py-3 text-sm text-center">{item.deliveryDate}</td>
      <td className="px-4 py-3 text-sm text-right">{item.quantityToDelivery}</td>
    </tr>
  );
};

interface DeliveryScheduleProps {
  scheduleData: {
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
  };
}

const DeliverySchedule: React.FC<DeliveryScheduleProps> = ({ scheduleData }) => {
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
        description: "Please wait while we create your delivery schedule PDF...",
      });

      // TODO: Implement API call to generate and download PDF
      // This would be implemented in a real application
      
      toast({
        title: "PDF Generated",
        description: "Your delivery schedule PDF has been downloaded.",
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

  // Group items by id to handle multiple delivery dates
  const groupedItems = new Map<number, DeliveryScheduleItem[]>();
  scheduleData.items.forEach(item => {
    if (!groupedItems.has(item.id)) {
      groupedItems.set(item.id, []);
    }
    groupedItems.get(item.id)?.push(item);
  });

  // Convert grouped items to an array for rendering
  const groupedItemsArray = Array.from(groupedItems.entries());

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center py-4 px-6 bg-white print:hidden">
        <h1 className="text-2xl font-bold text-blue-900">Delivery Schedule Generator</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-blue-900 hover:bg-opacity-90">
            <Download className="mr-2 h-4 w-4" /> {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button onClick={handlePrint} className="bg-blue-900 hover:bg-opacity-90">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-lg mx-auto my-8 max-w-5xl w-full p-8 print:shadow-none print:my-0 print:mx-0 print:max-w-none print:p-0" id="delivery-schedule">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-6">
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
            <h1 className="text-3xl font-bold text-blue-900 mb-1">Delivery Schedule</h1>
            <div className="text-gray-600">
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">PO No:</span>
                <span>{scheduleData.poNo}</span>
              </div>
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">PO Date:</span>
                <span>{scheduleData.poDate}</span>
              </div>
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">Delivery Type:</span>
                <span>{scheduleData.deliveryType}</span>
              </div>
              <div className="flex justify-end items-center space-x-4 mb-1">
                <span className="font-semibold">Payment Terms:</span>
                <span>{scheduleData.paymentTerms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company and Client Details */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-blue-900">{scheduleData.companyName}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{scheduleData.companyAddress}</p>
            <p className="text-sm"><span className="font-semibold">GSTIN:</span> {scheduleData.gstin}</p>
            <p className="text-sm"><span className="font-semibold">PAN NO:</span> {scheduleData.panNo}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-bold mb-2">Issued to:</h3>
            <h2 className="text-lg font-semibold">{scheduleData.clientName}</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{scheduleData.clientAddress}</p>
            <p className="text-sm mt-2"><span className="font-semibold">GSTIN:</span> {scheduleData.clientGstin}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mt-6 bg-blue-50 p-4 rounded-md">
          <h3 className="font-bold mb-2">Shipped to:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{scheduleData.shippedTo}</p>
        </div>

        {/* Table */}
        <div className="mt-8">
          <div className="uppercase text-sm font-bold text-blue-900 mb-2">Item Wise Delivery Schedule:</div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">S. NO.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">PARTICULARS</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">TOTAL QUANTITY</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">DELIVERY DATE</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">QUANTITY TO DELIVERY</th>
              </tr>
            </thead>
            <tbody>
              {groupedItemsArray.map(([id, items]) => (
                items.map((item, index) => (
                  <DeliveryScheduleItem 
                    key={`${id}-${index}`} 
                    item={item} 
                    isFirstRow={index === 0} 
                  />
                ))
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms and conditions */}
        <div className="mt-6">
          <h3 className="font-bold mb-2">Terms and conditions:</h3>
          <p className="text-sm text-gray-600">
            {scheduleData.termsAndConditions}
          </p>
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
            <p className="text-blue-900 font-semibold mt-2">Authorised Signatory</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-sm text-gray-600 border-t border-gray-300 pt-4">
          <p>{scheduleData.contactDetails}</p>
        </div>
      </div>
    </div>
  );
};

export default DeliverySchedule;
