// src/hooks/useDailySales.js
import { useState, useEffect } from "react";

const SALES_KEY = "dailySales_v1";
const DATE_KEY = "dailySales_date_v1";

export function useDailySales() {
  // Obten la fecha del día actual (ejemplo: "16/11/2025")
  const todayDate = new Date().toLocaleDateString();

  const [sales, setSales] = useState(() => {
    try {
      const saved = localStorage.getItem(SALES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading daily sales from localStorage", e);
      return [];
    }
  });

  // Validar cambio de día
  useEffect(() => {
    const savedDate = localStorage.getItem(DATE_KEY);

    if (!savedDate) {
      // Primer uso → guardar fecha
      localStorage.setItem(DATE_KEY, todayDate);
      return;
    }

    if (savedDate !== todayDate) {
      // Día nuevo → reset automático
      localStorage.setItem(DATE_KEY, todayDate);
      localStorage.setItem(SALES_KEY, JSON.stringify([]));
      setSales([]);
    }
  }, [todayDate]);

  // Guardar las ventas cada vez que cambian
  useEffect(() => {
    try {
      localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    } catch (e) {
      console.error("Error saving daily sales to localStorage", e);
    }
  }, [sales]);

  // Registrar nueva venta
  const registerSale = (sale) => {
    setSales((prev) => [...prev, sale]);
  };

  // Reset manual
  const resetSales = () => {
    if (!window.confirm("¿Seguro que quieres eliminar TODAS las ventas guardadas del día?")) return;
    setSales([]);
  };

  // Calcular total del día
  const getTotalDailySales = () => {
    return sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
  };

  return {
    sales,
    registerSale,
    resetSales,
    getTotalDailySales,
  };
}
