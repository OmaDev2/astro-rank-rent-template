import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";

const HEADING_PRESETS = [
    { value: "xs",      label: "Compacto",  scale: 0.82, desc: "−18%" },
    { value: "sm",      label: "Pequeño",   scale: 0.92, desc: "−8%"  },
    { value: "md",      label: "Normal",    scale: 1.00, desc: "base" },
    { value: "lg",      label: "Grande",    scale: 1.12, desc: "+12%" },
    { value: "xl",      label: "Impacto",   scale: 1.28, desc: "+28%" },
] as const;

const BODY_PRESETS = [
    { value: "xs",  label: "Pequeño",     px: 14, desc: "14px" },
    { value: "sm",  label: "Compacto",    px: 15, desc: "15px" },
    { value: "md",  label: "Normal",      px: 16, desc: "16px" },
    { value: "lg",  label: "Cómodo",      px: 17, desc: "17px" },
    { value: "xl",  label: "Accesible",   px: 18, desc: "18px" },
] as const;

type State = { heading: string; body: string };

const HEADING_FONT_STYLE: Record<string, React.CSSProperties> = {
    xs: { fontSize: "20px", lineHeight: 1.2 },
    sm: { fontSize: "22px", lineHeight: 1.2 },
    md: { fontSize: "26px", lineHeight: 1.2 },
    lg: { fontSize: "30px", lineHeight: 1.2 },
    xl: { fontSize: "34px", lineHeight: 1.2 },
};

const BODY_FONT_SIZE: Record<string, string> = {
    xs: "11px", sm: "12px", md: "13px", lg: "14px", xl: "15px",
};

function Row<T extends { value: string; label: string; desc: string }>({
    options,
    selected,
    onSelect,
    renderPreview,
}: {
    options: readonly T[];
    selected: string;
    onSelect: (v: string) => void;
    renderPreview: (opt: T, isSelected: boolean) => React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {options.map((opt) => {
                const isSel = selected === opt.value;
                return (
                    <div
                        key={opt.value}
                        onClick={() => onSelect(opt.value)}
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
                            minWidth: "80px",
                            flex: 1,
                            transition: "all 0.15s",
                            position: "relative",
                        }}
                    >
                        {renderPreview(opt, isSel)}
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
    );
}

function parseAsNormalField(value: FormFieldStoredValue) {
    if (value === undefined) {
        return JSON.stringify({ heading: "md", body: "md" });
    }
    if (typeof value !== "string") {
        throw new Error("Must be a string");
    }
    return value;
}

export function TypographyScalePicker({
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
            let state: State;
            try {
                // Parseamos el valor props.value que pasa Keystatic (fuente de la verdad)
                state = props.value ? JSON.parse(props.value) : { heading: "md", body: "md" };
            } catch {
                state = { heading: "md", body: "md" };
            }

            const update = (next: State) => {
                props.onChange(JSON.stringify(next));
            };

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* HEADING SIZE */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
                                Tamaño de títulos (H1, H2, H3):
                            </div>
                            <Row
                                options={HEADING_PRESETS}
                                selected={state.heading}
                                onSelect={(v) => update({ ...state, heading: v })}
                                renderPreview={(opt, isSel) => (
                                    <div style={{
                                        ...HEADING_FONT_STYLE[opt.value],
                                        fontWeight: 700,
                                        color: isSel ? "#4f46e5" : "#374151",
                                        fontFamily: "system-ui, sans-serif",
                                        userSelect: "none",
                                        letterSpacing: "-0.02em",
                                    }}>
                                        Aa
                                    </div>
                                )}
                            />
                        </div>

                        {/* BODY SIZE */}
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
                                Tamaño de texto de párrafos:
                            </div>
                            <Row
                                options={BODY_PRESETS}
                                selected={state.body}
                                onSelect={(v) => update({ ...state, body: v })}
                                renderPreview={(opt, isSel) => (
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "3px",
                                        width: "100%",
                                    }}>
                                        {[100, 80, 60].map((w, i) => (
                                            <div key={i} style={{
                                                height: BODY_FONT_SIZE[opt.value],
                                                width: `${w}%`,
                                                background: isSel ? "#6366f1" : "#d1d5db",
                                                borderRadius: "3px",
                                                transition: "all 0.15s",
                                            }} />
                                        ))}
                                    </div>
                                )}
                            />
                        </div>

                        {/* LIVE PREVIEW */}
                        <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "16px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "10px", fontWeight: "600", color: "#9ca3af", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Vista previa
                            </div>
                            <div style={{
                                ...HEADING_FONT_STYLE[state.heading],
                                fontWeight: 700,
                                color: "#111827",
                                fontFamily: "system-ui, sans-serif",
                                letterSpacing: "-0.02em",
                                marginBottom: "8px",
                            }}>
                                Expertos en Reformas
                            </div>
                            <div style={{
                                fontSize: BODY_FONT_SIZE[state.body],
                                color: "#4b5563",
                                lineHeight: 1.6,
                                fontFamily: "system-ui, sans-serif",
                            }}>
                                Servicios profesionales en tu ciudad. Presupuesto gratuito y sin compromiso. Más de 10 años de experiencia.
                            </div>
                        </div>

                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() { return JSON.stringify({ heading: "md", body: "md" }); },
        parse(value) { return parseAsNormalField(value); },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return parseAsNormalField(value); } },
    };
}
