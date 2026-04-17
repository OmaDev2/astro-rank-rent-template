import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const PRIMARY = "#d97706"; // amber-600, representativo

const OPTIONS = [
    {
        value: "solid",
        label: "Sólido",
        desc: "Fondo de color",
    },
    {
        value: "outline",
        label: "Contorno",
        desc: "Borde y texto",
    },
    {
        value: "gradient",
        label: "Degradado",
        desc: "Fondo degradado",
    },
];

const buttonPreviewStyle = (value: string): React.CSSProperties => {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "7px 14px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: "700",
        cursor: "default",
        letterSpacing: "0.03em",
        border: "2px solid transparent",
        transition: "none",
    };
    if (value === "solid") {
        return { ...base, background: PRIMARY, color: "#fff", borderColor: "transparent" };
    }
    if (value === "outline") {
        return { ...base, background: "transparent", color: PRIMARY, borderColor: PRIMARY };
    }
    // gradient
    return {
        ...base,
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #92400e 100%)`,
        color: "#fff",
        borderColor: "transparent",
    };
};

export function ButtonStylePicker({
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
            const [selected, setSelected] = useState(props.value || "solid");

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
                                        padding: "14px 16px",
                                        background: isSelected ? "#f5f3ff" : "#fff",
                                        boxShadow: isSelected
                                            ? "0 0 0 3px rgba(99,102,241,0.2)"
                                            : "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "10px",
                                        minWidth: "100px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {/* Button preview */}
                                    <div style={buttonPreviewStyle(opt.value)}>
                                        Presupuesto
                                    </div>
                                    <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: isSelected ? "700" : "600",
                                                color: isSelected ? "#4f46e5" : "#374151",
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: "9px", color: "#9ca3af" }}>
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
        defaultValue() { return "solid"; },
        parse(value) { return (value as string) || "solid"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "solid"; } },
    };
}
