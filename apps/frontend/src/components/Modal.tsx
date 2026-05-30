import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="modal-overlay">
      <div className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative ${sizeClass} w-full card p-8 animate-scale-in max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {title && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100 dark:border-brand-800">
            <h2 className="text-lg font-semibold uppercase tracking-widest text-brand-900 dark:text-brand-50">{title}</h2>
            <button onClick={onClose} className="p-2 rounded hover:bg-surface-100 dark:hover:bg-brand-900 transition-colors" aria-label="Close">
              <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
