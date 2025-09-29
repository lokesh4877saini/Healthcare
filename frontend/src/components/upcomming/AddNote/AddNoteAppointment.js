'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Divider
} from '@mui/material';
export default function AddNoteAppointment({
  openAddNote,
  onClose,
  onSubmit,
  noteContent,
  setNoteContent,
  existingNotes,
  error
}) {
  return (
    <Dialog open={openAddNote} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Manage Appointment Notes</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Previous Notes */}
        {existingNotes.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2">Previous Notes:</Typography>
            {existingNotes.map((n, idx) => (
              <Box key={n._id || idx}>
                <Typography variant="body2"><b>{n.author?.name || "Unknown"} ({n.role})</b></Typography>
                <Typography variant="body2" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>
                <Typography variant="body1">{n.content}</Typography>
                {idx < existingNotes.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Paper>
        )}

        {/* Note editor */}
        <TextField
          multiline
          rows={4}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Type your note here..."
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={() => onSubmit(noteContent)} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
