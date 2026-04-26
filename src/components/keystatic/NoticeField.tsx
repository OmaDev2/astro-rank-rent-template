import type { BasicFormField } from "@keystatic/core";

type Tone = "warning" | "info" | "tip";

const STYLES: Record<Tone, { bg: string; border: string; color: string; icon: string }> = {
    warning: { bg: "#fffbeb", border: "1px solid #f59e0b", color: "#92400e", icon: "⚠️" },
    info:    { bg: "#eff6ff", border: "1px solid #3b82f6", color: "#1e40af", icon: "ℹ️" },
    tip:     { bg: "#f0fdf4", border: "1px solid #22c55e", color: "#14532d", icon: "💡" },
};

export function noticeField({
    message,
    tone = "warning",
}: {
    message: string;
    tone?: Tone;
}): BasicFormField<string> {
    const s = STYLES[tone];
    return {
        kind: "form",
        formKind: undefined,
        label: "",
        Input() {
            return (
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: s.bg,
                    border: s.border,
                    margin: "0 0 4px",
                }}>
                    <span style={{ fontSize: "15px", lineHeight: "1.5", flexShrink: 0 }}>
                        {s.icon}
                    </span>
                    <span style={{ fontSize: "13px", color: s.color, lineHeight: "1.5", fontWeight: "500" }}>
                        {message}
                    </span>
                </div>
            );
        },
        defaultValue() { return ""; },
        parse()        { return ""; },
        serialize()    { return { value: undefined }; },
        validate(v)    { return v; },
        reader: { parse() { return ""; } },
    };
}
