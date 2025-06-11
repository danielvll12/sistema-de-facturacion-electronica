import React from 'react';
import { formatCurrency } from '../utils/formatters';

const InvoiceTable = ({ items, onRemoveItem }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.13; // IVA en El Salvador
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalle de Factura</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.price)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.price * item.quantity)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">Subtotal:</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(subtotal)}</td>
            <td></td>
          </tr>
          <tr>
            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">IVA (13%):</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(taxAmount)}</td>
            <td></td>
          </tr>
          <tr className="bg-gray-50">
            <td colSpan="3" className="px-6 py-4 text-right text-lg font-bold text-gray-900">Total:</td>
            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">{formatCurrency(total)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default InvoiceTable;