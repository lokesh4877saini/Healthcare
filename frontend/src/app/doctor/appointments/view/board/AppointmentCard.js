"use client";

import { Card, Box, Stack } from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { AppointmentContent } from "./AppointmentContent";
import { RenderActions } from "./RenderActions";
import { getStatusColor } from "../../getStatusColor";

export function AppointmentCard({ appt, colId, provided, snapshot,status, isMobile, onBookingUpdate }) {
  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      sx={{
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        gap: 2,
        p: 1.5,
        mb: 1,
        borderLeft: `5px solid ${getStatusColor(colId)}`,
        boxShadow: snapshot.isDragging ? 4 : 1,
        borderRadius: 2,
        transition: "0.2s",
        ...provided.draggableProps.style,
      }}
    >
      <Box
        {...provided.dragHandleProps}
        sx={{
          width: 17,
          height: "70%",
          borderRadius: "2rem",
          cursor: "grab",
          bgcolor: "grey.300",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": { bgcolor: "grey.400" },
        }}
      >
        <DragIndicator fontSize="small" />
      </Box>

      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        flex={1}
        spacing={1}
      >
        <AppointmentContent
          patient={appt.patient}
          email={appt.email}
          date={appt.date}
          time={appt.time}
          status={status}
        />

        <RenderActions columnId={colId} id={appt.id} onBookingUpdate={onBookingUpdate} />
      </Stack>
    </Card>
  );
}
