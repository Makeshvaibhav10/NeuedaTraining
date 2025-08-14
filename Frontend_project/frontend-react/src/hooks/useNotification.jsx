import { useState } from 'react';

export const useNotification = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 6000);
  };

  return { error, success, showSuccess, showError };
};
