
/**
 * This is a sample client for mobile app integration
 * You would implement this in your mobile app (React Native, Flutter, etc.)
 */

interface DeliveryItem {
  id: number;
  particulars: string;
  totalQuantity: string;
  deliveryDate: string;
  quantityToDelivery: string;
}

interface DeliveryScheduleRequest {
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
  items: DeliveryItem[];
  contactDetails: string;
  termsAndConditions: string;
  logo?: File | null;
  signature?: File | null;
}

export async function generateDeliverySchedule(data: DeliveryScheduleRequest, apiBaseUrl: string): Promise<Blob> {
  // Create form data to send files and JSON data together
  const formData = new FormData();
  
  // Add all text fields
  Object.keys(data).forEach(key => {
    if (key !== 'logo' && key !== 'signature' && key !== 'items') {
      formData.append(key, data[key as keyof DeliveryScheduleRequest] as string);
    }
  });
  
  // Add items as JSON string
  formData.append('items', JSON.stringify(data.items));
  
  // Add files if available
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  
  if (data.signature) {
    formData.append('signature', data.signature);
  }
  
  // Send request to the API
  const response = await fetch(`${apiBaseUrl}/delivery-schedule/generate`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate delivery schedule: ${response.statusText}`);
  }
  
  // Return PDF as blob
  return await response.blob();
}

// Function to preview the generated PDF
export async function previewPDF(blob: Blob): Promise<string> {
  // Create object URL for preview
  return URL.createObjectURL(blob);
}

// Function to download the generated PDF
export async function downloadPDF(blob: Blob, fileName: string): Promise<void> {
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'delivery-schedule.pdf';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Function to add a new delivery date for an existing item
export function addDeliveryDateToItem(
  items: DeliveryItem[],
  itemId: number,
  newDeliveryDate: string,
  newQuantityToDelivery: string
): DeliveryItem[] {
  // Create a copy of the items array
  const updatedItems = [...items];
  
  // Find the original item to copy its details
  const originalItem = items.find(item => item.id === itemId);
  
  if (originalItem) {
    // Create a new delivery entry for the same item
    const newDeliveryItem: DeliveryItem = {
      id: itemId,
      particulars: originalItem.particulars,
      totalQuantity: originalItem.totalQuantity,
      deliveryDate: newDeliveryDate,
      quantityToDelivery: newQuantityToDelivery
    };
    
    // Add to the items array
    updatedItems.push(newDeliveryItem);
  }
  
  return updatedItems;
}

// Function to validate that total quantities match across delivery dates
export function validateDeliveryQuantities(items: DeliveryItem[]): boolean {
  // Group items by ID
  const groupedItems = new Map<number, DeliveryItem[]>();
  items.forEach(item => {
    if (!groupedItems.has(item.id)) {
      groupedItems.set(item.id, []);
    }
    groupedItems.get(item.id)?.push(item);
  });
  
  // Check each group
  for (const [_, groupItems] of groupedItems.entries()) {
    if (groupItems.length > 0) {
      const totalQty = parseInt(groupItems[0].totalQuantity) || 0;
      let deliveryQtySum = 0;
      
      groupItems.forEach(item => {
        deliveryQtySum += parseInt(item.quantityToDelivery) || 0;
      });
      
      // If sum of delivery quantities doesn't match total quantity, return false
      if (deliveryQtySum !== totalQty) {
        return false;
      }
    }
  }
  
  return true;
}
