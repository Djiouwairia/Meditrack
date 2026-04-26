interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    color?: string;
    bg?: string;
    trend?: string;
}

export default function StatCard({ icon, label, value, color = "#1A7A52", bg = "#E8F5EE", trend }: StatCardProps) {
    return (
        <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            border: "1px solid #F0F2F7",
            transition: "transform 0.15s, box-shadow 0.15s",
            cursor: "default",
        }}
             onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; }}
             onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}
        >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`bi ${icon}`} style={{ fontSize: 24, color }}></i>
            </div>
            <div>
                <div style={{ fontSize: 13, color: "#8A94A6", fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#0D1F2D", lineHeight: 1.2 }}>{value}</div>
                {trend && <div style={{ fontSize: 11, color: "#8A94A6", marginTop: 2 }}>{trend}</div>}
            </div>
        </div>
    );
}