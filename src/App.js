import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import InvoiceHeader from './components/InvoiceHeader';
import ProductSelector from './components/ProductSelector';
import InvoiceTable from './components/InvoiceTable';
import InvoiceActions from './components/InvoiceActions';

const formatDateTime = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

const App = () => {
  const [invoiceItems, setInvoiceItems] = useState(() => {
    const savedItems = localStorage.getItem('invoiceItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const taqueriaName = "Taquería Mercy";
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));

  // Nuevo estado para el pago, vuelto y número WhatsApp
  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('invoiceItems', JSON.stringify(invoiceItems));
  }, [invoiceItems]);

  // Calcula subtotal para usarlo en el cálculo de vuelto
  const subtotal = invoiceItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  const handleAddProduct = (product) => {
    setInvoiceItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += product.quantity;
        return updatedItems;
      }
      return [...prevItems, product];
    });
  };

  const handleRemoveItem = (productId) => {
    setInvoiceItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleGenerateInvoice = () => {
    if (invoiceItems.length === 0) {
      alert('No hay productos en la factura para generar.');
      return;
    }

    if (paymentAmount === '' || Number(paymentAmount) < total) {
      alert(`El pago debe ser un número válido y mayor o igual al total $${total.toFixed(2)}.`);
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(taqueriaName, 14, 20);
    doc.setFontSize(12);
    doc.text(`Factura No: ${invoiceNumber}`, 14, 30);
    doc.text(`Fecha y Hora: ${currentDateTime}`, 14, 36);

    const tableData = invoiceItems.map(item => [
      item.name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, finalY);
    doc.text(`IVA (13%): $${iva.toFixed(2)}`, 14, finalY + 6);
    doc.text(`Total a Pagar: $${total.toFixed(2)}`, 14, finalY + 12);
    doc.text(`Pago Recibido: $${Number(paymentAmount).toFixed(2)}`, 14, finalY + 18);
    doc.text(`Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}`, 14, finalY + 24);

    doc.save(`Factura-${invoiceNumber}.pdf`);

    alert(`Factura No. ${invoiceNumber} generada y descargada con éxito!`);

    setInvoiceNumber(prevNumber => prevNumber + 1);
    setInvoiceItems([]);
    setPaymentAmount('');
    setChange(null);
  };

  const handleClearInvoice = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar la factura actual?')) {
      setInvoiceItems([]);
      setPaymentAmount('');
      setChange(null);
    }
  };

  const handleCalculateChange = () => {
    const pago = Number(paymentAmount);
    if (isNaN(pago) || pago < total) {
      alert(`Ingrese un pago válido y que sea mayor o igual al total: $${total.toFixed(2)}`);
      setChange(null);
      return;
    }
    setChange(pago - total);
  };

  // Función para enviar factura por WhatsApp usando número ingresado
  const handleSendWhatsApp = () => {
    if (invoiceItems.length === 0) {
      alert('No hay productos en la factura para enviar.');
      return;
    }

    if (paymentAmount === '' || Number(paymentAmount) < total) {
      alert(`El pago debe ser un número válido y mayor o igual al total $${total.toFixed(2)}.`);
      return;
    }

    if (!whatsappNumber.match(/^\d{8,15}$/)) {
      alert('Por favor ingresa un número de WhatsApp válido sin signos ni espacios (solo números, 8 a 15 dígitos).');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(taqueriaName, 14, 20);
    doc.setFontSize(12);
    doc.text(`Factura No: ${invoiceNumber}`, 14, 30);
    doc.text(`Fecha y Hora: ${currentDateTime}`, 14, 36);

    const tableData = invoiceItems.map(item => [
      item.name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, finalY);
    doc.text(`IVA (13%): $${iva.toFixed(2)}`, 14, finalY + 6);
    doc.text(`Total a Pagar: $${total.toFixed(2)}`, 14, finalY + 12);
    doc.text(`Pago Recibido: $${Number(paymentAmount).toFixed(2)}`, 14, finalY + 18);
    doc.text(`Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}`, 14, finalY + 24);

    // Generar Blob y URL temporal para compartir
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Armar mensaje
    let message = `*Factura No:* ${invoiceNumber}\n`;
    message += `*Fecha y Hora:* ${currentDateTime}\n\n`;
    message += `Productos:\n`;
    invoiceItems.forEach(item => {
      message += `- ${item.name} x${item.quantity} = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    message += `\nSubtotal: $${subtotal.toFixed(2)}\n`;
    message += `IVA (13%): $${iva.toFixed(2)}\n`;
    message += `Total: $${total.toFixed(2)}\n`;
    message += `Pago recibido: $${Number(paymentAmount).toFixed(2)}\n`;
    message += `Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}\n\n`;
   

    const encodedMessage = encodeURIComponent(message);
    // Usar el número para abrir chat directo
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Limpiar URL temporal después de 1 minuto
   
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <InvoiceHeader
          taqueriaName={taqueriaName}
          invoiceNumber={invoiceNumber}
          invoiceDate={currentDateTime}
        />
        <ProductSelector onAddProduct={handleAddProduct} />
        <InvoiceTable items={invoiceItems} onRemoveItem={handleRemoveItem} />

        {/* Campo para pago y botón para calcular vuelto */}
        <div className="my-4 p-4 bg-white rounded shadow">
          <label className="block mb-2 font-semibold">
            Pago recibido:
            <input
              type="number"
              min={0}
              step="0.01"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              className="ml-2 border rounded p-1 w-32"
              placeholder="Ej. 50.00"
            />
          </label>
          <button
            onClick={handleCalculateChange}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Calcular Vuelto
          </button>

          {change !== null && (
            <p className="mt-3 text-lg font-bold">
              Vuelto: ${change.toFixed(2)}
            </p>
          )}
        </div>

        {/* Campo para ingresar número de WhatsApp */}
        <div className="my-4 p-4 bg-white rounded shadow">
          <label className="block mb-2 font-semibold">
            Número de WhatsApp (solo números, sin + ni espacios):
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              className="mt-1 border rounded p-1 w-48"
              placeholder="Ej. 50371234567"
            />
          </label>
        </div>

        <InvoiceActions
          onGenerateInvoice={handleGenerateInvoice}
          onClearInvoice={handleClearInvoice}
        />

        {/* Botón para enviar factura por WhatsApp */}
        <div className="mt-4">
          <button
            onClick={handleSendWhatsApp}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Enviar factura por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
