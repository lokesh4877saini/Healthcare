require('dotenv').config({ path: "backend/config/config.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /** Build the full AI prompt */
  buildPrompt(userMessage) {
    return `
      You are a helpful assistant for a healthcare booking app.
      
      When the user wants to navigate, use these EXACT routes:
      - Home: "/"
      - For patients:
        - Book Appointment: "/patients/new-booking"
        - My Bookings: "/patients/view-bookings"
      - For doctors:
        - View Bookings: "/doctor/appointments"
        - Manage Slots: "/doctor/slots"
      - Profile page: "/profile/me"
      
      If the user wants to log out, respond with:
      {
        "intent": "logout_user",
        "message": "Logging you out now!",
        "url": null
      }

      If the user wants to visit an external website, respond with:
      {
        "intent": "visit_external_url",
        "message": "Sure! Opening that website.",
        "url": "https://example.com"
      }

      If the user wants to navigate_internal, respond with:
      {
        "intent": "navigate_internal",
        "message": "Sure! Redirecting to (internal like new-booking, view-booking, appointments) link.",
        "url": "path"
      }

      If the user asks what this app does or how it works, respond with:
      {
        "intent": "explain_app",
        "message": "This app helps you easily book and manage your healthcare appointments. As a patient, you can:\\n\\n- Book new appointments: /patients/new-booking\\n- View or cancel your bookings: /patients/view-bookings\\n- View your profile details.\\n\\nHow would you like to proceed?",
        "links": [
          { "label": "Book Appointment", "url": "/patients/new-booking" },
          { "label": "View My Bookings", "url": "/patients/view-bookings" },
          { "label": "View My Profile", "url": "/profile/me" }
        ],
        "url": null
      }

      For normal replies, respond with:
      {
        "intent": "normal_reply",
        "message": "Your helpful response goes here.",
        "url": null
      }

      Always respond with valid JSON only.
      Do NOT include markdown, code block, or extra text.

      User said: "${userMessage}"
    `;
  }

  /** Generate and parse response */
  async generateReply(userMessage) {
    const prompt = this.buildPrompt(userMessage);
    const result = await this.model.generateContent(prompt);
    const text = result.response.text().trim();

    try {
      const clean = text.replace(/```json\n?([\s\S]*?)```/i, "$1").trim();
      return JSON.parse(clean);
    } catch (err) {
      console.error("Failed to parse Gemini response:", err, "\nRaw:", text);
      return {
        intent: "normal_reply",
        message: text,
      };
    }
  }
}

module.exports = new ChatService();
