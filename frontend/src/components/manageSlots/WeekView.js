import TimeLabelsColumn from './TimeLabelsColumn';
import DayColumn from './DayColumn';
import styles from '@/styles/DoctorSlotsPage.module.css';

export default function WeekView({ weekDays, slots, onAddSlot, onEditSlot, onDeleteSlot }) {
    const today = new Date();
    const todayDay = today.toLocaleDateString('en-US', { weekday: 'short' });
    const todayDate = today.getDate();

    return (
        <div className={styles.weekView}>
            <TimeLabelsColumn />
            <div className={styles.daysContainer}>
                {weekDays.map(({ day, date }) => (
                    <DayColumn
                        key={day}
                        day={day}
                        date={date}
                        slots={slots.filter(slot => slot.day === day)}
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