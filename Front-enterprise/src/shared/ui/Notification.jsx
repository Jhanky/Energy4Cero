import { useEffect } from 'react';
import { toast } from 'sonner';

const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const { type, message } = notification;

      // Map custom types to sonner methods
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'info':
          toast.info(message);
          break;
        default:
          toast(message);
      }

      // Call onClose immediately to clear the parent state, 
      // as sonner manages its own visibility duration.
      if (onClose) {
        onClose();
      }
    }
  }, [notification, onClose]);

  return null;
};

export default Notification;
