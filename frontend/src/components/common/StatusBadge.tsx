const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
    EN_ATTENTE:  { label: "En attente",  bg: "#FFF3CD", color: "#B45309" },
    CONFIRME:    { label: "Confirmé",    bg: "#D1FAE5", color: "#065F46" },
    ANNULE:      { label: "Annulé",      bg: "#FEE2E2", color: "#991B1B" },
    TERMINE:     { label: "Terminé",     bg: "#E0E7FF", color: "#3730A3" },
};

export default function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] || { label: status, bg: "#F3F4F6", color: "#374151" };
    return (
        <span style={{
            background: s.bg,
            color: s.color,
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
            whiteSpace: "nowrap",
        }}>
      {s.label}
    </span>
    );
}