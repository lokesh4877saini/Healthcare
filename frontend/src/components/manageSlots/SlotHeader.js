'use client';

import { Clear } from '@mui/icons-material';
import styles from '@/styles/DoctorSlotsPage.module.css';
import Navigation from './Navigation';

export default function SlotHeader({ 
  currentView, 
  selectedDate, 
  showInstructions, 
  setShowInstructions,
  navigatePrevious,
  navigateNext 
}) {
  return (
    <div className={styles.contentHeader}>
      <div className={styles.dateInfo}>
        <div className={styles.currentView}>
          {currentView === 'day' && `Day - ${selectedDate.toDateString()}`}
          {currentView === 'week' && `Week - ${selectedDate.toDateString()}`}
          {currentView === 'month' && `Month - ${selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
          {currentView === 'year' && `Year - ${selectedDate.getFullYear()}`}
        </div>
        <Navigation
          navigateNext={navigateNext}
          navigatePrevious={navigatePrevious}
        />
      </div>

      {showInstructions && (
        <div className={styles.instructions}>
          <div className={styles.instructionsContent}>
            {currentView === 'day' || currentView === 'week'
              ? "Click and drag on time columns to create slots (1h, 1.5h, or 2h duration)"
              : currentView === 'month'
                ? "Click on days to add slots"
                : "Click on slots to edit"}
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setShowInstructions(false)}
            aria-label="Close instructions"
          >
            <Clear />
          </button>
        </div>
      )}
    </div>
  );
}