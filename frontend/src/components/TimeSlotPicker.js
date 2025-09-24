"use client";
import { MdDeleteForever, MdAdd } from "react-icons/md";
import styles from "@/styles/DoctorSlotsPage.module.css";

export default function TimeSlotsPicker({ timeSlots, handleTimeChange, addTimeSlot, isHideButton, removeTimeSlot }) {
  const MAX_SLOTS = 6;
  return (
    <>
      <div className={styles.datepicker}>
        <label className={styles.label}
        >Set Time {isHideButton ? "slot" : "Slots"}:</label>
        <div className={styles.timeSlots}>
          {timeSlots.map((slot, index) => (
            <div key={index} className={styles.timeSlotItem}>
              <input
                type="time"
                value={slot}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className={styles.timeInput}
                required
              />
              {isHideButton ?
                (<></>) :
                (<>
                  <button
                    type="button"
                    disabled={timeSlots.length === 1}
                    onClick={() => removeTimeSlot(index)}
                    className={styles.removeButton}
                    aria-label="Remove"
                  >
                    <MdDeleteForever />
                  </button>
                </>)}
            </div>
          ))}
        </div>
        {
          timeSlots.length < MAX_SLOTS || isHideButton && (<>
            <button
              type="button"
              onClick={addTimeSlot}
              className={styles.addButton}
            >
              <MdAdd /> Add Time Slot
            </button>
          </>)
        }
      </div>
    </>
  );
}
