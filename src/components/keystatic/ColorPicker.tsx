import { FieldPrimitive } from "@keystar/ui/field";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import { HexColorInput, HexColorPicker } from "react-colorful";

function parseAsNormalField(value: FormFieldStoredValue) {
    if (value === undefined) {
        return "";
    }
    if (typeof value !== "string") {
        throw new Error("Must be a string");
    }
    return value;
}

export function ColorPicker({
    label,
    defaultValue,
    description,
}: {
    label: string;
    defaultValue?: string;
    description?: string;
}): BasicFormField<string> {
    return {
        kind: "form",
        formKind: undefined,
        label,
        Input(props) {
            return (
                <FieldPrimitive description={description} label={label}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignSelf: "flex-start",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <HexColorPicker color={props.value} onChange={props.onChange} />
                        <HexColorInput
                            color={props.value}
                            style={{
                                padding: "8px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                width: "100%",
                                fontFamily: "monospace"
                            }}
                            name={`${label} hex`}
                            onChange={props.onChange}
                            prefixed
                        />
                    </div>
                </FieldPrimitive>
            );
        },
        defaultValue() {
            return defaultValue || "";
        },
        parse(value) {
            return parseAsNormalField(value);
        },
        serialize(value) {
            return { value: value === "" ? "" : value };
        },
        validate(value) {
            return value;
        },
        reader: {
            parse(value) {
                return parseAsNormalField(value);
            },
        },
    };
}
