import React, { useState } from 'react';
import { taqueriaProducts } from '../mock/products';
import { formatCurrency } from '../utils/formatters';

const ProductSelector = ({ onAddProduct }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (selectedProduct && quantity > 0) {
      const product = taqueriaProducts.find(p => p.id === selectedProduct);
      if (product) {
        onAddProduct({ ...product, quantity: parseInt(quantity, 10) });
        setSelectedProduct('');
        setQuantity(1);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Agregar Producto</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Selecciona un producto</option>
          {taqueriaProducts.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} ({formatCurrency(product.price)})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Añadir a Factura
        </button>
      </div>
    </div>
  );
};

export default ProductSelector;