import { useEffect, useState } from "react";
import { API_BASE_URL } from "../constants";

function FieldEditorTabs({ field, fieldData, updateField }: any) {
    const tabs = ["Basic", "Validation",
        // "UI",
        "Security", "Advanced"];
    const [active, setActive] = useState("Basic");

    return (
        <>
            <div className="border-b mb-4 flex gap-3">
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setActive(t)}
                        className={active === t ? "font-bold border-b-2" : ""}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {active === "Basic" && (
                <BasicTab field={field} fieldData={fieldData} updateField={updateField} />
            )}
            {active === "Validation" && (
                <ValidationTab field={field} fieldData={fieldData} updateField={updateField} />
            )}
            {/* {active === "UI" && (
                <UITab field={field} fieldData={fieldData} updateField={updateField} />
            )} */}
            {active === "Security" && (
                <SecurityTab field={field} fieldData={fieldData} updateField={updateField} />
            )}
            {active === "Advanced" && (
                <AdvancedTab field={field} fieldData={fieldData} updateField={updateField} />
            )}
        </>
    );
}

function TableSettingsTab({ tableSettings, updateTable }: any) {
    return (
        <div className="space-y-4">

            <div>
                <label className="font-medium block">Primary Key</label>
                <input
                    className="border p-2 w-full rounded"
                    value={tableSettings.primary_key}
                    onChange={(e) => updateTable("primary_key", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">Audit (created_at, updated_at)</label>
                <input
                    type="checkbox"
                    checked={tableSettings.audit || false}
                    onChange={(e) => updateTable("audit", e.target.checked)}
                />
            </div>

            <div>
                <label className="font-medium block">Soft Delete (deleted_at)</label>
                <input
                    type="checkbox"
                    checked={tableSettings.soft_delete || false}
                    onChange={(e) => updateTable("soft_delete", e.target.checked)}
                />
            </div>

            <div>
                <label className="font-medium block">Indexes (comma separated)</label>
                <input
                    className="border p-2 w-full rounded"
                    value={tableSettings.indexes?.join(",") || ""}
                    onChange={(e) => updateTable("indexes", e.target.value.split(","))}
                />
            </div>

            <div>
                <label className="font-medium block">Foreign Keys (JSON)</label>
                <textarea
                    className="border p-2 w-full rounded"
                    value={JSON.stringify(tableSettings.foreign_keys || [], null, 2)}
                    onChange={(e) =>
                        updateTable("foreign_keys", JSON.parse(e.target.value || "[]"))
                    }
                />
            </div>
        </div>
    );
}

function FieldsPanel({ fields, selectedField, setSelectedField, setFields }: any) {

    const addField = () => {
        const newName = "field_" + (Object.keys(fields).length + 1);
        setFields((prev: any) => ({
            ...prev,
            [newName]: {
                column_name: newName,
                data_type: "string",
                required: false
            }
        }));
        setSelectedField(newName);
    };

    const deleteField = (f: string) => {
        const updated = { ...fields };
        delete updated[f];
        setFields(updated);
        setSelectedField(Object.keys(updated)[0] || null);
    };

    return (
        <aside className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Fields</h2>
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={addField}>
                    + Add
                </button>
            </div>

            <ul className="space-y-1">
                {Object.keys(fields).map((f) => (
                    <li key={f}>
                        <button
                            onClick={() => setSelectedField(f)}
                            className={`w-full text-left px-3 py-2 rounded ${f === selectedField ? "bg-blue-100 font-bold" : "hover:bg-gray-200"
                                }`}
                        >
                            {fields[f].column_name}
                        </button>
                        {selectedField === f && (
                            <button
                                className="text-red-500 text-sm ml-2"
                                onClick={() => deleteField(f)}
                            >
                                Delete
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default function Metadata() {
    const [fields, setFields] = useState<any>({});
    const [tableSettings, setTableSettings] = useState<any>({
        primary_key: "",
        foreign_keys: [],
        indexes: [],
        audit: false,
        soft_delete: false,
    });

    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("Fields");

    const db = window.location.pathname.split("/")[3];
    const path = window.location.pathname.split("/").slice(4).join("/");
    const validKey = path.split('/').map((key, i) => i % 2 ? ":_doc_id" : key).join("$");

    const url = `${API_BASE_URL}/metadata/${db}/${validKey}`;

    // LOAD METADATA
    useEffect(() => {
        const load = async () => {
            const res = await fetch(url);
            const json = await res.json();

            const def = json.data[validKey];
            if (!def) return;

            setFields(def.fields || {});
            setSelectedField(Object.keys(def.fields || {})[0] ?? null);

            setTableSettings(def.table || {});
        };
        load();
    }, []);

    // Update field
    const updateField = (field: string, key: string, value: any) => {
        setFields((prev: any) => {
            const updated = structuredClone(prev);

            // renaming the field name
            if (key === "column_name") {
                updated[value] = { ...updated[field], column_name: value };
                delete updated[field];
                setSelectedField(value);
                return updated;
            }

            updated[field] = { ...updated[field], [key]: value };
            return updated;
        });
    };

    // Update table settings
    const updateTable = (key: string, value: any) => {
        setTableSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        const payload = {
            [validKey]: {
                table: tableSettings,
                fields: fields
            }
        };

        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert("Saved!");
    };

    return (
        <div className="flex h-[90vh]">
            <FieldsPanel
                fields={fields}
                selectedField={selectedField}
                setSelectedField={setSelectedField}
                setFields={setFields}
            />

            <main className="flex-1 p-6 overflow-y-auto">
                {/* TABS */}
                <div className="border-b mb-4 flex gap-4">
                    <button
                        onClick={() => setActiveTab("Fields")}
                        className={activeTab === "Fields" ? "font-bold border-b-2" : ""}
                    >Field Settings</button>

                    <button
                        onClick={() => setActiveTab("Table")}
                        className={activeTab === "Table" ? "font-bold border-b-2" : ""}
                    >Table Settings</button>
                </div>

                {activeTab === "Fields" && selectedField !== null && (
                    <FieldEditorTabs
                        field={selectedField}
                        fieldData={fields[selectedField]}
                        updateField={updateField}
                    />
                )}

                {activeTab === "Table" && (
                    <TableSettingsTab
                        tableSettings={tableSettings}
                        updateTable={updateTable}
                    />
                )}

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
                    value={fieldData?.column_name}
                    onChange={(e) => updateField(field, "column_name", e.target.value)}
                />
            </div>

            <div>
                <label className="font-medium block">Data Type</label>
                <select
                    className="border p-2 w-full rounded"
                    value={fieldData?.data_type}
                    onChange={(e) => updateField(field, "data_type", e.target.value)}
                >
                    <option value="string">string</option>
                    <option value="text">text</option>
                    <option value="richtext">richtext</option>

                    <option value="number">number</option>
                    <option value="int">int</option>
                    <option value="float">float</option>
                    <option value="decimal">decimal</option>
                    <option value="bigint">bigint</option>

                    <option value="boolean">boolean</option>
                    <option value="enum">enum</option>
                    <option value="array">array</option>
                    <option value="object">object</option>
                    <option value="json">json</option>

                    <option value="date">date</option>
                    <option value="time">time</option>
                    <option value="datetime">datetime</option>
                    <option value="timestamp">timestamp</option>

                    <option value="email">email</option>
                    <option value="url">url</option>
                    <option value="url_endpoint">url_endpoint</option>
                    <option value="ip">ip</option>
                    <option value="ipv4">ipv4</option>
                    <option value="ipv6">ipv6</option>
                    <option value="mac_address">mac_address</option>

                    <option value="image">image</option>
                    <option value="file">file</option>
                    <option value="video">video</option>
                    <option value="audio">audio</option>

                    <option value="uuid">uuid</option>
                    <option value="sku">sku</option>
                    <option value="slug">slug</option>

                    <option value="password">password</option>
                    <option value="hash">hash</option>
                    <option value="token">token</option>

                    <option value="reference">reference</option>
                    <option value="computed">computed</option>
                    <option value="virtual">virtual</option>
                </select>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData?.required || false}
                        onChange={(e) => updateField(field, "required", e.target.checked)}
                    />
                    Required
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData?.disabled || false}
                        onChange={(e) => updateField(field, "disabled", e.target.checked)}
                    />
                    Disabled
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData?.is_unique || false}
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
                        checked={fieldData.index || false}
                        onChange={(e) => updateField(field, "index", e.target.checked)}
                    />
                    Indexed
                </label>

                {/* <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={fieldData.primary_key || false}
                        onChange={(e) =>
                            updateField(field, "primary_key", e.target.checked)
                        }
                    />
                    Primary Key
                </label> */}

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
                {/* <div>
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
                </div> */}

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
