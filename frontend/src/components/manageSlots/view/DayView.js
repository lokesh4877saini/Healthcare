import TimeLabelsColumn from '../columns/TimeLabelsColumn';
import DayColumn from '../columns/DayColumn';
import styles from '@/styles/DoctorSlotsPage.module.css';

export default function DayView({ currentDate, slots, onAddSlot, onEditSlot, onDeleteSlot }) {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();

    return (
        <div className={styles.dayView}>
            <TimeLabelsColumn />
            <div className={styles.singleDayContainer}>
                <DayColumn
                    day={currentDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    date={currentDate.getDate()}
                    slots={slots}
                    dateObj={currentDate}
                    onAddSlot={onAddSlot}
                    onEditSlot={onEditSlot}
                    onDeleteSlot={onDeleteSlot}
                    isToday={isToday}
                />
            </div>
        </div>
    );
}