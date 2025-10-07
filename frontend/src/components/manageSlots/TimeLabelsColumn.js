import styles from '@/styles/DoctorSlotsPage.module.css';

export default function TimeLabelsColumn() {
    const timeSlots = [];

    for (let hour = 8; hour <= 19; hour++) {
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';

        timeSlots.push(`${displayHour} ${period}`);

        if (hour < 19) {
            timeSlots.push(`${displayHour}:30 ${period}`);
        }
    }

    return (
        <div className={styles.timeLabelsColumn}>
            <div className={styles.timeLabelsHeader}></div>
            {timeSlots.map(time => (
                <div key={time} className={styles.timeLabel}>
                    {time}
                </div>
            ))}
        </div>
    );
}