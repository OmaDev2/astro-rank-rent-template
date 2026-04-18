import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "image",
        label: "Imagen fondo",
        desc: "Texto sobre imagen con overlay",
        render: () => (
            <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", position: "relative", background: "#334155" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ width: "36px", height: "5px", background: "rgba(255,255,255,0.85)", borderRadius: "2px" }} />
                    <div style={{ width: "28px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
                    <div style={{ width: "22px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
                    <div style={{ width: "28px", height: "8px", background: "#6366f1", borderRadius: "3px", marginTop: "4px" }} />
                </div>
            </div>
        ),
    },
    {
        value: "split_photo",
        label: "Split + foto",
        desc: "Texto izq. · Foto der.",
        render: () => (
            <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", display: "flex", background: "#0f172a" }}>
                <div style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <div style={{ width: "28px", height: "4px", background: "rgba(255,255,255,0.8)", borderRadius: "2px" }} />
                    <div style={{ width: "22px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "2px" }} />
                    <div style={{ width: "20px", height: "6px", background: "#6366f1", borderRadius: "2px", marginTop: "2px" }} />
                </div>
                <div style={{ width: "32px", background: "linear-gradient(135deg, #334155, #475569)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "3px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
                </div>
            </div>
        ),
    },
    {
        value: "split_form",
        label: "Split + form · imagen",
        desc: "Texto izq. · Form der. · Fondo foto",
        render: () => (
            <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", display: "flex", position: "relative", background: "#334155" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(15,23,42,0.85) 55%, rgba(15,23,42,0.5) 100%)" }} />
                <div style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "28px", height: "4px", background: "rgba(255,255,255,0.85)", borderRadius: "2px" }} />
                    <div style={{ width: "22px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
                    <div style={{ width: "20px", height: "6px", background: "#6366f1", borderRadius: "2px", marginTop: "2px" }} />
                </div>
                <div style={{ width: "34px", background: "rgba(15,23,42,0.75)", padding: "5px", display: "flex", flexDirection: "column", gap: "3px", position: "relative", zIndex: 1 }}>
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.2)", borderRadius: "1px" }} />
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.2)", borderRadius: "1px" }} />
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.2)", borderRadius: "1px" }} />
                    <div style={{ height: "6px", background: "#6366f1", borderRadius: "1px", marginTop: "1px" }} />
                </div>
            </div>
        ),
    },
    {
        value: "split_form_clean",
        label: "Split + form · limpio",
        desc: "Texto izq. · Form der. · Sin foto",
        render: () => (
            <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", display: "flex", background: "#0f172a" }}>
                <div style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "4px", justifyContent: "center" }}>
                    <div style={{ width: "28px", height: "4px", background: "rgba(255,255,255,0.8)", borderRadius: "2px" }} />
                    <div style={{ width: "22px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "2px" }} />
                    <div style={{ width: "20px", height: "6px", background: "#6366f1", borderRadius: "2px", marginTop: "2px" }} />
                </div>
                <div style={{ width: "34px", background: "rgba(30,41,59,0.9)", padding: "5px", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.15)", borderRadius: "1px" }} />
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.15)", borderRadius: "1px" }} />
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.15)", borderRadius: "1px" }} />
                    <div style={{ height: "6px", background: "#6366f1", borderRadius: "1px", marginTop: "1px" }} />
                </div>
            </div>
        ),
    },
    {
        value: "centered",
        label: "Centrado",
        desc: "Texto centrado sobre imagen",
        render: () => (
            <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", position: "relative", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)" }} />
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "40px", height: "5px", background: "rgba(255,255,255,0.85)", borderRadius: "2px" }} />
                    <div style={{ width: "30px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
                    <div style={{ width: "28px", height: "7px", background: "#6366f1", borderRadius: "3px", marginTop: "3px" }} />
                </div>
            </div>
        ),
    },
    {
        value: "minimal",
        label: "Minimalista",
        desc: "Sin imagen, solo texto",
        render: () => (
            <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", background: "#0f172a", display: "flex", alignItems: "center", padding: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ width: "44px", height: "6px", background: "rgba(255,255,255,0.85)", borderRadius: "2px" }} />
                    <div style={{ width: "34px", height: "4px", background: "#6366f1", borderRadius: "2px" }} />
                    <div style={{ width: "38px", height: "3px", background: "rgba(255,255,255,0.35)", borderRadius: "2px" }} />
                    <div style={{ width: "24px", height: "7px", background: "#6366f1", borderRadius: "3px", marginTop: "2px" }} />
                </div>
            </div>
        ),
    },
] as const;

export function HeroStylePicker({
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
            const [selected, setSelected] = useState(props.value || "image");

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
                                        padding: "12px",
                                        background: isSel ? "#f5f3ff" : "#fff",
                                        boxShadow: isSel ? "0 0 0 3px rgba(99,102,241,0.2)" : "none",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px",
                                        flex: "1 1 120px",
                                        minWidth: "120px",
                                        maxWidth: "160px",
                                        transition: "all 0.15s",
                                        position: "relative",
                                    }}
                                >
                                    {opt.render()}
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
        defaultValue() { return "image"; },
        parse(value) { return (value as string) || "image"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "image"; } },
    };
}
