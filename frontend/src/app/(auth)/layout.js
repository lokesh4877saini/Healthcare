import styles from '@/styles/LoginPage.module.css';

export const metadata = {
  title: 'Login Or SignUp',
  description: 'Healthcare booking app',
};

export default function AuthLayout({ children }) {
  return (
<div className={styles.mainContainer}>
  {/* Top Wave */}
  <svg
    className={styles.waveTop}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 320"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="waveGradientTop" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0070f3" />
        <stop offset="100%" stopColor="#00bfff" />
      </linearGradient>
    </defs>
    <path
      fill="url(#waveGradientTop)"
      d="M0,320L34.3,288C68.6,256,137,192,206,176C274.3,160,343,192,411,176C480,160,549,96,617,96C685.7,96,754,160,823,202.7C891.4,245,960,267,1029,250.7C1097.1,235,1166,181,1234,160C1302.9,139,1371,149,1406,154.7L1440,160L1440,320L0,320Z"
    />
  </svg>

  {/* Page content */}
  <div className={styles.content}>{children}</div>

  {/* Bottom Wave */}
  <svg
    className={styles.waveBottom}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 320"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="waveGradientBottom" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00bfff" />
        <stop offset="100%" stopColor="#0070f3" />
      </linearGradient>
    </defs>
    <path
      fill="url(#waveGradientBottom)"
      d="M0,320L34.3,288C68.6,256,137,192,206,176C274.3,160,343,192,411,176C480,160,549,96,617,96C685.7,96,754,160,823,202.7C891.4,245,960,267,1029,250.7C1097.1,235,1166,181,1234,160C1302.9,139,1371,149,1406,154.7L1440,160L1440,320L0,320Z"
    />
  </svg>
</div>


  );
}
