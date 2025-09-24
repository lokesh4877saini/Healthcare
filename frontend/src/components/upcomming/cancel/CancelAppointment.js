'use client'
import { Dialog, DialogTitle, DialogContent, DialogActions,Input, Button, Box, Alert } from '@mui/material';
import { motion } from 'framer-motion'
export default function CancelAppointment({
  open_canel,
  onClose,
  onSubmit,
  note,
  setNote,
  error
}) {
  
  return (
    <Dialog
      open={open_canel}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth: '800px',
        },
      }}
    >
      {error && (
        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 300, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ position: 'fixed', top: 0, left: '50%', zIndex: 9999, pointerEvents: 'none' }}
        >
          <Box
            sx={{
              px: 3,
              py: 1,
              position: 'relative',
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'auto',
              width: 'fit-content',
              minWidth: 300,
              maxWidth: '90vw',
            }}
          >
            <Alert severity="error" variant="filled" sx={{ boxShadow: 3 }}>
              {error}
            </Alert>
          </Box>
        </motion.div>

      )}
      <DialogTitle sx={{
        textAlign: "center",
        padding: "1rem",
        margin: "0 auto"
      }}
      >Cancel Appointment ?</DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for cancellation"
          fullWidth
          required
          sx={{
            padding: 1,
            borderRadius: 2,
            border: '1px solid #ccc',
            '&:focus': { borderColor: 'primary.main' },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onSubmit} color="primary">Submit Reason</Button>
      </DialogActions>
    </Dialog>
  );
}
