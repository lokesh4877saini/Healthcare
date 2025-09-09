"use client";

import { useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import styles from "@/styles/FloatingChat.module.css";
import { FaComments, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/api";

export default function FloatingChat() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", message: "Hi! How can I help you today?",links:[] },
  ]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { sender: "user", message: text }]);

    try {
      const res = await fetcher("ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const { intent, message,links, url } = res;
      // Add AI message, including links if any
      setMessages((prev) => [
        ...prev,
        { sender: "ai", message, links: links || [] },
      ]);

      // Map of handlers for each intent
      const intentHandlers = {
        logout_user: async () => {
          await fetcher("logout", { method: "POST" });
          router.push("/");
        },
        navigate_internal: () => {
          if (url) router.push(url);
        },
        visit_external_url: () => {
          if (url) window.open(url, "_blank");
        },
      };

      // Call the right handler if it exists
      const handler = intentHandlers[intent];
      if (handler) {
        await handler();
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", message: "Oops! Something went wrong. Please try again." },
      ]);
    }
  };

  return (
    <div className={styles.floatingChat}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {isOpen && (
        <div className={styles.chatBox}>
          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                sender={msg.sender}
                message={msg.message}
                links={msg.links}
              />
            ))}
          </div>

          <ChatInput onSend={handleSend} />
        </div>
      )}
    </div>
  );
}
