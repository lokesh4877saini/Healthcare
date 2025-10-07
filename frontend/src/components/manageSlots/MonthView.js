import styles from '@/styles/DoctorSlotsPage.module.css';
export default function MonthView({ currentDate, slots, onAddSlot, onEditSlot, onDeleteSlot, onDateClick }) {
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
        days.push({ type: 'empty', id: `empty-${i}` });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = currentDate.getFullYear() === today.getFullYear() &&
            currentDate.getMonth() === today.getMonth() &&
            i === today.getDate();
        days.push({ type: 'day', id: `day-${i}-${i}`, number: i, isToday });
    }

    const getSlotsForDay = (dayNumber) => {
        if (!dayNumber) return [];
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
        return slots.filter(slot => slot.date === dateStr);
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDayClick = (dayNumber) => {
        if (!dayNumber) return;
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        onDateClick(clickedDate);
    };

    return (
        <div className={styles.monthView}>
            <div className={styles.monthGrid}>
                {dayNames.map(day => (
                    <div key={day} className={styles.monthDayHeader}>
                        {day}
                    </div>
                ))}

                {days.map((dayObj) => {
                    const daySlots = dayObj.type === 'day' ? getSlotsForDay(dayObj.number) : [];

                    return (
                        <div
                            key={dayObj.id}
                            className={`${styles.monthDay} ${dayObj.type === 'empty' ? styles.emptyDay : ''} ${dayObj.isToday ? styles.today : ''}`}
                            onClick={() => dayObj.type === 'day' && handleDayClick(dayObj.number)}
                        >
                            {dayObj.type === 'day' && (
                                <>
                                    <div className={styles.monthDayNumber}>{dayObj.number}</div>
                                    {dayObj.isToday && <div className={styles.todayBadge}>Today</div>}
                                    <div className={styles.monthDaySlots}>
                                        {daySlots.slice(0, 3).map((slot, index) => (
                                            <div
                                                key={slot.id || `slot-${dayObj.number}-${index}`}  // ← Fallback key
                                                className={`${styles.monthSlot} ${slot.type ? styles[slot.type] : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditSlot(slot);
                                                }}
                                            >
                                                <span className={styles.monthSlotTime}>{slot.startTime}</span>
                                                <span className={styles.monthSlotTitle}>{slot.title}</span>
                                            </div>
                                        ))}
                                        {daySlots.length > 3 && (
                                            <div
                                                key={`more-${dayObj.id}`}
                                                className={styles.moreSlots}
                                            >
                                                +{daySlots.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}