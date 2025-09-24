import { useState } from "react";
export default function useCreateReschedule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const clearError = () => setError(null);

  const submitReschedule = async ({ bookingId, date, time, forceCreateSlot = false }) => {
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}booking/reschedule/${bookingId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          time,
          forceCreateSlot,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        if (res.status === 409) {
          const conflictResult = { conflict: true, message: data.message };
          setResult(conflictResult);
          return conflictResult;  
        } else {
          throw new Error(data.message || "Something went wrong");
        }
      } else {
        const successResult = { success: true, booking: data.booking };
        setResult(successResult);
        return successResult; 
      }
    } catch (err) {
      setError(err.message);
      return null; 
    } finally {
      setLoading(false);
    }
  };
  

  return {
    loading,
    error,
    result,
    submitReschedule,
    clearError,
  };
}