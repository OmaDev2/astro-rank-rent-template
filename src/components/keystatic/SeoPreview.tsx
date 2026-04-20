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

/* ── Helpers de semáforo ─────────────────────────────────────── */
type TrafficLight = "empty" | "green" | "warning" | "red";

function getTitleStatus(len: number): TrafficLight {
    if (len === 0) return "empty";
    if (len >= 40 && len <= 60) return "green";
    if (len < 40 || (len > 60 && len <= 70)) return "warning";
    return "red";
}

function getDescStatus(len: number): TrafficLight {
    if (len === 0) return "empty";
    if (len >= 120 && len <= 160) return "green";
    if (len < 120 || (len > 160 && len <= 175)) return "warning";
    return "red";
}

const COLORS: Record<TrafficLight, string> = {
    empty:   "#9ca3af",
    green:   "#10b981",
    warning: "#f59e0b",
    red:     "#ef4444",
};

const LABELS: Record<TrafficLight, string> = {
    empty:   "Sin rellenar",
    green:   "✅ Óptimo para Google",
    warning: "⚠️ Mejorable",
    red:     "🚫 Demasiado largo",
};

function TrafficLightDot({ status }: { status: TrafficLight }) {
    return (
        <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: COLORS[status],
            boxShadow: status !== "empty" ? `0 0 5px 1px ${COLORS[status]}55` : "none",
            marginRight: "6px",
            flexShrink: 0,
        }} />
    );
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

            const titleLen = state.title.length;
            const descLen  = state.description.length;
            const titleStatus = getTitleStatus(titleLen);
            const descStatus  = getDescStatus(descLen);

            // Puntuación global 0–100
            const titleScore = titleLen === 0 ? 0
                : titleLen >= 40 && titleLen <= 60 ? 50
                : titleLen < 40 ? Math.round((titleLen / 40) * 40)
                : titleLen <= 70 ? 30 : 0;
            const descScore = descLen === 0 ? 0
                : descLen >= 120 && descLen <= 160 ? 50
                : descLen < 120 ? Math.round((descLen / 120) * 40)
                : descLen <= 175 ? 30 : 0;
            const totalScore = titleScore + descScore;
            const scoreColor = totalScore >= 80 ? "#10b981" : totalScore >= 50 ? "#f59e0b" : "#ef4444";
            const scoreLabel = totalScore >= 80 ? "Bueno" : totalScore >= 50 ? "Mejorable" : "Deficiente";

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* ── Puntuación global ─────────────────────────── */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "14px",
                            background: "#f8fafc", borderRadius: "10px",
                            padding: "12px 16px", border: "1px solid #e2e8f0"
                        }}>
                            {/* Gauge arc simple */}
                            <div style={{ position: "relative", width: "56px", height: "56px", flexShrink: 0 }}>
                                <svg viewBox="0 0 56 56" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                                    <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                    <circle cx="28" cy="28" r="22" fill="none"
                                        stroke={scoreColor} strokeWidth="6"
                                        strokeDasharray={`${(totalScore / 100) * 138} 138`}
                                        strokeLinecap="round"
                                        style={{ transition: "stroke-dasharray 0.4s ease" }}
                                    />
                                </svg>
                                <div style={{
                                    position: "absolute", inset: 0, display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontSize: "13px", fontWeight: "700", color: scoreColor
                                }}>{totalScore}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: "700", fontSize: "14px", color: scoreColor }}>{scoreLabel}</div>
                                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                                    Puntuación SEO On-Page (0–100)
                                </div>
                                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                                    Título: {titleScore}/50 · Descripción: {descScore}/50
                                </div>
                            </div>
                        </div>

                        {/* ── Meta Title ─────────────────────────────────── */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center" }}>
                                    <TrafficLightDot status={titleStatus} />
                                    Meta Title
                                </label>
                                <span style={{ fontSize: "12px", color: COLORS[titleStatus], fontWeight: "600" }}>
                                    {titleLen} / 60 &nbsp;·&nbsp; {LABELS[titleStatus]}
                                </span>
                            </div>
                            <input
                                type="text"
                                value={state.title}
                                onChange={(e) => update({ ...state, title: e.target.value })}
                                placeholder="Ej: Carpintería de Aluminio en Málaga | Presupuesto Gratis"
                                style={{
                                    width: "100%", padding: "8px 12px", borderRadius: "6px",
                                    border: `1.5px solid ${COLORS[titleStatus]}`,
                                    fontSize: "14px", fontFamily: "inherit",
                                    outline: "none", transition: "border-color 0.2s",
                                    boxSizing: "border-box",
                                }}
                            />
                            {/* Barra de progreso segmentada */}
                            <div style={{ display: "flex", gap: "2px", marginTop: "5px" }}>
                                {[...Array(15)].map((_, i) => {
                                    const filled = i < Math.round((titleLen / 70) * 15);
                                    const isOver = titleLen > 60 && i >= Math.round((60 / 70) * 15);
                                    return (
                                        <div key={i} style={{
                                            flex: 1, height: "4px", borderRadius: "2px",
                                            background: filled ? (isOver ? "#ef4444" : COLORS[titleStatus]) : "#e5e7eb",
                                            transition: "background 0.2s",
                                        }} />
                                    );
                                })}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>
                                <span>Mínimo recomendado: 40</span>
                                <span>Máximo Google: 60</span>
                            </div>
                        </div>

                        {/* ── Meta Description ───────────────────────────── */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center" }}>
                                    <TrafficLightDot status={descStatus} />
                                    Meta Description
                                </label>
                                <span style={{ fontSize: "12px", color: COLORS[descStatus], fontWeight: "600" }}>
                                    {descLen} / 160 &nbsp;·&nbsp; {LABELS[descStatus]}
                                </span>
                            </div>
                            <textarea
                                value={state.description}
                                rows={3}
                                onChange={(e) => update({ ...state, description: e.target.value })}
                                placeholder="Describe la página de forma atractiva con tu keyword principal y una llamada a la acción..."
                                style={{
                                    width: "100%", padding: "8px 12px", borderRadius: "6px",
                                    border: `1.5px solid ${COLORS[descStatus]}`,
                                    fontSize: "14px", fontFamily: "inherit", resize: "vertical",
                                    outline: "none", transition: "border-color 0.2s",
                                    boxSizing: "border-box",
                                }}
                            />
                            <div style={{ display: "flex", gap: "2px", marginTop: "5px" }}>
                                {[...Array(18)].map((_, i) => {
                                    const filled = i < Math.round((descLen / 175) * 18);
                                    const isOver = descLen > 160 && i >= Math.round((160 / 175) * 18);
                                    return (
                                        <div key={i} style={{
                                            flex: 1, height: "4px", borderRadius: "2px",
                                            background: filled ? (isOver ? "#ef4444" : COLORS[descStatus]) : "#e5e7eb",
                                            transition: "background 0.2s",
                                        }} />
                                    );
                                })}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>
                                <span>Mínimo recomendado: 120</span>
                                <span>Máximo Google: 160</span>
                            </div>
                        </div>

                        {/* ── Google SERP Preview ────────────────────────── */}
                        <div style={{
                            background: "#fff", borderRadius: "10px", padding: "16px",
                            border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                        }}>
                            <div style={{
                                fontSize: "10px", fontWeight: "700", color: "#9ca3af",
                                marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em",
                                display: "flex", alignItems: "center", gap: "6px"
                            }}>
                                <span>🔍</span> Vista previa en Google (SERP)
                            </div>
                            <div style={{ fontFamily: "arial, sans-serif" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <div style={{
                                        width: "24px", height: "24px", borderRadius: "50%",
                                        background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        <span style={{ fontSize: "12px" }}>🌐</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "12px", color: "#202124" }}>Tu Sitio Web</span>
                                        <span style={{ fontSize: "11px", color: "#4d5156" }}>https://tusitioweb.com › pagina</span>
                                    </div>
                                </div>
                                <div style={{
                                    color: "#1a0dab", fontSize: "18px", lineHeight: "1.3",
                                    marginBottom: "4px", overflow: "hidden",
                                    textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer",
                                    borderBottom: titleLen > 60 ? "2px solid #fca5a5" : "none",
                                }}>
                                    {state.title || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Escribe un título para la página…</span>}
                                    {titleLen > 60 && (
                                        <span style={{
                                            background: "#fca5a5", color: "#7f1d1d",
                                            fontSize: "10px", padding: "1px 5px", borderRadius: "3px",
                                            marginLeft: "6px", verticalAlign: "middle", fontWeight: "600"
                                        }}>TRUNCADO</span>
                                    )}
                                </div>
                                <div style={{
                                    color: "#4d5156", fontSize: "13px", lineHeight: "1.58",
                                    display: "-webkit-box", WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical", overflow: "hidden"
                                }}>
                                    {state.description || <span style={{ fontStyle: "italic" }}>Proporciona una descripción meta útil e informativa para tu página.</span>}
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
