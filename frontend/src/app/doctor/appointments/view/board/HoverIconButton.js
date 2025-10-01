'use client';
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

export const HoverIconButton = ({
  defaultIcon: DefaultIcon,
  hoverIcon: HoverIcon,
  title,
  color,
  hoverColor,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  const theme = useTheme();

  const resolvedColor = typeof color === "function" ? color(theme) : color;
  const resolvedHoverColor =
    typeof hoverColor === "function" ? hoverColor(theme) : hoverColor || resolvedColor;

  return (
    <Tooltip title={title} arrow placement="right">
      <button
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "1px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
      >
        {hover ? (
          <HoverIcon
            style={{
              fontSize: 28,
              color: resolvedHoverColor,
              transition: "color 0.2s ease",
            }}
          />
        ) : (
          <DefaultIcon
            style={{
              fontSize: 28,
              color: resolvedColor,
              transition: "color 0.2s ease",
            }}
          />
        )}
      </button>
    </Tooltip>
  );
};