import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Assuming useParams is available in the parent or if needed here, 
// but we'll assume the path components are passed via documentData for simplicity.

// --- API ENDPOINT CONFIGURATION ---
const API_BASE_URL = 'http://localhost:8000';
const API_DOCS_PATH = '/api/v1/documents/';

// Helper function to try and parse JSON or return string value
const formatValue = (value: any) => {
  try {
    // Attempt to pretty-print objects/arrays
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
  } catch (e) {
    // Ignore parsing errors, return value as is
  }
  return String(value);
};


export default function DocumentView({
  docId,
  collectionName,
  onAddField,
  setCollection,
  path,
  onAddSubCollection
}: any) {

  // --- NEW STATE FOR FETCHED DATA ---
  const [fetchedDocument, setFetchedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldKey, setFieldKey] = useState("");
  const [subCollections, setSubCollections] = useState([]);
  const documentToDisplay = fetchedDocument || {};
  const [fieldVal, setFieldVal] = useState("");
  const [subColName, setSubColName] = useState("");
  const { pathname } = useLocation()

  // --- 1. FETCH DATA EFFECT ---
  useEffect(() => {
    // Attempt to extract the necessary path components
    // NOTE: You must ensure the parent component provides these path details in documentData!
    const dbName = pathname.split('/')[2]; // Assumes path structure: /database/{dbName}/{collectionName}/{docId}

    // console.log(dbName, collectionName, docId)
    // if (!dbName || !collectionName || !docId) {
    //   setLoading(false);
    //   setError("Missing database or collection context in document data.");
    //   return;
    // }

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);

      // API URL: http://localhost:8000/api/v1/documents/{dbname}/{collectionName}/{docId}
      const url = `${API_BASE_URL}${API_DOCS_PATH}${dbName}/${path}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `HTTP error: ${response.status}`);
        }

        // API is expected to return { data: { field1: value1, ... }, subcollections: [...] }
        const result = await response.json();

        // Use the data part of the response
        setFetchedDocument(result.data || {});
        setSubCollections(result.subcollections || [])
      } catch (err: any) {
        console.error("Document fetch error:", err);
        setError(err.message || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [path]);


  const handleAddFieldClick = () => {
    if (!fieldKey) return;
    // In a real app, this would trigger a PUT API call to update the document.
    console.log(`Simulating API call: UPDATE ${docId} SET ${fieldKey} = ${fieldVal}`);

    onAddField(fieldKey, fieldVal);
    // After successful API call, you'd trigger a re-fetch or state update here

    setFieldKey("");
    setFieldVal("");
  };

  // Handler for adding a subcollection (simulated)
  const handleAddSubColClick = () => {
    if (!subColName) return;
    // In a real app, this would trigger an API call to create the subcollection.
    console.log(`Simulating API call: CREATE SUBCOLLECTION ${subColName} under ${docId}`);

    onAddSubCollection(subColName);
    setSubColName("");
  };


  // --- 3. RENDERING ---

  if (loading) {
    return <p className="text-center py-8 text-blue-500">
      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
      Loading document data...
    </p>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 dark:bg-red-900 text-red-600 rounded-md">
      Error loading document: {error}
    </div>;
  }


  return (
    <div className="p-4 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-3">Document: {docId}</h2>

      {/* --- Fields Section --- */}
      <h3 className="text-lg font-semibold mb-2 border-b pb-1">Fields</h3>
      <div className="space-y-2">
        {Object.entries(documentToDisplay)
          .filter(([k]) => k !== "collections" && k !== "id") // Filter out metadata fields
          .map(([key, value]) => (
            <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm break-words">
              <b className="text-purple-500">{key}:</b>
              <pre className="inline whitespace-pre-wrap ml-2">
                {formatValue(value)}
              </pre>
            </div>
          ))}
      </div>

      {/* Add Field Section */}
      {/* <div className="mt-4 pt-3 border-t dark:border-gray-700">
        <p className="font-semibold mb-2 text-sm">Add New Field (JSON/String)</p>
        <input
          className="border p-1 rounded w-full mb-1 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Field name (e.g., status)"
          value={fieldKey}
          onChange={(e) => setFieldKey(e.target.value)}
        />
        <input
          className="border p-1 rounded w-full mb-1 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Field value (e.g., 'active' or {'key': 'value'})"
          value={fieldVal}
          onChange={(e) => setFieldVal(e.target.value)}
        />
        <button
          className={`w-full bg-purple-600 text-white py-1 rounded transition-colors ${!fieldKey.trim() && 'bg-gray-400 cursor-not-allowed'}`}
          onClick={handleAddFieldClick}
          disabled={!fieldKey.trim()}
        >
          + Add/Update Field
        </button>
      </div> */}

      {/* --- Sub-Collections Section --- */}
      <h3 className="text-lg font-semibold mt-5 mb-2 border-b pb-1">Sub-Collections</h3>

      {subCollections.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No sub-collections found.</p>
      ) : (
        subCollections.map(col => (
          <div
            key={col}
            onClick={() => {
              setCollection(col)
            }}
            className="p-2 border rounded mb-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          // Handle navigation to the subcollection view
          >
            📁 {col}
          </div>
        ))
      )}

      {/* Add Sub-Collection Section */}
      <div className="mt-3 pt-3 border-t dark:border-gray-700">
        <input
          className="border p-1 rounded w-full mb-1 dark:bg-gray-700 dark:border-gray-600"
          placeholder="subCollectionName"
          value={subColName}
          onChange={(e) => setSubColName(e.target.value)}
        />
        <button
          className={`mt-2 w-full bg-blue-600 text-white py-1 rounded transition-colors ${!subColName.trim() && 'bg-gray-400 cursor-not-allowed'}`}
          onClick={handleAddSubColClick}
          disabled={!subColName.trim()}
        >
          + Add Sub-Collection
        </button>
      </div>
    </div>
  );
}