// Currency formatter
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  // Safe JSON parse with fallback
  export const safeJsonParse = (text, fallback = null) => {
    try {
      if (!text || !text.trim()) {
        return fallback;
      }
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse JSON:', error);
      console.warn('Raw text:', text);
      return fallback;
    }
  };
  