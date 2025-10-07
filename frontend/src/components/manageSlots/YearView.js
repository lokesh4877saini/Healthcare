import styles from '@/styles/DoctorSlotsPage.module.css';

export default function YearView({ currentDate, slots, onEditSlot, onMonthClick }) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const today = new Date();

    const getSlotsForMonth = (monthIndex) => {
        const year = currentDate.getFullYear();
        return slots.filter(slot => {
            const slotDate = new Date(slot.date);
            return slotDate.getFullYear() === year && slotDate.getMonth() === monthIndex;
        });
    };

    const handleMonthClick = (monthIndex) => {
        const clickedDate = new Date(currentDate.getFullYear(), monthIndex, 1);
        onMonthClick(clickedDate);
    };

    return (
        <div className={styles.yearView}>
            <div className={styles.yearGrid}>
                {months.map((month, index) => {
                    const monthSlots = getSlotsForMonth(index);
                    const monthKey = `${month}-${currentDate.getFullYear()}`;
                    const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && 
                                         index === today.getMonth();

                    return (
                        <div
                            key={monthKey}
                            className={`${styles.yearMonth} ${isCurrentMonth ? styles.current : ''}`}
                            onClick={() => handleMonthClick(index)}
                        >
                            <div className={styles.yearMonthHeader}>
                                <h3>{month}</h3>
                                <span className={styles.slotCount}>{monthSlots.length} slots</span>
                            </div>
                            {isCurrentMonth && <div className={styles.todayBadge}>Current</div>}
                            <div className={styles.yearMonthSlots}>
                                {monthSlots.slice(0, 5).map((slot, slotIndex) => (
                                    <div
                                        key={slot.id || `slot-${monthKey}-${slotIndex}`}
                                        className={`${styles.yearSlot} ${slot.type ? styles[slot.type] : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditSlot(slot);
                                        }}
                                    >
                                        <span className={styles.yearSlotDate}>
                                            {new Date(slot.date).getDate()}
                                        </span>
                                        <span className={styles.yearSlotTitle}>{slot.title}</span>
                                    </div>
                                ))}
                                {monthSlots.length > 5 && (
                                    <div
                                        key={`more-${monthKey}`}
                                        className={styles.moreSlots}
                                    >
                                        +{monthSlots.length - 5} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}