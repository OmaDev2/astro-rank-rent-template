import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "sharp",
        label: "Cuadrado",
        desc: "0px",
        cardR: "0px",
        btnR: "0px",
    },
    {
        value: "subtle",
        label: "Sutil",
        desc: "6px",
        cardR: "6px",
        btnR: "6px",
    },
    {
        value: "rounded",
        label: "Redondeado",
        desc: "12px",
        cardR: "12px",
        btnR: "12px",
    },
    {
        value: "smooth",
        label: "Suave",
        desc: "20px",
        cardR: "20px",
        btnR: "20px",
    },
    {
        value: "pill",
        label: "Píldora",
        desc: "Btn ∞",
        cardR: "20px",
        btnR: "9999px",
    },
] as const;

export function RadiusPicker({
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
            const [selected, setSelected] = useState(props.value || "rounded");

            const handleSelect = (value: string) => {
                setSelected(value);
                props.onChange(value);
            };

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {OPTIONS.map((opt) => {
                            const isSelected = selected === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    style={{
                                        cursor: "pointer",
                                        border: isSelected
                                            ? "2.5px solid #6366f1"
                                            : "2px solid #e2e8f0",
                                        borderRadius: "10px",
                                        padding: "12px 14px",
                                        background: isSelected ? "#f5f3ff" : "#fff",
                                        boxShadow: isSelected
                                            ? "0 0 0 3px rgba(99,102,241,0.2)"
                                            : "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "10px",
                                        minWidth: "80px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {/* Card preview */}
                                    <div
                                        style={{
                                            width: "52px",
                                            height: "36px",
                                            background: "#e2e8f0",
                                            borderRadius: opt.cardR,
                                            display: "flex",
                                            alignItems: "flex-end",
                                            justifyContent: "center",
                                            paddingBottom: "6px",
                                        }}
                                    >
                                        {/* Button inside card */}
                                        <div
                                            style={{
                                                width: "36px",
                                                height: "10px",
                                                background: "#6366f1",
                                                borderRadius: opt.btnR,
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            textAlign: "center",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: isSelected ? "700" : "600",
                                                color: isSelected ? "#4f46e5" : "#374151",
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "9px",
                                                color: "#9ca3af",
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            {opt.desc}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                background: "#6366f1",
                                                borderRadius: "50%",
                                                width: "16px",
                                                height: "16px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "9px",
                                                color: "#fff",
                                            }}
                                        >
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() { return "rounded"; },
        parse(value) { return (value as string) || "rounded"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "rounded"; } },
    };
}
