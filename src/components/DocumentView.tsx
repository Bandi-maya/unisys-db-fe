import { useState } from "react";

export default function DocumentView({
  documentId,
  documentData,
  onAddField,
  onSelectCollection,
  onAddSubCollection
}: any) {
  const [fieldKey, setFieldKey] = useState("");
  const [fieldVal, setFieldVal] = useState("");
  const [subColName, setSubColName] = useState("");

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Document: {documentId}</h2>

      <h3 className="text-lg font-semibold mb-2">Fields</h3>
      {Object.entries(documentData)
        .filter(([k]) => k !== "collections")
        .map(([key, value]) => (
          <div key={key} className="mb-2">
            <b>{key}:</b> <pre className="inline">{JSON.stringify(value)}</pre>
          </div>
        ))}

      <div className="mt-3">
        <input
          className="border p-1 rounded w-full mb-1"
          placeholder="Field name"
          value={fieldKey}
          onChange={(e) => setFieldKey(e.target.value)}
        />
        <input
          className="border p-1 rounded w-full mb-1"
          placeholder="Field value"
          value={fieldVal}
          onChange={(e) => setFieldVal(e.target.value)}
        />
        <button
          className="w-full bg-purple-600 text-white py-1 rounded"
          onClick={() => {
            if (!fieldKey) return;
            onAddField(fieldKey, fieldVal);
            setFieldKey("");
            setFieldVal("");
          }}
        >
          + Add Field
        </button>
      </div>

      <h3 className="text-lg font-semibold mt-5 mb-2">Sub-Collections</h3>

      {documentData.collections &&
        Object.entries(documentData.collections).map(([col, colData]) => (
          <div key={col} className="p-2 border rounded mb-2 bg-gray-50"
            onClick={() => {
              onSelectCollection(colData)
              console.log(col, colData)
            }}
          >
            📁 {col}
          </div>
        ))}

      <div className="mt-3">
        <input
          className="border p-1 rounded w-full"
          placeholder="subCollectionName"
          value={subColName}
          onChange={(e) => setSubColName(e.target.value)}
        />
        <button
          className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
          onClick={() => {
            if (!subColName) return;
            onAddSubCollection(subColName);
            setSubColName("");
          }}
        >
          + Add Sub-Collection
        </button>
      </div>
    </div>
  );
}
