import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "flat",
        label: "Flat",
        desc: "Sin sombra",
        shadow: "none",
    },
    {
        value: "subtle",
        label: "Sutil",
        desc: "Muy ligera",
        shadow: "0 2px 8px -1px rgb(0 0 0 / 0.10)",
    },
    {
        value: "elevated",
        label: "Elevado",
        desc: "Estándar",
        shadow: "0 10px 24px -4px rgb(0 0 0 / 0.18), 0 4px 8px -2px rgb(0 0 0 / 0.10)",
    },
    {
        value: "floating",
        label: "Flotante",
        desc: "Pronunciada",
        shadow: "0 24px 48px -8px rgb(0 0 0 / 0.30), 0 8px 16px -4px rgb(0 0 0 / 0.15)",
    },
] as const;

export function ShadowPicker({
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
            const [selected, setSelected] = useState(props.value || "elevated");

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
                                        gap: "12px",
                                        flex: 1,
                                        minWidth: "90px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {/* Card preview with actual shadow */}
                                    <div style={{
                                        width: "56px",
                                        height: "40px",
                                        background: "#fff",
                                        borderRadius: "8px",
                                        boxShadow: opt.shadow,
                                        border: "1px solid #f1f5f9",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                        padding: "8px",
                                        justifyContent: "center",
                                    }}>
                                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", width: "80%" }} />
                                        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", width: "60%" }} />
                                        <div style={{ height: "6px", background: "#6366f1", borderRadius: "2px", width: "50%", marginTop: "2px" }} />
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
                </FieldPrimitive>
            );
        },
        defaultValue() { return "elevated"; },
        parse(value) { return (value as string) || "elevated"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "elevated"; } },
    };
}
