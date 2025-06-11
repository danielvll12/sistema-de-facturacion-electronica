export const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`;
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-SV', options);
};