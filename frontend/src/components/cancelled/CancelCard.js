'use client'
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Box,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import { formatTime24to12 } from '@/lib/formatters';

const InfoRow = ({ icon, label }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {icon}
    <Typography variant="body2">{label}</Typography>
  </Stack>
);

export default function CancelledCard({ appointment, onClose }) {
  const { patient, email, phone, date, time, status, notes, cancelledBy, cancelledAt } = appointment;

  // Determine chip color based on status
  const statusColor =
    status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : 'default';

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1300,
        px: 2,
      }}
    >
      <Card
        sx={{
          width: 440,
          borderRadius: 3,
          boxShadow: 10,
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        {/* Header */}
        <CardHeader
          title={<Typography variant="h6">Appointment Details</Typography>}
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={status.toUpperCase()}
                color={statusColor}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          }
        />

        <Divider />

        <CardContent>
          {/* Patient Info */}
          <Stack spacing={1.2} mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Patient Info
            </Typography>
            <InfoRow
              icon={<PersonIcon color="primary" fontSize="small" />}
              label={patient || 'Unknown'}
            />
            <InfoRow
              icon={<EmailIcon color="action" fontSize="small" />}
              label={email || 'N/A'}
            />
            {phone && (
              <InfoRow icon={<PhoneIcon color="action" fontSize="small" />} label={phone} />
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Appointment Info */}
          <Stack spacing={1.2} mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Appointment Info
            </Typography>

            <InfoRow
              icon={<CalendarTodayIcon color="primary" fontSize="small" />}
              label={date || 'N/A'}
            />

            {time ? (
              <InfoRow
                icon={<AccessTimeIcon color="primary" fontSize="small" />}
                label={`${formatTime24to12(time.startTime)} - ${formatTime24to12(
                  time.endTime
                )}`}
              />
            ) : (
              <InfoRow
                icon={<AccessTimeIcon color="primary" fontSize="small" />}
                label="N/A"
              />
            )}

            {/* Cancelled Info */}
            {status === 'cancelled' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cancellation Info
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption">Cancelled By:</Typography>
                  <Chip
                    label={cancelledBy || 'Unknown'}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                {cancelledAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption">At:</Typography>
                    <Chip
                      label={new Date(cancelledAt).toLocaleDateString()}
                      color="warning"
                      size="small"
                    />
                    <Chip
                      label={new Date(cancelledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      color="success"
                      size="small"
                    />
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Notes */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <NotesIcon color="action" fontSize="small" />
              <Typography variant="subtitle2" color="text.secondary">
                Doctor Notes
              </Typography>
            </Stack>
            <Stack spacing={1} pl={4} mt={1}>
              {notes && notes.length > 0 ? (
                notes.map((n, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: status === 'cancelled' ? 'error.lighter' : 'grey.50',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={status === 'cancelled' ? 'error.main' : 'text.primary'}
                    >
                      <strong>
                        {n.author} ({n.role}):
                      </strong>{' '}
                      {n.content}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No notes added.
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
