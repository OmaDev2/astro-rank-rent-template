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

// ─── Reusable UI Component ──────────────────────────────────────────────────
export function IconPickerUI({ 
    value, 
    onChange, 
    label, 
    description,
    defaultValue = "CheckCircle" 
}: { 
    value: string; 
    onChange: (v: string) => void; 
    label?: string;
    description?: string;
    defaultValue?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const val = value || defaultValue;

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
        return filtered.slice(0, 100); 
    }, [search]);

    const SelectedIcon = (LucideIcons as any)[val] || LucideIcons.HelpCircle;

    const content = (
        <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
            {/* Selector Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    backgroundColor: "#1e293b",
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
                        backgroundColor: "#0f172a",
                        borderRadius: "4px",
                    }}
                >
                    <SelectedIcon size={18} color="#e2e8f0" />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#f8fafc" }}>
                        {val}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Haz clic para cambiar icono
                    </span>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        zIndex: 100,
                        width: "100%",
                        marginTop: "4px",
                        padding: "12px",
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔍 Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()} 
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #334155",
                            borderRadius: "6px",
                            backgroundColor: "#0f172a",
                            color: "#f8fafc",
                            marginBottom: "12px",
                            fontSize: "14px",
                        }}
                        autoFocus
                    />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
                            gap: "8px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            paddingRight: "4px",
                        }}
                    >
                        {filteredIcons.map((name) => {
                            const IconComponent = (LucideIcons as any)[name];
                            const isSelected = val === name;
                            return (
                                <div
                                    key={name}
                                    onClick={() => {
                                        onChange(name);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "40px",
                                        borderRadius: "6px",
                                        backgroundColor: isSelected ? "#334155" : "#0f172a",
                                        border: isSelected ? "1px solid #ef4444" : "1px solid #334155",
                                        cursor: "pointer",
                                    }}
                                    title={name}
                                >
                                    <IconComponent size={20} color={isSelected ? "#ef4444" : "#94a3b8"} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    if (label) {
        return <FieldPrimitive description={description} label={label}>{content}</FieldPrimitive>;
    }
    return content;
}

// ─── Keystatic Field Definition ─────────────────────────────────────────────
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
            return (
                <IconPickerUI 
                    value={props.value || defaultValue} 
                    onChange={props.onChange} 
                    label={label} 
                    description={description} 
                    defaultValue={defaultValue} 
                />
            );
        },
        defaultValue() { return defaultValue; },
        parse(value) { return parseAsNormalField(value, defaultValue); },
        serialize(value) { return { value }; },
        validate(value) { return value; },
        reader: { parse(value) { return parseAsNormalField(value, defaultValue); } },
    };
}
