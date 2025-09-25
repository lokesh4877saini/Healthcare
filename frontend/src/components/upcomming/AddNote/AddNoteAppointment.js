'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AddNoteAppointment({
  openAddNote,
  onClose,
  onSubmit,
  note,      // array of notes from backend
  setNote,
  error
}) {
  // Last note content (doctor's note)
  const lastNote = Array.isArray(note) && note.length > 0 ? note[note.length - 1] : null;
  const [newContent, setNewContent] = useState(lastNote?.content || "");

  useEffect(() => {
    if (lastNote) setNewContent(lastNote.content);
  }, [lastNote]);

  return (
    <Dialog
      open={openAddNote}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': { borderRadius: 3, padding: 2 }
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
        Manage Appointment Notes
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Previous Notes */}
        {Array.isArray(note) && note.length > 0 && (
          <Paper
            variant="outlined"
            sx={{ p: 2, maxHeight: 200, overflowY: "auto", backgroundColor: "#f9f9f9" }}
          >
            <Typography variant="subtitle2" gutterBottom>Previous Notes:</Typography>
            {note.map((n, idx) => (
              <Box key={n._id || idx} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {n.author?.name || "Unknown"} ({n.role})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(n.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {n.content}
                </Typography>
                {idx < note.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </Paper>
        )}

        {/* Note editor */}
        <TextField
          label="Update or Add Note"
          multiline
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Type your note here..."
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => {
            // Update note array state
            const updatedNotes = [...(note || [])];
            if (lastNote) {
              updatedNotes[updatedNotes.length - 1].content = newContent;
            } else {
              updatedNotes.push({ content: newContent });
            }
            setNote(updatedNotes);
            onSubmit(updatedNotes);
          }}
          color="primary"
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
