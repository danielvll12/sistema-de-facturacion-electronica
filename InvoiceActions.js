import React from 'react';

const InvoiceActions = ({ onGenerateInvoice, onClearInvoice }) => {
  return (
    <div className="flex justify-end space-x-4 p-4 bg-white rounded-lg shadow-sm">
      <button
        onClick={onClearInvoice}
        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Limpiar Factura
      </button>
      <button
        onClick={onGenerateInvoice}
        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Generar Factura
      </button>
    </div>
  );
};

export default InvoiceActions;