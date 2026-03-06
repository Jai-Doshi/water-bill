import React, { useEffect } from 'react';
import { CheckCircle, Info, AlertCircle, XCircle } from 'lucide-react';
import './Toast.css';

export interface ToastProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="toast-icon text-success" />;
            case 'error': return <XCircle size={20} className="toast-icon text-danger" />;
            case 'warning': return <AlertCircle size={20} className="toast-icon text-warning" />;
            default: return <Info size={20} className="toast-icon text-info" />;
        }
    };

    return (
        <div className={`toast toast-${type} glass-panel animation-fade-in`}>
            {getIcon()}
            <span className="toast-message">{message}</span>
        </div>
    );
};

export default Toast;
