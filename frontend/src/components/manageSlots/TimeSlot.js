'use client'
import { ArrowRightAlt, Clear } from '@mui/icons-material';
import styles from '@/styles/DoctorSlotsPage.module.css';
import { getTimePosition } from '@/lib/formatters';
import { useScreen } from '@/context/ScreenProvider';


export default function TimeSlot({ slot, onEdit, onDelete, variant = 'default' }) {
    const isMobile= useScreen();
    return (
        <div
            className={`${styles.timeSlot} ${styles[variant]} ${slot.type ? styles[slot.type] : ''}`}
            style={{
                '--duration': slot.duration,
                '--start-time': getTimePosition(slot.startTime)
            }}
            onClick={() => onEdit(slot)}
        >
            <div className={styles.slotContent}>
                <div className={styles.timeRange}>
                    <span className={styles.startTime}>{slot.startTime}</span>
                    {isMobile?(<></>):(<><span className={styles.separator}><ArrowRightAlt /></span></>)}
                    <span className={styles.endTime}>{slot.endTime}</span>
                </div>
                {slot.title && (
                    <div className={styles.slotTitle}>
                        {slot.title}
                    </div>
                )}
            </div>

            <div className={styles.slotActions}>
                <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(slot,{startTime:slot.startTime,endTime:slot.endTime});
                    }}
                    aria-label="Delete slot"
                >
                    <Clear
                    fontSize={isMobile?'16px':'medium'} />
                </button>
            </div>
        </div>
    );
}