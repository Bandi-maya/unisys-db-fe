import { useState } from "react";

export default function CollectionView({
  collectionName,
  collectionData,
  onAddDocument,
  onSelectDocument
}: any) {
  const [newDocId, setNewDocId] = useState("");
  console.log(collectionData)

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">{collectionName} Documents</h2>

      {/* Documents */}
      {Object.entries(collectionData.documents || {}).map(([docId, doc]) => (
        <div
          key={docId}
          className="p-3 border rounded mb-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onSelectDocument(doc, collectionData)}
        >
          <b>{docId}</b>
        </div>
      ))}

      {/* Add document */}
      <div className="mt-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="newDocumentId"
          value={newDocId}
          onChange={(e) => setNewDocId(e.target.value)}
        />
        <button
          className="mt-2 w-full bg-green-600 text-white py-1 rounded"
          onClick={() => {
            if (!newDocId.trim()) return;
            onAddDocument(newDocId);
            setNewDocId("");
          }}
        >
          + Add Document
        </button>
      </div>
    </div>
  );
}
