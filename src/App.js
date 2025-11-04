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
  const taqueriaAddress = "3era calle oriente 6 av. norte, media cuadra arriba de CAESS, Cojutepeque, Cuscatlán"; 
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));

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

  const subtotal = invoiceItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const total = subtotal;

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

  const drawTicketBorder = (doc, contentHeight) => {
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageWidth - margin * 2, contentHeight);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Nombre de taquería centrado
    doc.setFontSize(18);
    doc.text(taqueriaName, pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(12);
    doc.text(`Factura No: ${invoiceNumber}`, 14, y);
    y += 6;
    doc.text(`Fecha y Hora: ${currentDateTime}`, 14, y);
    y += 10;

    // Tabla de productos
    const tableData = invoiceItems.map(item => [
      item.name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
      body: tableData,
    });

    y = doc.lastAutoTable.finalY + 10;

    // Totales
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Total a Pagar: $${total.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Pago Recibido: $${Number(paymentAmount).toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}`, 14, y);
    y += 10;

    // Mensajes al final
    doc.setFontSize(14);
    doc.text("¡Gracias por su compra!", 14, y);
    y += 6;
    doc.text("¡Vuelva pronto!", 14, y);
    y += 10;

    // Dirección al final
    doc.setFontSize(12);
    doc.text(`Dirección: ${taqueriaAddress}`, 14, y);

    // Dibujar borde alrededor de todo el ticket
    drawTicketBorder(doc, y + 10);

    return doc;
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

    const doc = generatePDF();
    doc.save(`Factura-${invoiceNumber}.pdf`);

    alert(`Factura No. ${invoiceNumber} generada y descargada con éxito!`);

    setInvoiceNumber(prev => prev + 1);
    setInvoiceItems([]);
    setPaymentAmount('');
    setChange(null);
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

  const handleClearInvoice = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar la factura actual?')) {
      setInvoiceItems([]);
      setPaymentAmount('');
      setChange(null);
    }
  };

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

    const doc = generatePDF();

    // Generar URL temporal
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Solo mensaje de texto con resumen
    let message = `*Factura No:* ${invoiceNumber}\n`;
    message += `*Fecha y Hora:* ${currentDateTime}\n\n`;
    message += `Productos:\n`;
    invoiceItems.forEach(item => {
      message += `- ${item.name} x${item.quantity} = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    message += `\nSubtotal: $${subtotal.toFixed(2)}\n`;
    message += `Total: $${total.toFixed(2)}\n`;
    message += `Pago recibido: $${Number(paymentAmount).toFixed(2)}\n`;
    message += `Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}\n\n`;
    message += "¡Gracias por su compra!\n¡Vuelva pronto!";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
