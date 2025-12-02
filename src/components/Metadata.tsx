import { useEffect, useState } from "react";
import { API_BASE_URL } from "../constants";

export default function Metadata() {
    const [fields, setFields] = useState<any>({});
    const [selectedField, setSelectedField] = useState<any>(null);

    const tabs = ["Basic", "Validation", "UI", "Database", "Security", "Advanced"];
    const [activeTab, setActiveTab] = useState("Basic");

    // Fetch metadata
    useEffect(() => {
        const db = window.location.pathname.split("/")[3];
        const path = window.location.pathname.split("/").slice(4).join("/");
        const url = `${API_BASE_URL}/metadata/${db}/${path}`;

        const load = async () => {
            const res = await fetch(url);
            const json = await res.json();
            const tableName = Object.keys(json.data)[0];
            const fieldDefs = json.data[tableName];

            setFields(fieldDefs);
            setSelectedField(Object.keys(fieldDefs)[0]);
        };

        load();
    }, []);

    const updateField = (field: any, key: any, value: any) => {
        setFields((prev: any) => ({
            ...prev,
            [field]: { ...prev[field], [key]: value }
        }));
    };

    const addField = () => {
        const newName = "new_field_" + (Object.keys(fields).length + 1);
        const template = {
            column_name: newName,
            data_type: "string",
            required: false,
            disabled: false,
            is_unique: false,
            storage_type: "",
            allowed_values: []
        };

        setFields((prev: any) => ({ ...prev, [newName]: template }));
        setSelectedField(newName);
    };

    const deleteField = (field: any) => {
        const updated: any = { ...fields };
        delete updated[field];
        setFields(updated);

        const next = Object.keys(updated)[0] || null;
        setSelectedField(next);
    };

    const save = () => {
        const tableName = "table";
        const payload = {
            data: {
                [tableName]: fields
            }
        };

        console.log("SAVE PAYLOAD:", payload);
        alert("Saved — check console!");
    };

    if (!selectedField) return <div className="p-10">Loading…</div>;

    const fieldData: any = fields[selectedField];

    return (
        <div className="flex h-[90vh]">
            {/* SIDEBAR */}
            <aside className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
                <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-semibold">Fields</h2>
                    <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={addField}
                    >
                        + Add
                    </button>
                </div>

                <ul className="space-y-1">
                    {Object.keys(fields).map((f) => (
                        <li key={f}>
                            <button
                                onClick={() => setSelectedField(f)}
                                className={`w-full text-left px-3 py-2 rounded ${f === selectedField
                                        ? "bg-blue-100 font-bold"
                                        : "hover:bg-gray-200"
                                    }`}
                            >
                                {fields[f].column_name}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* MAIN PANEL */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Editing: {fieldData.column_name}
                    </h2>

                    <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteField(selectedField)}
                    >
                        Delete Field
                    </button>
                </div>

                {/* TABS */}
                <div className="border-b mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 mr-2 ${activeTab === tab
                                    ? "border-b-2 border-blue-600 font-semibold"
                                    : "text-gray-500"
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div>
                    {activeTab === "Basic" && (
                        <BasicTab fieldData={fieldData} updateField={updateField} field={selectedField} />
                    )}

                    {activeTab === "Validation" && (
                        <ValidationTab fieldData={fieldData} updateField={updateField} field={selectedField} />
                    )}

                    {activeTab === "UI" && (
                        <UITab fieldData={fieldData} updateField={updateField} field={selectedField} />
                    )}

                    {activeTab === "Database" && (
                        <DatabaseTab fieldData={fieldData} updateField={updateField} field={selectedField} />
                    )}

                    {activeTab === "Security" && (
                        <SecurityTab fieldData={fieldData} updateField={updateField} field={selectedField} />
                    )}

                    {activeTab === "Advanced" && (
                        <AdvancedTab fieldData={fieldData} updateField={updateField} field={selectedField} />
                    )}
                </div>

                {/* SAVE BUTTON */}
                <div className="mt-6 text-right">
                    <button
                        className="bg-green-600 text-white px-6 py-2 rounded"
                        onClick={save}
                    >
                        Save
                    </button>
                </div>
            </main>
        </div>
    );
}


export function BasicTab({ field, fieldData, updateField }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="font-medium block">Column Name</label>
                <input
                    className="border p-2 w-full rounded"
                    value={fieldData.column_name}
                    onChange={(e) => updateField(field, "column_name", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">Data Type</label>
                <select
                    className="border p-2 w-full rounded"
                    value={fieldData.data_type}
                    onChange={(e) => updateField(field, "data_type", e.target.value)}
                >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="email">email</option>
                    <option value="password">password</option>
                    <option value="enum">enum</option>
                    <option value="boolean">boolean</option>
                </select>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.required || false}
                        onChange={(e) => updateField(field, "required", e.target.checked)}
                    />
                    Required
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.disabled || false}
                        onChange={(e) => updateField(field, "disabled", e.target.checked)}
                    />
                    Disabled
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.is_unique || false}
                        onChange={(e) => updateField(field, "is_unique", e.target.checked)}
                    />
                    Unique
                </label>
            </div>
        </div>
    );
}

export function ValidationTab({ field, fieldData, updateField }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="font-medium block">Minimum Length</label>
                <input
                    type="number"
                    className="border p-2 w-full rounded"
                    value={fieldData.min_length || ""}
                    onChange={(e) => updateField(field, "min_length", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">Maximum Length</label>
                <input
                    type="number"
                    className="border p-2 w-full rounded"
                    value={fieldData.max_length || ""}
                    onChange={(e) => updateField(field, "max_length", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">Regular Expression</label>
                <input
                    className="border p-2 w-full rounded"
                    placeholder="^[A-Za-z0-9]+$"
                    value={fieldData.regex || ""}
                    onChange={(e) => updateField(field, "regex", e.target.value)}
                />
            </div>

            {fieldData.data_type === "enum" && (
                <div>
                    <label className="font-medium block">Allowed Enum Values (comma separated)</label>
                    <input
                        className="border p-2 w-full rounded"
                        placeholder="red,blue,green"
                        value={(fieldData.allowed_values || []).join(",")}
                        onChange={(e) =>
                            updateField(field, "allowed_values", e.target.value.split(","))
                        }
                    />
                </div>
            )}

            {(fieldData.data_type === "number" ||
                fieldData.data_type === "float" ||
                fieldData.data_type === "int") && (
                <div className="flex gap-6">
                    <div className="w-full">
                        <label className="font-medium block">Minimum Value</label>
                        <input
                            type="number"
                            className="border p-2 w-full rounded"
                            value={fieldData.min_value || ""}
                            onChange={(e) =>
                                updateField(field, "min_value", e.target.value)
                            }
                        />
                    </div>

                    <div className="w-full">
                        <label className="font-medium block">Maximum Value</label>
                        <input
                            type="number"
                            className="border p-2 w-full rounded"
                            value={fieldData.max_value || ""}
                            onChange={(e) =>
                                updateField(field, "max_value", e.target.value)
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
export function UITab({ field, fieldData, updateField }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="font-medium block">Label</label>
                <input
                    className="border p-2 w-full rounded"
                    value={fieldData.label || ""}
                    onChange={(e) => updateField(field, "label", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">Placeholder</label>
                <input
                    className="border p-2 w-full rounded"
                    placeholder="Enter value…"
                    value={fieldData.placeholder || ""}
                    onChange={(e) => updateField(field, "placeholder", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">UI Component</label>
                <select
                    className="border p-2 w-full rounded"
                    value={fieldData.component || "input"}
                    onChange={(e) => updateField(field, "component", e.target.value)}
                >
                    <option value="input">Input</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                    <option value="switch">Toggle Switch</option>
                    <option value="date">Datepicker</option>
                    <option value="richtext">Rich Text Editor</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.show_in_table || false}
                        onChange={(e) => updateField(field, "show_in_table", e.target.checked)}
                    />
                    Show in Table
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.readonly || false}
                        onChange={(e) => updateField(field, "readonly", e.target.checked)}
                    />
                    Readonly
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.hide_in_create || false}
                        onChange={(e) =>
                            updateField(field, "hide_in_create", e.target.checked)
                        }
                    />
                    Hide in Create
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.hide_in_edit || false}
                        onChange={(e) =>
                            updateField(field, "hide_in_edit", e.target.checked)
                        }
                    />
                    Hide in Edit
                </label>
            </div>

            <div>
                <label className="font-medium block">Display Order</label>
                <input
                    type="number"
                    className="border p-2 w-full rounded"
                    value={fieldData.order || ""}
                    onChange={(e) => updateField(field, "order", e.target.value)}
                />
            </div>
        </div>
    );
}
export function DatabaseTab({ field, fieldData, updateField }: any) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.nullable || false}
                        onChange={(e) => updateField(field, "nullable", e.target.checked)}
                    />
                    Nullable
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.index || false}
                        onChange={(e) => updateField(field, "index", e.target.checked)}
                    />
                    Indexed
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.primary_key || false}
                        onChange={(e) =>
                            updateField(field, "primary_key", e.target.checked)
                        }
                    />
                    Primary Key
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.auto_increment || false}
                        onChange={(e) =>
                            updateField(field, "auto_increment", e.target.checked)
                        }
                    />
                    Auto Increment
                </label>
            </div>

            {/* FK */}
            <div>
                <label className="font-medium block">Foreign Key Table</label>
                <input
                    className="border p-2 w-full rounded"
                    placeholder="users"
                    value={fieldData?.foreign_key?.table || ""}
                    onChange={(e) =>
                        updateField(field, "foreign_key", {
                            ...fieldData.foreign_key,
                            table: e.target.value,
                        })
                    }
                />
            </div>

            <div>
                <label className="font-medium block">Foreign Key Column</label>
                <input
                    className="border p-2 w-full rounded"
                    placeholder="id"
                    value={fieldData?.foreign_key?.column || ""}
                    onChange={(e) =>
                        updateField(field, "foreign_key", {
                            ...fieldData.foreign_key,
                            column: e.target.value,
                        })
                    }
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="font-medium block">On Delete</label>
                    <select
                        className="border p-2 w-full rounded"
                        value={fieldData.on_delete || "restrict"}
                        onChange={(e) => updateField(field, "on_delete", e.target.value)}
                    >
                        <option value="restrict">restrict</option>
                        <option value="cascade">cascade</option>
                        <option value="set_null">set null</option>
                    </select>
                </div>

                <div>
                    <label className="font-medium block">On Update</label>
                    <select
                        className="border p-2 w-full rounded"
                        value={fieldData.on_update || "restrict"}
                        onChange={(e) => updateField(field, "on_update", e.target.value)}
                    >
                        <option value="restrict">restrict</option>
                        <option value="cascade">cascade</option>
                        <option value="set_null">set null</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
export function SecurityTab({ field, fieldData, updateField }: any) {
    return (
        <div className="space-y-4">
            <div>
                <label className="font-medium block">Storage Type</label>
                <select
                    className="border p-2 w-full rounded"
                    value={fieldData.storage_type || ""}
                    onChange={(e) =>
                        updateField(field, "storage_type", e.target.value)
                    }
                >
                    <option value="">None</option>
                    <option value="BCrypt">BCrypt</option>
                    <option value="SHA256">SHA256</option>
                    <option value="AES256">AES256 (Encrypt)</option>
                </select>
            </div>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={fieldData.encrypt || false}
                    onChange={(e) => updateField(field, "encrypt", e.target.checked)}
                />
                Encrypt Field
            </label>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={fieldData.mask || false}
                    onChange={(e) => updateField(field, "mask", e.target.checked)}
                />
                Mask in UI (****)
            </label>

            {/* Permissions */}
            <div>
                <label className="font-medium block">Allowed Read Roles</label>
                <input
                    className="border p-2 w-full rounded"
                    placeholder="admin,user"
                    value={(fieldData.permissions?.read_roles || []).join(",")}
                    onChange={(e) =>
                        updateField(field, "permissions", {
                            ...fieldData.permissions,
                            read_roles: e.target.value.split(","),
                        })
                    }
                />
            </div>

            <div>
                <label className="font-medium block">Allowed Write Roles</label>
                <input
                    className="border p-2 w-full rounded"
                    placeholder="admin"
                    value={(fieldData.permissions?.write_roles || []).join(",")}
                    onChange={(e) =>
                        updateField(field, "permissions", {
                            ...fieldData.permissions,
                            write_roles: e.target.value.split(","),
                        })
                    }
                />
            </div>
        </div>
    );
}
export function AdvancedTab({ field, fieldData, updateField }: any) {
    return (
        <div className="space-y-4">
            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={fieldData.generated || false}
                    onChange={(e) =>
                        updateField(field, "generated", e.target.checked)
                    }
                />
                Auto Generated
            </label>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={fieldData.computed || false}
                    onChange={(e) =>
                        updateField(field, "computed", e.target.checked)
                    }
                />
                Computed Column
            </label>

            {fieldData.computed && (
                <div>
                    <label className="font-medium block">Compute Expression</label>
                    <input
                        className="border p-2 w-full rounded"
                        placeholder="CONCAT(name, '-', id)"
                        value={fieldData.compute_expression || ""}
                        onChange={(e) =>
                            updateField(field, "compute_expression", e.target.value)
                        }
                    />
                </div>
            )}

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={fieldData.audit || false}
                    onChange={(e) => updateField(field, "audit", e.target.checked)}
                />
                Enable Audit (created_at, updated_at)
            </label>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={fieldData.soft_delete || false}
                    onChange={(e) => updateField(field, "soft_delete", e.target.checked)}
                />
                Soft Delete (deleted_at)
            </label>
        </div>
    );
}
