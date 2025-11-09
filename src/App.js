// src/App.js
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import InvoiceHeader from './components/InvoiceHeader';
import ProductSelector from './components/ProductSelector';
import InvoiceTable from './components/InvoiceTable';
import InvoiceActions from './components/InvoiceActions';
import { useDailySales } from './hooks/useDailySales';
import './styles.css';

function reiniciarFacturaCada24Horas() {
  const hoy = new Date().toLocaleDateString();
  const ultimaFecha = localStorage.getItem("fechaFactura");

  if (ultimaFecha !== hoy) {
    localStorage.setItem("fechaFactura", hoy);
    localStorage.setItem(INVOICE_KEY, "1"); // reinicia el contador
  }
}


reiniciarFacturaCada24Horas();


const formatDateTime = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

const INVOICE_KEY = "taqueria_invoice_number_v1";

const App = () => {
  const [invoiceItems, setInvoiceItems] = useState(() => {
    const savedItems = localStorage.getItem('invoiceItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  // invoiceNumber persistence
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    try {
      const saved = localStorage.getItem(INVOICE_KEY);
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

  const taqueriaName = "Taquería Mercy";
  const taqueriaAddress = "3era calle oriente 6 av. norte, media cuadra arriba de CAESS, Cojutepeque, Cuscatlán";
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));

  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [clientName, setClientName] = useState('');

  // daily sales hook
  const { sales, registerSale, resetSales, getTotalDailySales } = useDailySales();

  // snow (navideño) kept from your previous version if needed
  useEffect(() => {
    const snowContainer = document.createElement("div");
    snowContainer.className = "snow-container";
    document.body.appendChild(snowContainer);

    const snowflakes = "❄️❅❆";
    for (let i = 0; i < 25; i++) {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      snowflake.style.left = `${Math.random() * 100}vw`;
      snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
      snowflake.style.fontSize = `${Math.random() * 20 + 10}px`;
      snowContainer.appendChild(snowflake);
    }

    return () => document.body.removeChild(snowContainer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('invoiceItems', JSON.stringify(invoiceItems));
  }, [invoiceItems]);

  // persist invoice number
  useEffect(() => {
    try {
      localStorage.setItem(INVOICE_KEY, invoiceNumber.toString());
    } catch (e) {
      console.error("Error saving invoice number", e);
    }
  }, [invoiceNumber]);

  const subtotal = invoiceItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const total = subtotal;

const handleAddProduct = (product) => {
  setInvoiceItems(prevItems => {
    const existingItem = prevItems.find(item => item.id === product.id);

    if (existingItem) {
      return prevItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prevItems, { ...product, quantity: 1 }];
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

    doc.setFontSize(18);
    doc.text(taqueriaName, pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(12);
    doc.text(`Factura No: ${invoiceNumber}`, 14, y);
    y += 6;
    doc.text(`Fecha y Hora: ${currentDateTime}`, 14, y);
    y += 6;
    if (clientName) {
      doc.text(`Cliente: ${clientName}`, 14, y);
      y += 6;
    }

    y += 4;

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

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Total a Pagar: $${total.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Pago Recibido: $${Number(paymentAmount).toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}`, 14, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("¡Gracias por su compra!", 14, y);
    y += 6;
    doc.text("¡Vuelva pronto y Feliz Navidad!", 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Dirección: ${taqueriaAddress}`, 14, y);

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

    // Register sale in daily sales
    const saleRecord = {
      invoiceNumber,
      dateISO: new Date().toISOString(),
      dateReadable: currentDateTime,
      clientName: clientName || '',
      items: invoiceItems,
      total: Number(total),
      payment: Number(paymentAmount),
      change: change !== null ? Number(change) : 0,
      whatsapp: whatsappNumber || ''
    };
    registerSale(saleRecord);

    alert(`Factura No. ${invoiceNumber} generada y guardada en ventas diarias.`);

    setInvoiceNumber(prev => prev + 1);
    setInvoiceItems([]);
    setPaymentAmount('');
    setChange(null);
    setClientName('');
    setWhatsappNumber('');
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
      alert('Por favor ingresa un número de WhatsApp válido sin signos ni espacios.');
      return;
    }

    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    let message = `*Factura No:* ${invoiceNumber}\n`;
    message += `*Fecha y Hora:* ${currentDateTime}\n\n`;
    if (clientName) message += `Cliente: ${clientName}\n\n`;
    message += `Productos:\n`;
    invoiceItems.forEach(item => {
      message += `- ${item.name} x${item.quantity} = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    message += `\nTotal: $${total.toFixed(2)}\nPago: $${Number(paymentAmount).toFixed(2)}\n`;
    message += `Vuelto: $${change !== null ? change.toFixed(2) : '0.00'}\n\n`;
    message += " ¡Gracias por su compra y Feliz Navidad! ";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Nota: no es posible adjuntar el PDF automáticamente al abrir wa.me (sin usar API).
    // Abrimos el chat con el mensaje. El usuario podrá adjuntar el PDF manualmente (desde descargas).
    window.open(whatsappUrl, '_blank');
  };

  // Export sales to CSV
  const exportSalesToCSV = () => {
    if (!sales || sales.length === 0) {
      alert("No hay ventas para exportar.");
      return;
    }

    const header = ["Factura", "Fecha", "Cliente", "Total", "Pago", "Vuelto", "Items"];
    const rows = sales.map(s => {
      const itemsText = s.items.map(it => `${it.name} x${it.quantity}`).join(" | ");
      return [s.invoiceNumber, s.dateReadable || s.dateISO, s.clientName || "", s.total.toFixed(2), (s.payment||0).toFixed(2), (s.change||0).toFixed(2), itemsText];
    });

    const csvContent = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_diarias_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-200 via-green-100 to-red-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center text-3xl font-bold text-red-600 mb-4 animate-bounce">
          🎄 ¡Taquería Mercy — Caja Registradora! 🌮
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <InvoiceHeader
              taqueriaName={taqueriaName}
              invoiceNumber={invoiceNumber}
              invoiceDate={currentDateTime}
            />

            <ProductSelector onAddProduct={handleAddProduct} />
            <InvoiceTable items={invoiceItems} onRemoveItem={handleRemoveItem} />

            <div className="my-4 p-4 bg-green-50 rounded shadow">
              <label className="block mb-2 font-semibold text-green-900">
                Cliente (opcional):
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="ml-2 border rounded p-1 w-48"
                  placeholder="Ej. Juan Pérez"
                />
              </label>

              <label className="block mb-2 font-semibold text-green-900">
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
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Calcular Vuelto
              </button>

              {change !== null && (
                <p className="mt-3 text-lg font-bold text-green-800">
                  Vuelto: ${change.toFixed(2)}
                </p>
              )}
            </div>

            <div className="my-4 p-4 bg-green-50 rounded shadow">
              <label className="block mb-2 font-semibold text-green-900">
                Número de WhatsApp (solo números):
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="mt-1 border rounded p-1 w-48"
                  placeholder="50371234567"
                />
              </label>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={handleSendWhatsApp}
                  className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
                >
                  Enviar factura por WhatsApp 🎁
                </button>

                <button
                  onClick={handleGenerateInvoice}
                  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                >
                  Generar factura (PDF) y registrar venta ✔️
                </button>

                <button
                  onClick={handleClearInvoice}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Limpiar factura
                </button>
              </div>
            </div>
          </div>

          <aside>
            <div className="p-4 bg-white rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-2">Resumen</h2>
              <p>Total a pagar: <strong>${total.toFixed(2)}</strong></p>
              <div className="total mt-4">Vendido hoy: <strong>${getTotalDailySales().toFixed(2)}</strong></div>

              <div className="mt-4">
                <button onClick={exportSalesToCSV} className="bg-yellow-600 text-white px-4 py-2 rounded">
                  Exportar ventas a CSV
                </button>
                <button onClick={resetSales} className="ml-2 bg-red-600 text-white px-4 py-2 rounded">
                  Eliminar ventas del día
                </button>
              </div>

              <div className="mt-6 max-h-72 overflow-auto">
                <h3 className="font-semibold mb-2">Ventas registradas</h3>
                {sales.length === 0 && <p className="text-sm text-gray-500">Aún no hay ventas registradas.</p>}
                <ul className="space-y-2">
                  {sales.slice().reverse().map((s, idx) => (
                    <li key={`${s.invoiceNumber}-${s.dateISO || idx}`} className="p-2 border rounded">
                      <div className="text-sm text-gray-600">Factura: {s.invoiceNumber} — {s.dateReadable || new Date(s.dateISO).toLocaleString()}</div>
                      <div className="font-medium">Total: ${Number(s.total).toFixed(2)}</div>
                      {s.clientName && <div className="text-sm">Cliente: {s.clientName}</div>}
                      <div className="text-xs text-gray-700 mt-1">{s.items.map(it => `${it.name} x${it.quantity}`).join(' • ')}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <InvoiceActions
              onGenerateInvoice={handleGenerateInvoice}
              onClearInvoice={handleClearInvoice}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
