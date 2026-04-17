import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import React, { useState, useMemo, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";

const iconNames = Object.keys(LucideIcons).filter(
    (key) => key !== "createLucideIcon" && key !== "default" && key === key.charAt(0).toUpperCase() + key.slice(1)
);

function parseAsNormalField(value: FormFieldStoredValue, defaultValue: string) {
    if (value === undefined || value === null) {
        return defaultValue;
    }
    if (typeof value !== "string") {
        throw new Error("Must be a string");
    }
    return value;
}

export function IconPicker({
    label,
    description,
    defaultValue = "CheckCircle",
}: {
    label: string;
    description?: string;
    defaultValue?: string;
}): BasicFormField<string> {
    return {
        kind: "form",
        formKind: undefined,
        label,
        Input(props) {
            const [isOpen, setIsOpen] = useState(false);
            const [search, setSearch] = useState("");
            const wrapperRef = useRef<HTMLDivElement>(null);

            const val = props.value || defaultValue;

            // Close when clicking outside
            useEffect(() => {
                function handleClickOutside(event: MouseEvent) {
                    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                        setIsOpen(false);
                    }
                }
                document.addEventListener("mousedown", handleClickOutside);
                return () => {
                    document.removeEventListener("mousedown", handleClickOutside);
                };
            }, [wrapperRef]);

            const filteredIcons = useMemo(() => {
                const s = search.toLowerCase();
                const filtered = iconNames.filter((name) => name.toLowerCase().includes(s));
                return filtered.slice(0, 100); // Limit to 100 to avoid freezing the browser when rendering SVGs
            }, [search]);

            const SelectedIcon = (LucideIcons as any)[val] || LucideIcons.HelpCircle;

            return (
                <FieldPrimitive description={description} label={label}>
                    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
                        {/* Selector Button */}
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                                userSelect: "none",
                                width: "100%",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: "#f3f4f6",
                                    borderRadius: "4px",
                                }}
                            >
                                <SelectedIcon size={18} color="#374151" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                                    {val}
                                </span>
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                    Clic para buscar un icono
                                </span>
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    zIndex: 50,
                                    width: "100%",
                                    marginTop: "4px",
                                    padding: "12px",
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="🔍 Buscar (ej: Home, User, Phone)..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    // Prevent Keystatic native forms from absorbing the enter key
                                    onKeyDown={(e) => e.stopPropagation()} 
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "6px",
                                        marginBottom: "12px",
                                        fontSize: "14px",
                                    }}
                                    autoFocus
                                />

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
                                        gap: "8px",
                                        maxHeight: "220px",
                                        overflowY: "auto",
                                        paddingRight: "4px",
                                    }}
                                >
                                    {filteredIcons.length > 0 ? (
                                        filteredIcons.map((name) => {
                                            const IconComponent = (LucideIcons as any)[name];
                                            const isSelected = val === name;
                                            return (
                                                <div
                                                    key={name}
                                                    onClick={() => {
                                                        props.onChange(name);
                                                        setIsOpen(false);
                                                    }}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        height: "48px",
                                                        borderRadius: "6px",
                                                        backgroundColor: isSelected ? "#eff6ff" : "#f9fafb",
                                                        border: isSelected ? "1px solid #3b82f6" : "1px solid #e5e7eb",
                                                        cursor: "pointer",
                                                        transition: "all 0.1s",
                                                    }}
                                                    title={name}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as any).style.backgroundColor = isSelected ? "#eff6ff" : "#f3f4f6";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as any).style.backgroundColor = isSelected ? "#eff6ff" : "#f9fafb";
                                                    }}
                                                >
                                                    <IconComponent size={20} color={isSelected ? "#2563eb" : "#4b5563"} />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px 0", fontSize: "14px", color: "#6b7280" }}>
                                            No se encontraron iconos
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "8px", textAlign: "center" }}>
                                    Mostrando top 100 resultados
                                </div>
                            </div>
                        )}
                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() { return defaultValue; },
        parse(value) { return parseAsNormalField(value, defaultValue); },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return parseAsNormalField(value, defaultValue); } },
    };
}
