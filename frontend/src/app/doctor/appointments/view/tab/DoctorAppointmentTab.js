import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CardContent from '@mui/material/CardContent';
import { Button } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function DoctorAppointmentTab({bookings,onBookingUpdate}) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const simplifyAppointments = (bookings) => {
    const mapAppointments = (appointments) =>
      appointments.map((appt) => ({
        id: appt._id,
        patient: appt.patient.name,
        email: appt.patient.email,
        date: appt.date,
        time: appt.time,
      }));

    return {
      upcoming: {
        title: bookings.upcoming.title,
        appointments: mapAppointments(bookings.upcoming.appointments),
      },
      completed: {
        title: bookings.completed.title,
        appointments: mapAppointments(bookings.completed.appointments),
      },
      cancelled: {
        title: bookings.cancelled.title,
        appointments: mapAppointments(bookings.cancelled.appointments),
      },
    };
  };
  const data = simplifyAppointments(bookings);
  const getStatusColor = (title) => {
    switch (title) {
        case "Upcoming":
            return "#4caf50"; // green
        case "Completed":
            return "#2196f3"; // blue
        case "Cancelled":
            return "#f44336"; // red
        default:
            return "#ccc";
    }
};
  const renderAppointments = (appointments,title) => {
    if (appointments.length === 0) {
      return <Typography variant="h6" color="text.secondary">No appointments available.</Typography>;
    }

    return appointments.map((appt) =>
    (
      <Card key={appt.id} sx={{ width: '100%', maxWidth: 380, boxShadow: 3, borderRadius: 2 }}>
        <CardContent
               style={{
                borderLeft: `5px solid ${getStatusColor(title)}`,
              }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {appt.patient}
          </Typography>
          <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>
            <strong>Email: </strong>{appt.email}
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            <strong>Appointment: </strong>{appt.date} @ {appt.time}
          </Typography>
          <Button variant="outlined" color="primary" fullWidth>
            View Details
          </Button>
        </CardContent>
      </Card>
    )
    );
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', marginTop: "1rem" }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#0f8",
            },
          }}
          textColor="#0f8"
          variant="fullWidth"
          aria-label="Appointment Tabs"
        >
          <Tab
            icon={value === 0 ? <EventIcon /> : <EventOutlinedIcon />}
            label="Upcoming"
            {...a11yProps(0)}
          />
          <Tab
            icon={value === 1 ? <EventAvailableIcon /> : <EventAvailableOutlinedIcon />}
            label="Completed"
            {...a11yProps(1)}
          />
          <Tab
            icon={value === 2 ? <EventBusyIcon /> : <EventBusyOutlinedIcon />}
            label="Cancelled"
            {...a11yProps(2)}
          />
        </Tabs>
      </AppBar>

      {/* Upcoming Tab */}
      <TabPanel value={value} index={0} dir={theme.direction}>
        {renderAppointments(data.upcoming.appointments,data.upcoming.title)}
      </TabPanel>

      {/* Completed Tab */}
      <TabPanel value={value} index={1} dir={theme.direction}>
        {renderAppointments(data.completed.appointments,data.completed.title)}
      </TabPanel>

      {/* Cancelled Tab */}
      <TabPanel value={value} index={2} dir={theme.direction}>
        {renderAppointments(data.cancelled.appointments,data.cancelled.title)}
      </TabPanel>
    </Box>
  );
}
