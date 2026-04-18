import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField } from "@keystatic/core";
import { useState } from "react";

const OPTIONS = [
    {
        value: "glass",
        label: "Glass",
        desc: "Transparente + blur",
        bar: { background: "rgba(15,23,42,0.15)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.1)" },
        dot: "#6366f1",
    },
    {
        value: "solid",
        label: "Sólido",
        desc: "Fondo opaco siempre",
        bar: { background: "rgba(15,23,42,0.97)", backdropFilter: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" },
        dot: "#475569",
    },
    {
        value: "minimal",
        label: "Minimal",
        desc: "Sin fondo",
        bar: { background: "transparent", backdropFilter: "none", borderBottom: "1px solid transparent" },
        dot: "#94a3b8",
    },
] as const;

export function NavbarStylePicker({
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
            const [selected, setSelected] = useState(props.value || "glass");

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
                                    {/* Mini site preview with navbar */}
                                    <div style={{
                                        width: "72px",
                                        height: "52px",
                                        borderRadius: "6px",
                                        overflow: "hidden",
                                        position: "relative",
                                        background: "linear-gradient(160deg, #1e293b 0%, #334155 100%)",
                                    }}>
                                        {/* Hero image simulation */}
                                        <div style={{
                                            position: "absolute", inset: 0,
                                            backgroundImage: "linear-gradient(160deg, #334155 0%, #475569 100%)",
                                        }} />
                                        {/* Navbar bar */}
                                        <div style={{
                                            position: "absolute", top: 0, left: 0, right: 0,
                                            height: "14px",
                                            background: opt.bar.background,
                                            backdropFilter: opt.bar.backdropFilter,
                                            borderBottom: opt.bar.borderBottom,
                                            display: "flex",
                                            alignItems: "center",
                                            paddingLeft: "6px",
                                            gap: "4px",
                                        }}>
                                            {/* Logo dot */}
                                            <div style={{ width: "12px", height: "5px", background: "#6366f1", borderRadius: "2px" }} />
                                            <div style={{ flex: 1 }} />
                                            {/* Nav links */}
                                            <div style={{ width: "5px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "1px" }} />
                                            <div style={{ width: "5px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "1px" }} />
                                            <div style={{ width: "8px", height: "5px", background: opt.dot, borderRadius: "2px", marginLeft: "2px" }} />
                                        </div>
                                        {/* Page content lines */}
                                        <div style={{ position: "absolute", bottom: "8px", left: "6px", right: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                                            <div style={{ height: "4px", background: "rgba(255,255,255,0.7)", borderRadius: "2px", width: "70%" }} />
                                            <div style={{ height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "2px", width: "50%" }} />
                                        </div>
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
        defaultValue() { return "glass"; },
        parse(value) { return (value as string) || "glass"; },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return (value as string) || "glass"; } },
    };
}
