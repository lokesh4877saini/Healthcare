import {
    Typography,
    Chip,
    Stack,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatTime24to12 } from "@/lib/formatters";

export const AppointmentContent = ({
    patient,
    date,
    time,
    status = "Pending",
}) => {
    const statusColors = {
        Confirmed: "#4caf50",
        Pending: "#ff9800",
        Cancelled: "#f44336",
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    return (
        <Stack spacing={1}>
            <Stack
                direction={isMobile ? "column" : "row"}
                justifyContent={isMobile ? "flex-start" : "space-between"}
                alignItems={isMobile ? "flex-start" : "center"}
                spacing={isMobile ? 1 : 0}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon color="primary" fontSize={isMobile ? "small" : "medium"} />
                    <Typography
                        variant={isMobile ? "body1" : "subtitle1"}
                        fontWeight={600}
                    >
                        {patient}
                    </Typography>
                </Stack>
                <Chip
                    label={
                        status === "completed"
                            ? "Completed"
                            : status === "cancelled"
                                ? "Cancelled"
                                : "Pending"
                    }
                    color={
                        status === "completed"
                            ? "success"
                            : status === "cancelled"
                                ? "error"
                                : "warning"
                    }
                    size="small"
                    sx={{ mt: 0.5,ml:1, fontWeight: 600 }}
                />

            </Stack>

            <Stack spacing={1.2} sx={{ pl: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon
                        fontSize={isMobile ? "small" : "medium"}
                        sx={{ color: "primary.main" }}
                    />
                    <Typography
                        variant={isMobile ? "body2" : "body1"}
                        color="text.primary"
                    >
                        {new Date(date).toDateString()}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon
                        fontSize={isMobile ? "small" : "medium"}
                        sx={{ color: "primary.main" }}
                    />
                    <Typography
                        variant={isMobile ? "body2" : "body1"}
                        color="text.primary"
                    >
                        {formatTime24to12(time)}
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};
