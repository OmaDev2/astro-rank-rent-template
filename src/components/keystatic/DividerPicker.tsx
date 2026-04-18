import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

type DividerOption = {
    value: string;
    label: string;
    desc: string;
    renderTop: () => React.ReactNode;
};

const OPTIONS: DividerOption[] = [
    {
        value: "none",
        label: "Ninguno",
        desc: "Corte recto",
        renderTop: () => (
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "0" }} />
        ),
    },
    {
        value: "diagonal",
        label: "Diagonal",
        desc: "Borde inclinado",
        renderTop: () => (
            <svg viewBox="0 0 60 12" style={{ width: "100%", height: "12px", display: "block" }}>
                <polygon points="0,8 60,0 60,12 0,12" fill="#e2e8f0" />
            </svg>
        ),
    },
    {
        value: "wave",
        label: "Ola",
        desc: "Borde ondulado",
        renderTop: () => (
            <svg viewBox="0 0 60 12" style={{ width: "100%", height: "12px", display: "block" }}>
                <path d="M0,8 C10,2 20,12 30,6 C40,0 50,10 60,6 L60,12 L0,12 Z" fill="#e2e8f0" />
            </svg>
        ),
    },
    {
        value: "curve",
        label: "Curva",
        desc: "Borde redondeado",
        renderTop: () => (
            <svg viewBox="0 0 60 12" style={{ width: "100%", height: "12px", display: "block" }}>
                <path d="M0,12 Q30,-4 60,12 Z" fill="#e2e8f0" />
            </svg>
        ),
    },
];

export function DividerPicker({
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
                                    {/* Section divider preview */}
                                    <div style={{ width: "64px", display: "flex", flexDirection: "column", gap: "0", borderRadius: "4px", overflow: "hidden" }}>
                                        {/* Top section */}
                                        <div style={{
                                            height: "18px",
                                            background: isSel ? "rgba(99,102,241,0.12)" : "#f1f5f9",
                                        }} />
                                        {/* Divider shape */}
                                        <div style={{ lineHeight: 0, color: isSel ? "rgba(99,102,241,0.25)" : "#e2e8f0" }}>
                                            {opt.renderTop()}
                                        </div>
                                        {/* Bottom section */}
                                        <div style={{
                                            height: "18px",
                                            background: isSel ? "rgba(99,102,241,0.2)" : "#e2e8f0",
                                        }} />
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
        defaultValue() { return "none"; },
        parse(value) { return (value as string) || "none"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "none"; } },
    };
}
