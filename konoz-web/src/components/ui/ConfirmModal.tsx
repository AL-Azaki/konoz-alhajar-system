import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: isDestructive ? 'var(--color-danger)' : 'var(--color-primary)'
        }}>
          <AlertTriangle size={32} />
        </div>
        
        <p style={{ 
          fontSize: '1.05rem', 
          color: 'var(--color-text-main)', 
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center' 
        }}>
          <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? 'danger' : 'primary'} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ flex: 1 }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
