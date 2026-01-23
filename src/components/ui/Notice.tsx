import { X } from 'lucide-react';

type NoticeType = 'success' | 'error' | 'info' | 'warning';

interface NoticeProps {
  type: NoticeType;
  message: string;
  onClose?: () => void;
  className?: string;
}

const stylesByType: Record<NoticeType, { container: string; text: string }> = {
  success: {
    container: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    text: 'text-red-700'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700'
  }
};

export default function Notice({ type, message, onClose, className = '' }: NoticeProps) {
  const styles = stylesByType[type];

  return (
    <div className={`border rounded-lg px-4 py-3 flex items-start justify-between gap-3 ${styles.container} ${className}`}>
      <p className={`text-sm ${styles.text}`}>{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`${styles.text} hover:opacity-80 transition-opacity`}
          aria-label="Cerrar aviso"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
