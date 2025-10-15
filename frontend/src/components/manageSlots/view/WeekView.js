import TimeLabelsColumn from '../columns/TimeLabelsColumn';
import DayColumn from '../columns/DayColumn';
import styles from '@/styles/DoctorSlotsPage.module.css';

// WeekView.js
export default function WeekView({ weekDays, slots, onAddSlot, onEditSlot, onDeleteSlot }) {
    const today = new Date();
    const todayDay = today.toLocaleDateString('en-US', { weekday: 'short' });
    const todayDate = today.getDate();

    return (
        <div className={styles.weekView}>
            <TimeLabelsColumn />
            <div className={styles.daysContainer}>
                {weekDays.map(({ day, date, dateObj, fullDate }) => ( // Make sure weekDays has dateObj
                    <DayColumn
                        key={day}
                        day={day}
                        date={date}
                        dateObj={dateObj} 
                        slots={slots.filter(slot => slot.date === fullDate)} // Filter by full date
                        onAddSlot={onAddSlot}
                        onEditSlot={onEditSlot}
                        onDeleteSlot={onDeleteSlot}
                        isToday={day === todayDay && date === todayDate}
                    />
                ))}
            </div>
        </div>
    );
}