import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export interface NotificationProps {
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
    anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'right' | 'center';
    };
}

const Notification: React.FC<NotificationProps> = ({ isOpen, message, type, onClose, duration = 6000, anchorOrigin = { vertical: 'bottom', horizontal: 'left' } }) => {
  return (
    <Snackbar
        open={isOpen}
        autoHideDuration={duration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
    >
        {isOpen ? (
        <Alert
            onClose={onClose}
            severity={type}
            variant="filled"
            sx={{ width: '100%' }}
        >
            {message}
        </Alert>
        ) : undefined /* To avoid error with typescript */ }
    </Snackbar>
  );
}

export default Notification;