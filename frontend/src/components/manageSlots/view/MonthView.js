'use client'
import { useScreen } from '@/context/ScreenProvider';
import styles from '@/styles/DoctorSlotsPage.module.css';

export default function MonthView({ currentDate, slots, onAddSlot, onEditSlot, onDeleteSlot, onDateClick }) {
    const isMobile = useScreen();
    
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

    // Create empty days for padding
    for (let i = 0; i < firstDay; i++) {
        days.push({ type: 'empty', id: `empty-${i}` });
    }

    // Create actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = currentDate.getFullYear() === today.getFullYear() &&
            currentDate.getMonth() === today.getMonth() &&
            i === today.getDate();
        days.push({ 
            type: 'day', 
            id: `day-${i}`, 
            number: i, 
            isToday
        });
    }

    const getSlotsForDay = (dayNumber) => {
        if (!dayNumber) return [];
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
        return slots.filter(slot => slot.date === dateStr);
    };

    const dayNames = isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDayClick = (dayNumber) => {
        if (!dayNumber) return;
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        onDateClick(clickedDate);
    };

    const handleSlotClick = (e, slot) => {
        e.stopPropagation();
        onEditSlot(slot);
    };

    // Mobile-optimized compact calendar
    if (isMobile) {
        return (
            <div className={styles.monthViewMobile}>
                <div className={styles.monthGridHeaderMobile}>
                    {dayNames.map((day, index) => (
                        <div key={`mobile-day-${index}`} className={styles.monthDayHeaderMobile}>
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className={styles.monthGridMobile}>
                    {days.map((dayObj) => {
                        const daySlots = dayObj.type === 'day' ? getSlotsForDay(dayObj.number) : [];
                        const hasSlots = daySlots.length > 0;

                        return (
                            <div
                                key={dayObj.id}
                                className={`${styles.monthDayMobile} ${dayObj.type === 'empty' ? styles.emptyDayMobile : ''} ${dayObj.isToday ? styles.todayMobile : ''}`}
                                onClick={() => dayObj.type === 'day' && handleDayClick(dayObj.number)}
                            >
                                {dayObj.type === 'day' && (
                                    <>
                                        <div className={`${styles.monthDayNumberMobile} ${dayObj.isToday ? styles.todayNumberMobile : ''}`}>
                                            {dayObj.number}
                                        </div>
                                        {hasSlots && (
                                            <div className={styles.slotIndicatorMobile}>
                                                <div className={styles.slotDot}></div>
                                                {daySlots.length > 1 && (
                                                    <span className={styles.slotCountMobile}>
                                                        {daySlots.length}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Desktop - Regular calendar view
    return (
        <div className={styles.monthView}>
            <div className={styles.monthGrid}>
                {dayNames.map((day, index) => (
                    <div key={`desktop-day-${index}`} className={styles.monthDayHeader}>
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
                                                key={slot.id || `slot-${dayObj.number}-${index}`}
                                                className={`${styles.monthSlot} ${slot.type ? styles[slot.type] : ''}`}
                                                onClick={(e) => handleSlotClick(e, slot)}
                                            >
                                                <span className={styles.monthSlotTime}>{slot.startTime}</span>
                                                <span className={styles.monthSlotTitle}>{slot.title}</span>
                                            </div>
                                        ))}
                                        {daySlots.length > 3 && (
                                            <div className={styles.moreSlots}>
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