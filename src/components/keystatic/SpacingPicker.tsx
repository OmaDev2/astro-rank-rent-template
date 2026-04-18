import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "compact",
        label: "Compacto",
        desc: "3rem · 48px",
        blocks: [8, 8, 8],
    },
    {
        value: "normal",
        label: "Normal",
        desc: "5rem · 80px",
        blocks: [14, 14, 14],
    },
    {
        value: "spacious",
        label: "Espacioso",
        desc: "8rem · 128px",
        blocks: [22, 22, 22],
    },
] as const;

export function SpacingPicker({
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
            const [selected, setSelected] = useState(props.value || "normal");

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
                                        minWidth: "100px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {/* Section spacing preview */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0", width: "60px" }}>
                                        {opt.blocks.map((py, i) => (
                                            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                                                {/* Top padding */}
                                                <div style={{ height: `${py}px`, background: isSel ? "rgba(99,102,241,0.08)" : "#f8fafc" }} />
                                                {/* Content block */}
                                                <div style={{
                                                    height: "12px",
                                                    background: i % 2 === 0 ? (isSel ? "rgba(99,102,241,0.15)" : "#e2e8f0") : (isSel ? "rgba(99,102,241,0.08)" : "#f1f5f9"),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "3px",
                                                }}>
                                                    <div style={{ height: "3px", width: "60%", background: i % 2 === 0 ? (isSel ? "#6366f1" : "#cbd5e1") : (isSel ? "#818cf8" : "#e2e8f0"), borderRadius: "2px" }} />
                                                </div>
                                                {/* Bottom padding */}
                                                <div style={{ height: `${py}px`, background: isSel ? "rgba(99,102,241,0.08)" : "#f8fafc" }} />
                                                {/* Divider */}
                                                {i < opt.blocks.length - 1 && (
                                                    <div style={{ height: "1px", background: "#e2e8f0" }} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                                        <div style={{ fontSize: "11px", fontWeight: isSel ? "700" : "600", color: isSel ? "#4f46e5" : "#374151" }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: "9px", color: "#9ca3af", fontFamily: "monospace" }}>
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
        defaultValue() { return "normal"; },
        parse(value) { return (value as string) || "normal"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "normal"; } },
    };
}
