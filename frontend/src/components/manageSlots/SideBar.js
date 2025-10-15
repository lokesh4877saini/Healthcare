'use client'
import React from 'react'
import styles from '@/styles/DoctorSlotsPage.module.css';
import { CalculateRounded, CalendarMonth, CalendarViewDay, Today, ViewWeek } from '@mui/icons-material';
import { useScreen } from '@/context/ScreenProvider';
const SideBar = ({ changeView, currentView, goToToday, isSidebarCollapsed, setIsSidebarCollapsed }) => {
    const isMobile = useScreen();
    return (<>  {
        isMobile ? (
            <div className={`${styles.sidebar} ${styles.sidebarMobile}`}>
                <div className={styles.sidebarHeader}>
                    <h1 className={styles.heading}>SM</h1>
                </div>

                <div className={styles.viewSelector}>
                    <div className={styles.selectorLabel}>View</div>
                    <div className={styles.viewButtons}>
                        <button 
                            className={`${styles.viewOption} ${currentView === 'day' ? styles.viewOptionActive : ''}`}
                            onClick={() => changeView('day')}
                        >
                            <CalculateRounded className={styles.viewIcon}  />
                        </button>
                        <button
                            className={`${styles.viewOption} ${currentView === 'month' ? styles.viewOptionActive : ''}`}
                            onClick={() => changeView('month')}
                        >
                            <CalendarMonth className={styles.viewIcon} />
                        </button>
                    </div>
                </div>

                <div className={styles.quickActions}>
                    <button className={styles.todayButton} onClick={goToToday}>
                        <Today />
                    </button>
                </div>
            </div>
        ) : (
            <div
                className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''
                    }`}
                onMouseEnter={() => setIsSidebarCollapsed(false)}
                onMouseLeave={() => setIsSidebarCollapsed(true)}
            >
                <div className={styles.sidebarHeader}>
                    <h1 className={styles.heading}>
                        {isSidebarCollapsed ? 'SM' : 'Slot Management'}
                    </h1>
                </div>

                <div className={styles.viewSelector}>
                    <div
                        className={`${styles.selectorLabel} ${isSidebarCollapsed ? styles.selectorLabelHidden : ''
                            }`}
                    >
                        View Type
                    </div>
                    <div className={styles.viewButtons}>
                        <button
                            className={`${styles.viewOption} ${currentView === 'day' ? styles.viewOptionActive : ''
                                } ${isSidebarCollapsed ? styles.viewOptionCollapsed : ''}`}
                            onClick={() => changeView('day')}
                            title="Day View"
                        >
                            <CalculateRounded className={styles.viewIcon} />
                            <span className={styles.viewOptionText}>Day</span>
                        </button>

                        <button
                            className={`${styles.viewOption} ${currentView === 'week' ? styles.viewOptionActive : ''
                                } ${isSidebarCollapsed ? styles.viewOptionCollapsed : ''}`}
                            onClick={() => changeView('week')}
                            title="Week View"
                        >
                            <ViewWeek className={styles.viewIcon} />
                            <span className={styles.viewOptionText}>Week</span>
                        </button>

                        <button
                            className={`${styles.viewOption} ${currentView === 'month' ? styles.viewOptionActive : ''
                                } ${isSidebarCollapsed ? styles.viewOptionCollapsed : ''}`}
                            onClick={() => changeView('month')}
                            title="Month View"
                        >
                            <CalendarMonth className={styles.viewIcon} />
                            <span className={styles.viewOptionText}>Month</span>
                        </button>

                        <button
                            className={`${styles.viewOption} ${currentView === 'year' ? styles.viewOptionActive : ''
                                } ${isSidebarCollapsed ? styles.viewOptionCollapsed : ''}`}
                            onClick={() => changeView('year')}
                            title="Year View"
                        >
                            <CalendarViewDay className={styles.viewIcon} />
                            <span className={styles.viewOptionText}>Year</span>
                        </button>
                    </div>
                </div>

                <div className={styles.quickActions}>
                    <button
                        className={`${styles.todayButton} ${isSidebarCollapsed ? styles.todayButtonCollapsed : ''
                            }`}
                        onClick={goToToday}
                        title="Go to Today"
                    >
                        <Today />
                        <span className={styles.todayButtonText}>Go to Today</span>
                    </button>
                </div>
            </div>
        )}
    </>)
}

export default SideBar;