
import React from 'react';

export interface InvoiceItemType {
  id: number;
  particulars: string;
  hsnCode: string;
  quantity: string;
  rate: number;
  amount: number;
}

interface InvoiceItemProps {
  item: InvoiceItemType;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({ item }) => {
  // Ensure all fields have safe fallback values for PDF generation
  const safeItem = {
    id: item.id || 0,
    particulars: item.particulars || '',
    hsnCode: item.hsnCode || '',
    quantity: item.quantity || '',
    rate: item.rate || 0,
    amount: item.amount || 0
  };

  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-sm text-left">{safeItem.id}</td>
      <td className="px-4 py-3 text-sm text-left whitespace-pre-line">{safeItem.particulars}</td>
      <td className="px-4 py-3 text-sm text-center">{safeItem.hsnCode}</td>
      <td className="px-4 py-3 text-sm text-center whitespace-pre-line">{safeItem.quantity}</td>
      <td className="px-4 py-3 text-sm text-right">{safeItem.rate.toFixed(2)}</td>
      <td className="px-4 py-3 text-sm text-right">{safeItem.amount.toFixed(2)}</td>
    </tr>
  );
};

export default InvoiceItem;
