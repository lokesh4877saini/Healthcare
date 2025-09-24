export const getStatusColor = (columnId) => {
    switch (columnId) {
        case "upcoming":
            return "#4caf50";
        case "completed":
            return "#2196f3";
        case "cancelled":
            return "#f44336";
        default:
            return "#ccc";
    }
};    