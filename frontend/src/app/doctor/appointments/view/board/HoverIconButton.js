'use client';
import { useState } from "react";
export const HoverIconButton = ({ defaultIcon: DefaultIcon, hoverIcon: HoverIcon,title, color, hoverColor, onClick }) => {
    const [hover, setHover] = useState(false);

    return (
        <button
            style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
            }}
            title={title}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {hover ? (
                <HoverIcon style={{ fontSize: 28, color: hoverColor || color, transition: "color 0.2s ease" }} />
            ) : (
                <DefaultIcon style={{ fontSize: 28, color, transition: "color 0.2s ease" }} />
            )}
        </button>
    );
};