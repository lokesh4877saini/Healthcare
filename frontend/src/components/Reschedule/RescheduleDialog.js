import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert } from '@mui/material';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion'
const DatePick = dynamic(() => import('@/components/DatePick'), { ssr: false });
const TimeSlotPicker = dynamic(() => import('@/components/TimeSlotPicker'), { ssr: false });

export default function RescheduleDialog({
  open,
  onClose,
  onSubmit,
  date,
  setDate,
  bookedDates,
  timeSlots,
  handleTimeChange,
  addTimeSlot,
  isHideButton,
  removeTimeSlot,
  confirmationPopup,
  error
}) {
  return (
    <Dialog
      open={open}
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
        textDecoration: "underline",
        margin: "0 auto"
      }}
      >Reschedule Appointment</DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <DatePick date={date} setDate={setDate} bookedDates={bookedDates} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TimeSlotPicker
            timeSlots={timeSlots}
            handleTimeChange={handleTimeChange}
            addTimeSlot={addTimeSlot}
            isHideButton={isHideButton}
            removeTimeSlot={removeTimeSlot}
          />
        </Box>
        {confirmationPopup}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onSubmit} color="primary">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
