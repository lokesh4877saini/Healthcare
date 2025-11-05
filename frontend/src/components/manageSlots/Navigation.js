import { useScreen } from '@/context/ScreenProvider';
import styles from '@/styles/DoctorSlotsPage.module.css';
import { ArrowCircleLeft, ArrowCircleRight } from '@mui/icons-material';
const Navigation = ({navigateNext,navigatePrevious}) => {
    const isMobile = useScreen();
    return (

        <div className={`${styles.navigation} ${isMobile ? styles.mobileNavigation : ''}`}>
            <button
                className={`${styles.navButton} ${styles.withText} ${styles.previous}`}
                onClick={navigatePrevious}
            >
                <ArrowCircleLeft />
                <span className={styles.navButtonText}>Previous</span>
            </button>
            <button
                className={`${styles.navButton} ${styles.withText} ${styles.next}`}
                onClick={navigateNext}
            >
                <span className={styles.navButtonText}>Next</span>
                <ArrowCircleRight />
            </button>
        </div>
    )
}

export default Navigation;