'use client';
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useEffect, useState } from "react";
import styles from "@/styles/DoctorSlotsPage.module.css";
import styles1 from '@/styles/NewBookingPage.module.css';
export default function DateCard({ date, setDate, bookedDates = [] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <main className={styles1.LoadingDiv}>
  <p className={styles1.LoadingPara}>Loading...</p>
</main>;

  const isBooked = (day) => bookedDates.some((d) => dayjs(d).isSame(day, "day"));

  const CustomDay = (props) => {
    const { day, selected, outsideCurrentMonth, ...other } = props;
    const booked = isBooked(day);
    return (
      <PickersDay
        {...other}
        day={day}
        selected={selected}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          bgcolor: booked ? "#10e8b2" : undefined,
          color: booked ? "black" : undefined,
          "&:hover": { bgcolor: booked ? "black" : undefined, color: booked ? "#10e8b2" : undefined },
          borderRadius: "8px",
        }}
      />
    );
  };

  return (
    <div style={{ display: "flex", gap: "2rem", justifyContent: "center", alignContent: "center" }}>
      <div className={styles.card}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StaticDatePicker
            value={date ? dayjs(date) : null}
            onChange={(newValue) => setDate(newValue)}
            slots={{ textField: () => null, actionBar: () => null, day: CustomDay }}
            slotProps={{
              actionBar: { actions: [] },
              layout: { sx: { borderRadius: "16px", border: "1px solid #ccc", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } },
            }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}