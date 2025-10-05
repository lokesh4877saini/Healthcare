"use client";
import {
    Typography,
    Chip,
    Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatTime24to12 } from "@/lib/formatters";
import { useScreen } from "@/context/ScreenProvider";

export const AppointmentContent = ({
    patient,
    date,
    time,
    status = "Pending",
    theme
}) => {

    const isMobile = useScreen();
    return (
        <Stack spacing={1}
      
        >
            <Stack
                direction={isMobile ? "column" : "row"}
                justifyContent={isMobile ? "flex-start" : "space-between"}
                alignItems={isMobile ? "flex-start" : "center"}
                spacing={isMobile ? 1 : 0}
            >
                <Stack direction={isMobile ? "column" : "row"} spacing={1} alignItems="center"
                  
                >
                    {isMobile ? (<>
                        <Typography
                            variant={isMobile ? "body1" : "subtitle1"}
                            fontWeight={600}
                        >
                            {patient}
                        </Typography>
                    </>) : (<>
                        <PersonIcon color="primary" fontSize={isMobile ? "small" : "medium"} />
                        <Typography
                            variant={isMobile ? "body1" : "subtitle1"}
                            fontWeight={600}
                        >
                            {patient}
                        </Typography>
                    </>)}

                </Stack>
                <Chip
                    label={
                        status === "completed"
                            ? "Completed"
                            : status === "cancelled"
                                ? "Cancelled"
                                : "Pending"
                    }
                    size="small"
                    sx={{
                        mt: 0.5,
                        ml: 1,
                        fontWeight: 600,
                        fontSize: isMobile ? "10px" : "12px",
                        padding: isMobile ? "1px" : "1px",
                        backgroundColor:
                            status === "completed"
                                ? (theme) => theme.palette.success.light
                                : status === "cancelled"
                                    ? (theme) => theme.palette.error.light
                                    : (theme) => theme.palette.warning.light,
                        color: "white"
                    }}
                />
            </Stack>
            <Stack spacing={1.2} sx={{ pl: 0.5}}
            
            
               
            >
                {isMobile ? (<>
                    <Typography
                        variant={isMobile ? "body2" : "body1"}
                        color={theme === 'dark'?'whitesmoke':'text.primary'}
                    >
                        {new Date(date).toDateString()}
                    </Typography>
                </>) : (<>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon
                            fontSize={isMobile ? "small" : "medium"}
                            sx={{color:`${theme === 'dark'?'whitesmoke':'primary.main'}`, }}
                        />
                        <Typography
                            variant={isMobile ? "body2" : "body1"}
                            color={theme === 'dark'?'whitesmoke':'text.primary'}
                        >
                            {new Date(date).toDateString()}
                        </Typography>
                    </Stack>
                </>)}

                <Stack direction="row" spacing={1} alignItems="center">
                    {isMobile ? (
                        <>
                            <Typography
                                variant={isMobile ? "body2" : "body1"}
                                color={theme === 'dark'?'whitesmoke':'text.primary'}
                            >
                                {formatTime24to12(time.startTime)} to {formatTime24to12(time.endTime)}
                            </Typography>
                        </>
                    ) : (
                        <>
                            <AccessTimeIcon
                                fontSize={isMobile ? "small" : "medium"}
                                sx={{color:`${theme === 'dark'?'whitesmoke':'primary.main'}`, }}
                            />
                            <Typography
                                variant={isMobile ? "body2" : "body1"}
                                color={theme === 'dark'?'whitesmoke':'text.primary'}
                            >
                                {formatTime24to12(time.startTime)} - {formatTime24to12(time.endTime)}
                            </Typography>
                        </>
                    )}
                </Stack>

            </Stack>
        </Stack>
    );
};
