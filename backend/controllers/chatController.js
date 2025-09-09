require('dotenv').config({ path: "backend/config/config.env" })
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatHandler = async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    //  Use recommended model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
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
          "intent": "navigate_internal na",
          "message": "Sure! Redirecting to name of (internal like new-booking,view-booking,appointments) link.",
          "url": "path"
        }
        If the user asks what this app does or how it works, respond with:
        {
          "intent": "explain_app",
          "message": "This app helps you easily book and manage your healthcare appointments. As a patient, you can:\n\n- Book new appointments: /patients/new-booking\n- View or cancel your bookings: /patients/view-bookings\n- View your profile details.\n\nHow would you like to proceed?",
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
        Do NOT include any markdown, code block, or extra text.
        
        User said: "${userMessage}"
        `;

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text().trim();

    let parsed;
    try {
      const clean = text.replace(/```json\n?([\s\S]*?)```/i, "$1").trim();
      parsed = JSON.parse(clean);
    } catch (err) {
      console.error(" Failed to parse Gemini response:", err, "\nRaw:", text);

      parsed = {
        intent: "normal_reply",
        message: text,
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(" Gemini Chat Error:", error);
    if (error.status === 429) {
      return res.status(429).json({
        intent: "normal_reply",
        message: "Oops! You've hit the daily limit for AI requests. Please try again later after 24 hours or upgrade your plan.",
      });
    }

    return res.status(500).json({
      intent: "normal_reply",
      message: "Sorry! I couldn't process that right now.",
    });
  }
};
