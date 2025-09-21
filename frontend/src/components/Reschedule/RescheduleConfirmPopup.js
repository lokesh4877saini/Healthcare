import { Button } from '@mui/material';
import { motion } from 'framer-motion';

export default function RescheduleConfirmPopup({ onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        backdropFilter: 'blur(2px)', 
        WebkitBackdropFilter: 'blur(2px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h3 style={{ marginBottom: '1rem' }}>This time is not available.</h3>
        <p>Do you want to create and use this slot?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="outlined" color="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={onConfirm}>Yes, Create</Button>
        </div>
      </motion.div>
    </div>
  );
}
