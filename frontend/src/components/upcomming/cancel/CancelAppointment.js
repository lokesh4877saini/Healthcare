'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';

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
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          padding: 3,
        },
      }}
    >
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ marginBottom: "1rem" }}
        >
          <Alert severity="error" variant="filled" sx={{ boxShadow: 3 }}>
            {error}
          </Alert>
        </motion.div>
      )}

      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Cancel Appointment
      </DialogTitle>

      <DialogContent >
        <TextField
          multiline
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type the reason here..."
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              padding: 2,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", mt: 2 }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmit} color="primary" variant="contained">
          Submit Reason
        </Button>
      </DialogActions>
    </Dialog>
  );
}
