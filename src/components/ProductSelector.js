import React, { useState } from 'react';
import { taqueriaProducts } from '../mock/products';
import { formatCurrency } from '../utils/formatters';

const ProductSelector = ({ onAddProduct }) => {
  const [selectedProduct, setSelectedProduct] = useState('');

  const handleSelect = (productId) => {
    if (productId) {
      const product = taqueriaProducts.find(p => p.id === productId);
      if (product) {
        onAddProduct({ ...product, quantity: 1 });
        setSelectedProduct(''); // Reinicia la selección después de agregar
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Agregar Producto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          value={selectedProduct}
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">Selecciona un producto</option>
          {taqueriaProducts.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} ({formatCurrency(product.price)})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductSelector;
