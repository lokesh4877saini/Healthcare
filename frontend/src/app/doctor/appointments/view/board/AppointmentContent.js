export const AppointmentContent = ({ patient, email, date, time }) => {
    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
            }}
        >
            <p style={{ margin: 0, fontWeight: 600 }}>{patient}</p>
            <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>{email}</p>
            <p style={{ margin: 0, color: "#777", fontSize: "0.85rem" }}>
                {date} @ {time}
            </p>
        </div>
    );
};