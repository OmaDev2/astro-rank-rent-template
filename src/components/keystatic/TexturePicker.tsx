import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "none",
        label: "Ninguna",
        desc: "Fondo limpio",
        pattern: "none" as const,
    },
    {
        value: "dots",
        label: "Puntos",
        desc: "Retícula de puntos",
        pattern: "dots" as const,
    },
    {
        value: "grid",
        label: "Cuadrícula",
        desc: "Líneas cruzadas",
        pattern: "grid" as const,
    },
    {
        value: "noise",
        label: "Ruido",
        desc: "Textura orgánica",
        pattern: "noise" as const,
    },
] as const;

function PatternPreview({ pattern, active }: { pattern: string; active: boolean }) {
    const color = active ? "rgba(99,102,241,0.35)" : "rgba(100,116,139,0.3)";
    const bg = active ? "#f5f3ff" : "#f8fafc";

    const style: React.CSSProperties = {
        width: "60px",
        height: "44px",
        borderRadius: "6px",
        background: bg,
        position: "relative",
        overflow: "hidden",
    };

    if (pattern === "none") {
        return <div style={style} />;
    }

    if (pattern === "dots") {
        return (
            <div style={{
                ...style,
                backgroundImage: `radial-gradient(${color} 1.2px, transparent 1.2px)`,
                backgroundSize: "8px 8px",
            }} />
        );
    }

    if (pattern === "grid") {
        return (
            <div style={{
                ...style,
                backgroundImage: `
                    linear-gradient(${color} 1px, transparent 1px),
                    linear-gradient(90deg, ${color} 1px, transparent 1px)
                `,
                backgroundSize: "10px 10px",
            }} />
        );
    }

    if (pattern === "noise") {
        return (
            <div style={style}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
                    <filter id="noise-prev">
                        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise-prev)" opacity="0.4"
                        fill={active ? "#6366f1" : "#475569"} />
                </svg>
            </div>
        );
    }

    return <div style={style} />;
}

export function TexturePicker({
    label,
    description,
}: {
    label: string;
    description?: string;
}): BasicFormField<string> {
    return {
        kind: "form",
        formKind: undefined,
        label,
        Input(props) {
            const [selected, setSelected] = useState(props.value || "none");

            const handleSelect = (value: string) => {
                setSelected(value);
                props.onChange(value);
            };

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {OPTIONS.map((opt) => {
                            const isSel = selected === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    style={{
                                        cursor: "pointer",
                                        border: isSel ? "2.5px solid #6366f1" : "2px solid #e2e8f0",
                                        borderRadius: "10px",
                                        padding: "14px",
                                        background: isSel ? "#f5f3ff" : "#fff",
                                        boxShadow: isSel ? "0 0 0 3px rgba(99,102,241,0.2)" : "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "10px",
                                        flex: 1,
                                        minWidth: "90px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    <PatternPreview pattern={opt.pattern} active={isSel} />
                                    <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                                        <div style={{ fontSize: "11px", fontWeight: isSel ? "700" : "600", color: isSel ? "#4f46e5" : "#374151" }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: "9px", color: "#9ca3af" }}>
                                            {opt.desc}
                                        </div>
                                    </div>
                                    {isSel && (
                                        <div style={{
                                            position: "absolute", top: "4px", right: "4px",
                                            background: "#6366f1", borderRadius: "50%",
                                            width: "16px", height: "16px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "9px", color: "#fff",
                                        }}>✓</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() { return "none"; },
        parse(value) { return (value as string) || "none"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "none"; } },
    };
}
