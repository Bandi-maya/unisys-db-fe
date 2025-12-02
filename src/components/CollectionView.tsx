import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

// --- API ENDPOINT CONFIGURATION ---
const API_DOCS_PATH = '/documents/';
const API_METADATA_PATH = '/metadata/'; // Assuming the base path for metadata

// Helper component to render a form field based on metadata
const SchemaFormField = ({ field, formData, onChange }: any) => {
  const inputClasses = "border p-2 rounded w-full mb-2 dark:bg-gray-700 dark:border-gray-600";

  // Determine the input type based on data_type or ui_type
  let type = 'text';
  if (field.data_type === 'number') type = 'number';
  if (field.data_type === 'date') type = 'date';
  if (field.ui_type === 'checkbox') type = 'checkbox';

  const value = formData[field.column_name] || (type === 'checkbox' ? false : '');

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">
        {field.display_name ?? field.column_name} {field.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className={inputClasses}
        placeholder={field.ui_placeholder || `Enter ${field.display_name}`}
        value={type !== 'checkbox' ? value : undefined}
        checked={type === 'checkbox' ? value : undefined}
        onChange={(e) => {
          let val: any = type === 'number' ? Number(e.target.value) : e.target.value;
          if (type === 'checkbox') val = e.target.checked;
          onChange(field.column_name, val);
        }}
      />
    </div>
  );
};

export default function CollectionView({
  collectionData,
  onSelectDocument,
  isDocument,
  path
}: any) {
  const { dbName } = useParams();

  const collectionName = collectionData?.name;
  const collectionPath = collectionData?.path;

  // Data States
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [metadata_collection_name, setMetadataCollectionName] = useState('')

  // Metadata States
  const [metadata, setMetadata] = useState<any>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Form States
  const [newDocId, setNewDocId] = useState("");
  const [formData, setFormData] = useState<any>({});

  const { pathname } = useLocation()

  // --- 1. Fetch Documents ---
  const fetchDocuments = async () => {
    let url = `${API_BASE_URL}${API_DOCS_PATH}${dbName}/${path}`;
    if (isDocument) {
      url = url.split('/').slice(0, -1).join('/')
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      const data = await response.json();
      setDocuments(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, [path, isDocument]);


  // --- 2. Fetch Metadata Schema ---
  useEffect(() => {
    const fetchMetadata = async () => {
      let url = `${API_BASE_URL}${API_METADATA_PATH}${dbName}/${path.split('/').map((key: any, index: any) => index % 2 === 1 ? ':_doc_id' : key).join('$')}`;
      if (isDocument) {
        url = url.split('$').slice(0, -1).join('$')
      }
      setLoadingMetadata(true);
      setMetadataError(null);
      // API URL: /metadata/{db_name}/{table_name}

      try {
        const response = await fetch(url);
        if (response.status === 404) {
          setMetadata(null); // No explicit schema found
        } else if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Metadata fetch failed: ${response.status}`);
        } else {
          const result = await response.json();
          // Assuming result.data holds the field definitions array: {fields: [...]}
          setMetadata(result.data || null);
        }
      } catch (err: any) {
        setMetadataError(err.message || "Failed to load schema metadata.");
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [path, isDocument]);

  console.log(metadata, metadata_collection_name)

  // Update formData when a field changes in the structured form
  const handleFormChange = (key: any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };


  // --- 3. Handle Add Document Click (Structured or Simple) ---
  const handleAddDocument = async () => {
    const id = newDocId.trim();
    if (!id) return;

    let dataToSend = {};

    // 1. Determine data to send
    if (metadata) {
      // Use structured form data
      dataToSend = formData;
      // Basic required field check (can be expanded)
      const requiredFields: any = Object.values(metadata[metadata_collection_name]).filter((f: any) => f.required);
      for (const field of requiredFields) {
        if (!formData[field.column_name]) {
          alert(`Required field missing: ${field.display_name}`);
          return;
        }
      }
    } else {
      // No metadata, send empty object (or simplified data)
      dataToSend = {};
    }


    setIsSaving(true);

    // 2. Construct URL and send request
    const url = `${API_BASE_URL}${API_DOCS_PATH}${dbName}/${collectionName}/${id}`;

    try {
      const response = await fetch(url, {
        method: 'POST', // Use PUT for upsert
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API Error: ${response.status}`);
      }

      // 3. Handle success and refresh
      setNewDocId("");
      setFormData({}); // Clear form

      fetchDocuments();

    } catch (error: any) {
      alert(`Creation failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">
        Collection: {collectionName}
      </h2>

      {/* Loading/Error States */}
      {(loading || loadingMetadata) && (
        <p className="text-blue-500 text-center py-8">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
          {loadingMetadata ? 'Loading Schema...' : 'Loading documents...'}
        </p>
      )}

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-600 rounded-md">
          Error loading documents: {error}
        </div>
      )}

      {/* Documents List */}
      {!loading && !error && (
        <div className="mb-6 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {documents.length === 0 ? (
            <p className="text-gray-500 italic">This collection is currently empty.</p>
          ) : (
            documents.map((doc: any) => (
              <div
                key={doc._id}
                className="p-3 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:bg-gray-800 transition-colors"
                onClick={() => {
                  onSelectDocument(doc, collectionData)
                }}
              >
                <b>{doc._id}</b>
              </div>
            ))
          )}
        </div>
      )}


      {/* --- Add Document Section --- */}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <p className="font-semibold mb-2">Create New Document</p>

        {metadataError && (
          <div className="p-2 mb-2 text-sm text-yellow-700 bg-yellow-100 rounded">
            Warning: Could not load schema. Using simple input. ({metadataError})
          </div>
        )}

        <input
          className="border p-2 rounded w-full mb-2 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Document ID (e.g., user_123)"
          value={newDocId}
          onChange={(e) => setNewDocId(e.target.value)}
          disabled={isSaving}
        />

        {/* Conditional Rendering: Structured Form vs Simple Button */}
        {!loadingMetadata && metadata && metadata[metadata_collection_name] ? (
          // --- STRUCTURED FORM (Metadata Found) ---
          <div className="mt-4 p-3 border rounded dark:border-gray-700">
            <p className="font-semibold mb-3 text-sm">Schema Found: Fill Fields</p>
            {Object.values(metadata[metadata_collection_name])
              .filter((f: any) => f.column_name !== 'id' && f.column_name !== '_id') // Exclude ID fields from internal form
              .map((field: any) => (
                <SchemaFormField
                  key={field.column_name}
                  field={field}
                  formData={formData}
                  onChange={handleFormChange}
                />
              ))}
          </div>
        ) : (
          // --- SIMPLE ADD (No Metadata or Metadata is Loading) ---
          <p className="text-gray-500 text-sm italic mb-3">No schema metadata found. Creating document with empty fields.</p>
        )}


        <button
          className={`mt-2 w-full py-2 rounded transition-colors ${newDocId.trim() && !isSaving
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
            }`}
          onClick={handleAddDocument}
          disabled={!newDocId.trim() || isSaving}
        >
          {isSaving ? 'Saving Document...' : '+ Create Document'}
        </button>
      </div>
    </div>
  );
}