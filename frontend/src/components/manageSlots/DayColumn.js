import { useState, useRef } from 'react';
import TimeSlot from './TimeSlot';
import styles from '@/styles/DoctorSlotsPage.module.css';
import { getCleanTimeFromPosition, getEndTimeFromStartTime, getTimeFromPosition, getTimePosition } from '@/lib/formatters';

export default function DayColumn({ day, date, slots, onAddSlot, onEditSlot, onDeleteSlot, isToday = false }) {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null);
    const [currentSelection, setCurrentSelection] = useState(null);
    const columnRef = useRef(null);
    const dragStartRef = useRef(null);

    // Helper function to get display duration as number
    const getDisplayDuration = (pixels) => {
        const exactHours = pixels / 60;
        if (exactHours >= 0.75 && exactHours < 1.25) return 1;
        if (exactHours >= 1.25 && exactHours < 1.75) return 1.5;
        if (exactHours >= 1.75) return 2;
        return exactHours;
    };

    const handleMouseDown = (e) => {
        if (e.target.closest(`.${styles.timeSlot}`)) return;

        const rect = columnRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;

        dragStartRef.current = { x: e.clientX, y: e.clientY };
        setSelectionStart(y);
    };

    const handleMouseMove = (e) => {
        if (!dragStartRef.current || selectionStart === null) return;

        const dragDistance = Math.sqrt(
            Math.pow(e.clientX - dragStartRef.current.x, 2) +
            Math.pow(e.clientY - dragStartRef.current.y, 2)
        );

        if (dragDistance < 3) return;

        if (!isSelecting) {
            setIsSelecting(true);
            const startTime = getTimeFromPosition(selectionStart);
            setCurrentSelection({ start: selectionStart, end: selectionStart, startTime });
        }

        const rect = columnRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const constrainedY = Math.max(0, Math.min(rect.height, y));

        setCurrentSelection(prev => ({
            ...prev,
            end: constrainedY
        }));
    };

    const handleMouseUp = () => {
        if (isSelecting && currentSelection) {
            const start = Math.min(currentSelection.start, currentSelection.end);
            const end = Math.max(currentSelection.start, currentSelection.end);
            const durationPixels = end - start;

            // Calculate exact duration in hours based on pixels
            const exactDurationHours = durationPixels / 60;

            // Snap to nearest allowed duration
            let duration;
            if (exactDurationHours >= 0.75 && exactDurationHours < 1.25) {
                duration = 1;
            } else if (exactDurationHours >= 1.25 && exactDurationHours < 1.75) {
                duration = 1.5;
            } else if (exactDurationHours >= 1.75) {
                duration = 2;
            } else {
                resetSelection();
                return;
            }

            // USE CLEAN TIMES FOR CREATING THE SLOT, NOT RAW POSITIONS
            const startTime = getCleanTimeFromPosition(start);
            const endTime = getEndTimeFromStartTime(startTime, duration);

            // Check for overlaps using clean times
            const overlaps = slots.some(slot => {
                const slotStart = getTimePosition(slot.startTime);
                const slotEnd = slotStart + (slot.duration * 60);
                const newSlotStart = getTimePosition(startTime);
                const newSlotEnd = newSlotStart + (duration * 60);

                return (newSlotStart < slotEnd && newSlotEnd > slotStart);
            });

            if (!overlaps) {
                onAddSlot(day, startTime, endTime, duration);
            }
        }

        resetSelection();
    };

    const resetSelection = () => {
        setIsSelecting(false);
        setSelectionStart(null);
        setCurrentSelection(null);
        dragStartRef.current = null;
    };

    const getSelectionStyle = () => {
        if (!currentSelection) return {};

        const start = Math.min(currentSelection.start, currentSelection.end);
        const end = Math.max(currentSelection.start, currentSelection.end);
        const height = end - start;

        return {
            top: `${start}px`,
            height: `${height}px`,
            background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.12) 0%, rgba(162, 210, 255, 0.18) 50%, rgba(74, 144, 226, 0.08) 100%)',
            border: '1.5px solid rgba(99, 179, 237, 0.4)',
            borderRadius: '10px',
            position: 'absolute',
            left: '4px',
            right: '4px',
            pointerEvents: 'none',
            backdropFilter: 'blur(10px) saturate(180%)',
            boxShadow: `
                0 8px 32px rgba(74, 144, 226, 0.15),
                0 2px 8px rgba(74, 144, 226, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.4)
            `,
            transform: 'translateZ(0)',
            willChange: 'transform',
            borderLeft: '4px solid rgba(99, 179, 237, 0.6)',
            borderRight: '1px solid rgba(255, 255, 255, 0.3)'
        };
    };

    const getDurationFromPixels = (pixels) => {
        const exactHours = pixels / 60;

        if (exactHours < 0.75) {
            return `${Math.round(exactHours * 60)}min - drag to 1 hour`;
        } else if (exactHours >= 0.75 && exactHours < 1.25) {
            return "1 hour - release to create";
        } else if (exactHours >= 1.25 && exactHours < 1.75) {
            return "1.5 hours - release to create";
        } else if (exactHours >= 1.75) {
            return "2 hours - release to create";
        }
    };

    return (
        <div className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ''}`}>
            <div className={`${styles.dayHeader} ${isToday ? styles.todayHeader : ''}`}>
                <div className={styles.dayTitle}>{day}</div>
                <div className={styles.dayDate}>{date}</div>
                {isToday && <div className={styles.todayBadge}>Today</div>}
            </div>
            <div
                ref={columnRef}
                className={`${styles.timeColumn} ${isToday ? styles.todayTimeColumn : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {isSelecting && currentSelection && (
                    <div style={getSelectionStyle()} className={styles.selectionOverlay}>
                        <div className={styles.selectionInfo}>
                            {getCleanTimeFromPosition(currentSelection.start)} - {' '}
                            {getEndTimeFromStartTime(
                                getCleanTimeFromPosition(currentSelection.start),
                                getDisplayDuration(Math.abs(currentSelection.end - currentSelection.start))
                            )}
                            <div className={styles.durationHint}>
                                {getDurationFromPixels(Math.abs(currentSelection.end - currentSelection.start))}
                            </div>
                        </div>
                    </div>
                )}

                {slots.map(slot => (
                    <TimeSlot
                        key={slot.id}
                        slot={slot}
                        onEdit={onEditSlot}
                        onDelete={onDeleteSlot}
                    />
                ))}
            </div>
        </div>
    );
}