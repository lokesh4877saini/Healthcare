"use client";
import { MdDeleteForever, MdAdd } from "react-icons/md";
import {
  Stack,
  Typography,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext"; 

export default function TimeSlotsPicker({
  timeSlots,
  handleTimeChange,
  addTimeSlot,
  removeTimeSlot,
}) {
  const MAX_SLOTS = 6;
  const pathname = usePathname();
  const isHideButton = pathname === "/doctor/appointments";

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {/* Label */}
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{
          color: isDark ? "#f5f5f5" : undefined, // only apply in dark mode
        }}
      >
        Set Time {isHideButton ? "slot" : "Slots"}:
      </Typography>

      {/* Time Slots */}
      <Stack spacing={1}>
        {timeSlots.map((slot, index) => (
          <Stack
            key={index}
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <TextField
              type="time"
              label="Start"
              value={slot.startTime}
              onChange={(e) =>
                handleTimeChange(index, "startTime", e.target.value)
              }
              size="small"
              sx={
                isDark
                  ? {
                      width: 140,
                      input: {
                        color: "#f5f5f5",
                        backgroundColor: "#1c2e4a",
                      },
                      label: {
                        color: "#ccc",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#00FF88",
                        },
                        "&:hover fieldset": {
                          borderColor: "#00FF88",
                        },
                      },
                    }
                  : { width: 140 }
              }
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="time"
              label="End"
              value={slot.endTime}
              onChange={(e) =>
                handleTimeChange(index, "endTime", e.target.value)
              }
              size="small"
              sx={
                isDark
                  ? {
                      width: 140,
                      input: {
                        color: "#f5f5f5",
                        backgroundColor: "#1c2e4a",
                      },
                      label: {
                        color: "#ccc",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#00FF88",
                        },
                        "&:hover fieldset": {
                          borderColor: "#00FF88",
                        },
                      },
                    }
                  : { width: 140 }
              }
              InputLabelProps={{ shrink: true }}
            />

            {!isHideButton && (
              <IconButton
                color="error"
                onClick={() => removeTimeSlot(index)}
                disabled={timeSlots.length === 1}
                size="small"
              >
                <MdDeleteForever />
              </IconButton>
            )}
          </Stack>

        ))}
      </Stack>

      {/* Add Button */}
      {!isHideButton && timeSlots.length < MAX_SLOTS && (
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={addTimeSlot}
          sx={
            isDark
              ? {
                  alignSelf: "flex-start",
                  backgroundColor: "#00FF88",
                  color: "#0a192f",
                  "&:hover": {
                    backgroundColor: "#00cc70",
                  },
                }
              : { alignSelf: "flex-start" }
          }
        >
          Add Time Slot
        </Button>
      )}
    </Stack>
  );
}
