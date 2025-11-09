import { useState, useEffect } from "react";

const STORAGE_INVOICE_KEY = "invoiceNumber_v1";
const STORAGE_DATE_KEY = "invoiceDate_v1";

export function useInvoiceNumber() {
  const [invoiceNumber, setInvoiceNumber] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const savedNumber = localStorage.getItem(STORAGE_INVOICE_KEY);
    const savedDate = localStorage.getItem(STORAGE_DATE_KEY);

    // Si hay datos guardados
    if (savedNumber && savedDate) {
      // Si la fecha es distinta → reiniciar
      if (savedDate !== today) {
        setInvoiceNumber(0);
        localStorage.setItem(STORAGE_INVOICE_KEY, "0");
        localStorage.setItem(STORAGE_DATE_KEY, today);
      } else {
        // Continuar con el contador guardado
        setInvoiceNumber(Number(savedNumber));
      }
    } else {
      // Primer uso del día
      localStorage.setItem(STORAGE_INVOICE_KEY, "0");
      localStorage.setItem(STORAGE_DATE_KEY, today);
    }
  }, []);

  const increaseInvoice = () => {
    setInvoiceNumber((prev) => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_INVOICE_KEY, String(next));
      return next;
    });
  };

  return {
    invoiceNumber,
    increaseInvoice
  };
}
