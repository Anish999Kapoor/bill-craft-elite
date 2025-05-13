
/// <reference types="vite/client" />

declare module 'jspdf';
declare module 'jspdf-autotable';

// Add Express namespace for Express.Multer.File if needed
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}
