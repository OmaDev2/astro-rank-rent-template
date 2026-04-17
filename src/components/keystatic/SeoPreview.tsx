import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import { useState } from "react";

type SeoState = { title: string; description: string };

function parseAsNormalField(value: FormFieldStoredValue) {
    if (value === undefined || value === null) {
        return JSON.stringify({ title: "", description: "" });
    }
    if (typeof value !== "string") {
        throw new Error("Must be a string");
    }
    return value;
}

export function SeoPreview({
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
            let state: SeoState;
            try {
                state = props.value ? JSON.parse(props.value) : { title: "", description: "" };
            } catch {
                state = { title: "", description: "" };
            }

            const update = (next: SeoState) => {
                props.onChange(JSON.stringify(next));
            };

            const titleCount = state.title.length;
            const descCount = state.description.length;

            const getTitleColor = () => {
                if (titleCount === 0) return "#9ca3af";
                if (titleCount <= 60) return "#10b981"; // green
                return "#ef4444"; // red
            };

            const getDescColor = () => {
                if (descCount === 0) return "#9ca3af";
                if (descCount <= 160) return "#10b981";
                return "#ef4444";
            };

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* INPUTS */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Meta Title</label>
                                <span style={{ fontSize: "12px", color: getTitleColor(), fontWeight: "500" }}>
                                    {titleCount} / 60 
                                </span>
                            </div>
                            <input
                                type="text"
                                value={state.title}
                                onChange={(e) => update({ ...state, title: e.target.value })}
                                placeholder="Ej: Especialistas en Reformas | Presupuesto Gratis"
                                style={{
                                    width: "100%", padding: "8px 12px", borderRadius: "6px",
                                    border: "1px solid #d1d5db", fontSize: "14px",
                                    fontFamily: "inherit"
                                }}
                            />
                            <div style={{ height: "3px", width: "100%", background: "#e5e7eb", marginTop: "4px", borderRadius: "2px" }}>
                                <div style={{ height: "100%", background: getTitleColor(), width: `${Math.min((titleCount / 60) * 100, 100)}%`, borderRadius: "2px", transition: "width 0.2s" }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>Meta Description</label>
                                <span style={{ fontSize: "12px", color: getDescColor(), fontWeight: "500" }}>
                                    {descCount} / 160
                                </span>
                            </div>
                            <textarea
                                value={state.description}
                                rows={3}
                                onChange={(e) => update({ ...state, description: e.target.value })}
                                placeholder="Escribe un pequeño resumen atractivo de la página..."
                                style={{
                                    width: "100%", padding: "8px 12px", borderRadius: "6px",
                                    border: "1px solid #d1d5db", fontSize: "14px",
                                    fontFamily: "inherit", resize: "vertical"
                                }}
                            />
                             <div style={{ height: "3px", width: "100%", background: "#e5e7eb", marginTop: "4px", borderRadius: "2px" }}>
                                <div style={{ height: "100%", background: getDescColor(), width: `${Math.min((descCount / 160) * 100, 100)}%`, borderRadius: "2px", transition: "width 0.2s" }} />
                            </div>
                        </div>

                        {/* GOOGLE PREVIEW */}
                        <div style={{ background: "#fff", borderRadius: "8px", padding: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div style={{ fontSize: "10px", fontWeight: "600", color: "#9ca3af", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Vista previa en Google
                            </div>
                            
                            <div style={{ fontFamily: "arial, sans-serif" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ fontSize: "12px" }}>🌐</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "12px", color: "#202124" }}>Tu Sitio Web</span>
                                        <span style={{ fontSize: "11px", color: "#4d5156" }}>https://tusitioweb.com/ejemplo</span>
                                    </div>
                                </div>
                                <div style={{ 
                                    color: "#1a0dab", 
                                    fontSize: "18px", 
                                    lineHeight: "1.2", 
                                    marginBottom: "3px",
                                    overflow: "hidden", 
                                    textOverflow: "ellipsis", 
                                    whiteSpace: "nowrap",
                                    cursor: "pointer"
                                }}>
                                    {state.title || "Escribe un título para tu página"}
                                </div>
                                <div style={{ 
                                    color: "#4d5156", 
                                    fontSize: "13px", 
                                    lineHeight: "1.58",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden"
                                }}>
                                    {state.description || "Proporciona una descripción meta útil e informativa para tu página."}
                                </div>
                            </div>

                        </div>

                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() { return JSON.stringify({ title: "", description: "" }); },
        parse(value) { return parseAsNormalField(value); },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return parseAsNormalField(value); } },
    };
}
