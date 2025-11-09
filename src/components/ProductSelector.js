import React, { useState } from 'react';
import { taqueriaProducts } from '../mock/products';
import { formatCurrency } from '../utils/formatters';

const ProductSelector = ({ onAddProduct }) => {
  const [selectedProduct, setSelectedProduct] = useState("");

  const handleChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);

    // Evita agregar si es la opción vacía
    if (!productId) return;

    const product = taqueriaProducts.find(p => p.id === productId);

    if (product) {
      onAddProduct(product);
    }

    // Regresa el select a la opción inicial
    setSelectedProduct("");
  };

  return (
    <div>
      <select value={selectedProduct} onChange={handleChange}>
        <option value="">Selecciona un producto</option>
        {taqueriaProducts.map(product => (
          <option key={product.id} value={product.id}>
            {product.name} ({formatCurrency(product.price)})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductSelector;
