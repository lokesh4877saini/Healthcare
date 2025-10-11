import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to convert 12-hour format (e.g., "8:30 AM") to 24-hour format (e.g., "08:30")
const convertTo24HourFormat = (time) => {
    const [hour, minute] = time.split(':');
    const period = time.slice(-2).toUpperCase(); // "AM" or "PM"
    let hour24 = parseInt(hour, 10);

    if (period === 'AM' && hour24 === 12) {
        hour24 = 0; // 12:xx AM is 00:xx in 24-hour time
    } else if (period === 'PM' && hour24 !== 12) {
        hour24 += 12; // PM hours are adjusted by adding 12
    }

    return `${hour24.toString().padStart(2, '0')}:${minute}`;
};

const SlotEditModal = ({ slot, onClose, onSave }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [duration, setDuration] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (slot) {
            // Convert 12-hour format to 24-hour format before setting state
            const start24Hour = convertTo24HourFormat(slot.startTime || '');
            const end24Hour = convertTo24HourFormat(slot.endTime || '');

            setStartTime(start24Hour);
            setEndTime(end24Hour);
            setDuration(slot.duration || '');
            setTitle(slot.title || '');
            setDescription(slot.description || '');
        }
    }, [slot]);

    // Calculate duration based on start and end time
    const calculateDuration = (startTime, endTime) => {
        const start = new Date(`2025-10-19T${startTime}`);
        const end = new Date(`2025-10-19T${endTime}`);
        const diffInMs = end - start;
        const hours = diffInMs / (1000 * 60 * 60);
        return hours.toFixed(1);
    };

    const handleSave = (e) => {
        const updatedSlot = {
            ...slot,
            startTime,
            endTime,
            duration: calculateDuration(startTime, endTime),
            title,
            description,
        };
        onSave(updatedSlot);  // updated slot to the parent
    };

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    const modalVariants = {
        hidden: { 
            opacity: 0,
            scale: 0.8,
            y: 20
        },
        visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: -20,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    return (
        <AnimatePresence mode="wait">
            {slot && (
                <motion.div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.2)',
                        backdropFilter: "blur(4px)"
                    }}
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                >
                    <motion.div
                        className="modal"
                        style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            width: '450px',
                            maxWidth: '90%',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                            position: 'relative',
                            color: '#333',
                            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                            overflow: 'hidden',
                        }}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <motion.h2 
                            style={{ textAlign: 'center', fontSize: '24px', color: '#0070f3' }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                        >
                            Edit Slot
                        </motion.h2>

                        {/* Start and End Time Inline */}
                        <motion.div 
                            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                        >
                            <div style={{ width: '48%' }}>
                                <label style={{ fontSize: '14px', color: '#333' }}>Start Time:</label>
                                <input
                                    type="text"
                                    value={startTime}
                                    readOnly
                                    style={{
                                        padding: '10px',
                                        margin: '5px 0',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#f0f0f0',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                    }}
                                />
                            </div>
                            <div style={{ width: '48%' }}>
                                <label style={{ fontSize: '14px', color: '#333' }}>End Time:</label>
                                <input
                                    type="text"
                                    value={endTime}
                                    readOnly
                                    style={{
                                        padding: '10px',
                                        margin: '5px 0',
                                        width: '100%',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#f0f0f0',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.div 
                            style={{ marginBottom: '15px' }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <label style={{ fontSize: '14px', color: '#333' }}>Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{
                                    padding: '10px',
                                    margin: '5px 0',
                                    width: '100%',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '16px',
                                }}
                            />
                        </motion.div>

                        {/* Description */}
                        <motion.div 
                            style={{ marginBottom: '15px' }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.3 }}
                        >
                            <label style={{ fontSize: '14px', color: '#333' }}>Description:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                style={{
                                    padding: '10px',
                                    margin: '5px 0',
                                    width: '100%',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '16px',
                                }}
                            />
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '20px',
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            <motion.button
                                onClick={handleSave}
                                onKeyDown={handleSave}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    width: '48%',
                                }}
                                whileHover={{ 
                                    backgroundColor: '#005bb5',
                                    scale: 1.05 
                                }}
                                whileTap={{ 
                                    scale: 0.95 
                                }}
                            >
                                Save
                            </motion.button>
                            <motion.button
                                onClick={onClose}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    width: '48%',
                                }}
                                whileHover={{ 
                                    backgroundColor: '#d32f2f',
                                    scale: 1.05 
                                }}
                                whileTap={{ 
                                    scale: 0.95 
                                }}
                            >
                                Cancel
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SlotEditModal;