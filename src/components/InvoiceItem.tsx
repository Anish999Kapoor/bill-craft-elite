
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
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3 text-sm text-left">{item.id}</td>
      <td className="px-4 py-3 text-sm text-left whitespace-pre-line">{item.particulars}</td>
      <td className="px-4 py-3 text-sm text-center">{item.hsnCode}</td>
      <td className="px-4 py-3 text-sm text-center whitespace-pre-line">{item.quantity}</td>
      <td className="px-4 py-3 text-sm text-right">{item.rate?.toFixed(2) || '0.00'}</td>
      <td className="px-4 py-3 text-sm text-right">{item.amount?.toFixed(2) || '0.00'}</td>
    </tr>
  );
};

export default InvoiceItem;
