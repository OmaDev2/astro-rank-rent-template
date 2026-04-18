import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "normal",
        label: "Normal",
        desc: "Mixto, sin efecto",
        preview: (active: boolean) => (
            <div style={{ width: "80px", height: "44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#1e293b" : "#374151", lineHeight: 1 }}>
                    Título
                </div>
                <div style={{ fontSize: "9px", color: active ? "#6366f1" : "#94a3b8", lineHeight: 1 }}>
                    Highlight
                </div>
            </div>
        ),
    },
    {
        value: "uppercase",
        label: "MAYÚSCULAS",
        desc: "Uppercase + espaciado",
        preview: (active: boolean) => (
            <div style={{ width: "80px", height: "44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: active ? "#1e293b" : "#374151", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
                    Título
                </div>
                <div style={{ fontSize: "8px", color: active ? "#6366f1" : "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>
                    Highlight
                </div>
            </div>
        ),
    },
    {
        value: "underline",
        label: "Subrayado",
        desc: "Acento de color bajo h2",
        preview: (active: boolean) => (
            <div style={{ width: "80px", height: "44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", padding: "0 4px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#1e293b" : "#374151", lineHeight: 1 }}>
                        Título
                    </div>
                    <div style={{ width: "28px", height: "2px", background: active ? "#6366f1" : "#cbd5e1", borderRadius: "1px" }} />
                </div>
                <div style={{ fontSize: "9px", color: active ? "#6366f1" : "#94a3b8" }}>
                    Subtítulo
                </div>
            </div>
        ),
    },
    {
        value: "italic",
        label: "Italic accent",
        desc: "Highlight en cursiva",
        preview: (active: boolean) => (
            <div style={{ width: "80px", height: "44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", padding: "0 4px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#1e293b" : "#374151", lineHeight: 1 }}>
                    Título
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, fontStyle: "italic", color: active ? "#6366f1" : "#94a3b8", lineHeight: 1 }}>
                    Highlight
                </div>
            </div>
        ),
    },
] as const;

export function HeadingStylePicker({
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
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                                        padding: "10px 12px",
                                        background: isSel ? "#f5f3ff" : "#fff",
                                        boxShadow: isSel ? "0 0 0 3px rgba(99,102,241,0.2)" : "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px",
                                        flex: 1,
                                        minWidth: "100px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {opt.preview(isSel)}
                                    <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                                        <div style={{ fontSize: "11px", fontWeight: isSel ? "700" : "600", color: isSel ? "#4f46e5" : "#374151" }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: "9px", color: "#9ca3af", marginTop: "1px" }}>
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
