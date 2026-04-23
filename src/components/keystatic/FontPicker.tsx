import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import { useState, useEffect } from "react";
import { fontPairs } from "../../config/fonts";

// Load all Google Fonts at once so previews render correctly
const ALL_FONTS_URL =
    "https://fonts.googleapis.com/css2?" +
    "family=Oswald:wght@400;700&family=Inter:wght@400;600&" +
    "family=Barlow+Condensed:wght@500;700&family=Roboto:wght@400;500&" +
    "family=Playfair+Display:wght@500;700&family=Lato:wght@400;700&" +
    "family=Nunito:wght@600;800&family=Open+Sans:wght@400;600&" +
    "family=Chakra+Petch:wght@500;700&family=Exo+2:wght@400;600&" +
    "family=Merriweather:wght@700;900&family=Lora:wght@400;500&" +
    "family=Crimson+Text:wght@600;700&family=Source+Serif+4:wght@400;500&" +
    "family=Cormorant:wght@600;700&family=EB+Garamond:wght@400;500&" +
    "family=DM+Sans:wght@400;500&" +
    "display=swap";

function loadFonts() {
    if (typeof document === "undefined") return;
    if (document.querySelector("link[data-font-picker]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = ALL_FONTS_URL;
    link.setAttribute("data-font-picker", "true");
    document.head.appendChild(link);
}

const FontCard = ({
    pairKey,
    pair,
    isSelected,
    onClick,
}: {
    pairKey: string;
    pair: typeof fontPairs[keyof typeof fontPairs];
    isSelected: boolean;
    onClick: () => void;
}) => {
    const headingFont = pair.fontHeading;
    const bodyFont = pair.fontBody;
    const [headingName] = pair.label.split(" (")[1]?.split(" / ") || [pair.label];
    const bodyName = pair.label.split(" / ")[1]?.replace(")", "") || "";

    return (
        <div
            onClick={onClick}
            style={{
                cursor: "pointer",
                border: isSelected ? "2.5px solid #6366f1" : "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px",
                background: isSelected ? "#f5f3ff" : "#fff",
                boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,0.2)" : "none",
                transition: "all 0.15s",
                position: "relative",
            }}
        >
            {/* Heading preview */}
            <div
                style={{
                    fontFamily: headingFont,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "4px",
                    lineHeight: 1.2,
                }}
            >
                Título del Sitio
            </div>

            {/* Body preview */}
            <div
                style={{
                    fontFamily: bodyFont,
                    fontSize: "11px",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: "8px",
                }}
            >
                Texto de ejemplo para describir un servicio o proyecto de la empresa.
            </div>

            {/* Labels */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{
                    fontSize: "9px", fontWeight: "700", background: "#f3f4f6",
                    color: "#374151", padding: "2px 6px", borderRadius: "4px",
                    fontFamily: headingFont,
                }}>
                    {headingName}
                </span>
                <span style={{
                    fontSize: "9px", color: "#9ca3af", padding: "2px 6px",
                    background: "#f9fafb", borderRadius: "4px", fontFamily: bodyFont,
                }}>
                    {bodyName}
                </span>
            </div>

            {/* Selected indicator */}
            {isSelected && (
                <div style={{
                    position: "absolute", top: "8px", right: "8px",
                    background: "#6366f1", borderRadius: "50%",
                    width: "18px", height: "18px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", color: "#fff",
                }}>✓</div>
            )}
        </div>
    );
};

export function FontPicker({
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
            const [selected, setSelected] = useState(props.value || "modern");

            useEffect(() => { loadFonts(); }, []);

            const handleSelect = (key: string) => {
                setSelected(key);
                props.onChange(key);
            };

            return (
                <FieldPrimitive description={description} label={label}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "10px",
                    }}>
                        {Object.entries(fontPairs).map(([key, pair]) => (
                            <FontCard
                                key={key}
                                pairKey={key}
                                pair={pair}
                                isSelected={selected === key}
                                onClick={() => handleSelect(key)}
                            />
                        ))}
                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() { return "modern"; },
        parse(value) { return (value as string) || "modern"; },
        serialize(value) { return { value: value }; },
        validate(value) { return value; },
        reader: {
            parse(value) { return (value as string) || "modern"; },
        },
    };
}
