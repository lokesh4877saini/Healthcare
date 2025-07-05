"use client";

import styles from "@/styles/FloatingChat.module.css";
import { useRouter } from "next/navigation";

// components/ChatMessage.jsx
export default function ChatMessage({ sender, message, links }) {
  const router=  useRouter();
  return (
    <div className={`${styles.message} ${sender === "user" ? styles.user : styles.ai}`}>
      <p>{message}</p>

      {links && links.length > 0 && (
        <div className={styles.links}>
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              onClick={(e) => {
                e.preventDefault();
                // Internal links should use router
                if (link.url.startsWith("/")) {
                  router.push(link.url);
                } else {
                  window.open(link.url, "_blank");
                }
              }}
              className={styles.linkButton}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
