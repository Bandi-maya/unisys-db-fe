export default function FirestoreTree({ data, onSelectCollection, onSelectDocument }: any) {
  const renderLevel = (obj: any, level = 0) => {
    return Object.entries(obj).map(([colName, colData]: any) => (
      <div key={colName} className="ml-2">
        {/* Collection Node */}
        <div
          className="cursor-pointer font-semibold text-blue-600 hover:underline"
          onClick={() => onSelectCollection(colData)}
        >
          📁 {colName}
        </div>

        {/* Documents */}
        {colData?.documents &&
          Object.entries(colData?.documents).map(([docId, doc]: any) => (
            <div key={docId} className="ml-4">
              <div
                className="cursor-pointer text-gray-700 hover:underline"
                onClick={() => {
                  console.log(colData)
                  onSelectDocument(doc, colData)
                }}
              >
                📄 {docId}
              </div>

              {/* Sub-collections */}
              {doc.collections && renderLevel(doc.collections, level + 1)}
            </div>
          ))}
      </div>
    ));
  };

  return <div className="text-sm">{renderLevel(data)}</div>;
}
