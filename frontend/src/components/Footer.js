"use client";

import Link from "next/link";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import styles from "@/styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <input type="email" className={styles.links} placeholder={"Try Health care app"}/>
        <button>Subscribe</button>
      </div>

      <div className={styles.right}>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.icon}>
          <FaLinkedin />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.icon}>
          <FaTwitter />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.icon}>
          <FaGithub />
        </a>
      </div>
    </footer>
  );
}
