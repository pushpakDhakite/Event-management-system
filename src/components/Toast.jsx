import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} animate-fade-in`}>
      <span className="text-lg">{icons[type]}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={() => { setVisible(false); onClose?.(); }} className="ml-2 text-sm opacity-60 hover:opacity-100">✕</button>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (msg, dur) => addToast(msg, 'success', dur);
  const error = (msg, dur) => addToast(msg, 'error', dur);
  const warning = (msg, dur) => addToast(msg, 'warning', dur);
  const info = (msg, dur) => addToast(msg, 'info', dur);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );

  return { addToast, success, error, warning, info, ToastContainer };
};

export default Toast;
