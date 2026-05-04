interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    color?: string;
    bg?: string;
    trend?: string;
}

export default function StatCard({
    icon,
    label,
    value,
    color = "#1A7A52",
    bg = "#E8F5EE",
    trend
}: StatCardProps) {
    return (
        <>
            <div className="card border shadow-sm stat-card h-100">

                <div className="card-body d-flex justify-content-between align-items-center">

                    {/* LEFT ICON */}
                    <div
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{
                            width: 40,
                            height: 40,
                            background: bg,
                            flexShrink: 0
                        }}
                    >
                        <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
                    </div>

                    {/* RIGHT TEXT */}
                    <div className="text-end">

                        <div className="text-muted small fw-medium">
                            {label}
                        </div>

                        <div
                            className="fw-bold text-center"
                            style={{
                                fontSize: 26,
                                color: "#0D1F2D",
                                lineHeight: 1.2
                            }}
                        >
                            {value}
                        </div>

                        {trend && (
                            <div className="text-muted small mt-1">
                                {trend}
                            </div>
                        )}

                    </div>

                </div>
            </div>

            <style>{`
                .stat-card {
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
                }
            `}</style>
        </>
    );
}