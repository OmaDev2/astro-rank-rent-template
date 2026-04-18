import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "none",
        label: "Sin animaciones",
        desc: "Carga instantánea",
        preview: [
            { opacity: 1, transform: "none", delay: 0 },
            { opacity: 1, transform: "none", delay: 0 },
            { opacity: 1, transform: "none", delay: 0 },
        ],
    },
    {
        value: "subtle",
        label: "Sutiles",
        desc: "Fade suave",
        preview: [
            { opacity: 0.3, transform: "translateY(4px)", delay: 0 },
            { opacity: 0.3, transform: "translateY(4px)", delay: 150 },
            { opacity: 0.3, transform: "translateY(4px)", delay: 300 },
        ],
    },
    {
        value: "full",
        label: "Completas",
        desc: "Fade + desliz",
        preview: [
            { opacity: 0.15, transform: "translateY(10px)", delay: 0 },
            { opacity: 0.15, transform: "translateY(10px)", delay: 200 },
            { opacity: 0.15, transform: "translateY(10px)", delay: 400 },
        ],
    },
] as const;

export function AnimationPicker({
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
            const [selected, setSelected] = useState(props.value || "subtle");
            const [tick, setTick] = useState(0);

            const handleSelect = (value: string) => {
                setSelected(value);
                props.onChange(value);
                setTick(t => t + 1);
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
                                        minWidth: "100px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {/* Preview: 3 stacked blocks showing animation state */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "60px" }}>
                                        {opt.preview.map((block, i) => (
                                            <div
                                                key={`${tick}-${i}`}
                                                style={{
                                                    height: "10px",
                                                    background: isSel
                                                        ? `rgba(99,102,241,${0.6 - i * 0.15})`
                                                        : `rgba(203,213,225,${0.9 - i * 0.2})`,
                                                    borderRadius: "4px",
                                                    width: `${80 - i * 10}%`,
                                                    opacity: opt.value === "none" ? 1 : 0,
                                                    transform: block.transform,
                                                    animation: opt.value !== "none"
                                                        ? `fadeSlideIn 0.6s ease forwards`
                                                        : "none",
                                                    animationDelay: `${block.delay}ms`,
                                                }}
                                            />
                                        ))}
                                    </div>
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
                    <style>{`
                        @keyframes fadeSlideIn {
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </FieldPrimitive>
            );
        },
        defaultValue() { return "subtle"; },
        parse(value) { return (value as string) || "subtle"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "subtle"; } },
    };
}
