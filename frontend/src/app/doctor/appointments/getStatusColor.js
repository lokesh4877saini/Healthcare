export const getStatusColor = (columnId) => {
    switch (columnId) {
        case "upcoming":
            return "#ed6c02";
        case "completed":
            return "#2e7d32";
        case "cancelled":
            return "#f44336";
        default:
            return "#ccc";
    }
};    