import React from 'react';

const InvoiceHeader = ({ taqueriaName, invoiceNumber, invoiceDate }) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{taqueriaName}</h1>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Factura No. <span className="font-semibold">{invoiceNumber}</span></span>
        <span>Fecha: <span className="font-semibold">{invoiceDate}</span></span>
      </div>
    </div>
  );
};

export default InvoiceHeader;