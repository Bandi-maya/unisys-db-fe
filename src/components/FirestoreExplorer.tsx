import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CollectionView from "./CollectionView";
import DocumentView from "./DocumentView";
import { API_BASE_URL } from '../constants';
import CollectionListItem from './Collections'; // Assuming this component is defined elsewhere

// --- API ENDPOINT CONFIGURATION ---
const API_COLLECTIONS_PATH = '/databases/';

export default function FirestoreExplorer() {
    const { dbName } = useParams();
    const location = useLocation();

    const [selectedCollection, setSelectedCollection] = useState<any>();
    const [selectedDocument, setSelectedDocument] = useState<any>();
    const [currentPath, setCurrentPath] = useState(location.pathname);

    // State for the fetched collections
    const [dbCollections, setDbCollections] = useState<string[]>([]);
    const [loadingCollections, setLoadingCollections] = useState(true);
    const [collectionError, setCollectionError] = useState<string | null>(null);

    // --- NEW STATE for Collection Creation ---
    const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
    const [newColName, setNewColName] = useState("");
    const [isCreatingCol, setIsCreatingCol] = useState(false);
    const [colCreationStatus, setColCreationStatus] = useState<string | null>(null);


    // Handlers
    const handleSelectCollection = (collectionName: string) => {
        const colData = {
            name: collectionName,
            path: `/database/${dbName}/${collectionName}`
        };
        setSelectedCollection(colData);
        setSelectedDocument(undefined);
    };

    const handleSelectDocument = (docData: any, col: any = {}) => {
        setSelectedCollection(col);
        setSelectedDocument(docData);
    };

    // Effect to update the current path display
    useEffect(() => {
        const path = selectedDocument?.['path'] || selectedCollection?.['path'] || `/database/${dbName}`;
        setCurrentPath(path);
    }, [selectedCollection, selectedDocument, dbName]);


    // Effect: Fetch Collections on dbName Change (and on successful creation)
    useEffect(() => {
        if (!dbName) return;

        const fetchCollections = async () => {
            setLoadingCollections(true);
            setCollectionError(null);

            const url = `${API_BASE_URL}/databases/${dbName}/collections`;

            try {
                const response = await fetch(url);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `HTTP error: ${response.status}`);
                }

                const data: string[] = await response.json();
                setDbCollections(data);
            } catch (err: any) {
                console.error("Collection fetch error:", err);
                setCollectionError(err.message || "Failed to load collections.");
            } finally {
                setLoadingCollections(false);
            }
        };

        fetchCollections();
    }, [dbName, isCreatingCol]); // Dependency on isCreatingCol ensures refresh after creation attempt


    // --- NEW HANDLER: Create Collection API Call ---
    const handleCreateCollection = async () => {
        const colName = newColName.trim();
        if (!colName) return;

        setIsCreatingCol(true);
        setColCreationStatus(null);

        // API URL: /databases/{dbname}/collections/{collection_name}
        const url = `${API_BASE_URL}${API_COLLECTIONS_PATH}${dbName}/collections/${colName}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Creation failed: ${response.status}`);
            }

            // Success: Reset input, hide form, show success message, and trigger fetch
            setNewColName("");
            setShowNewCollectionInput(false);
            setColCreationStatus(`Collection '${colName}' created successfully.`);

            // Re-fetch the collection list (triggered by the dependency on isCreatingCol)

        } catch (error: any) {
            console.error("Collection creation error:", error);
            setColCreationStatus(`Error: ${error.message}`);
        } finally {
            setIsCreatingCol(false);
            // Clear status after a short delay
            setTimeout(() => setColCreationStatus(null), 5000);
        }
    };


    return (
        <div className="h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">

            {/* LEFT COLLECTIONS TREE (MongoDB structure) */}
            <div className="w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 overflow-y-auto">
                <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                    DB: {dbName} 💾
                </h2>
                <p className="text-sm text-gray-500 mb-4 truncate" title={currentPath}>
                    Path: {currentPath}
                </p>

                <h3 className="font-semibold text-lg mb-2 border-b pb-1 text-gray-700 dark:text-gray-300 flex justify-between items-center">
                    Collections
                    {/* Button to toggle input visibility */}
                    <button
                        onClick={() => setShowNewCollectionInput(!showNewCollectionInput)}
                        className="text-xs px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                    >
                        {showNewCollectionInput ? 'Cancel' : '+ New'}
                    </button>
                </h3>

                {/* --- Collection Creation Input Section --- */}
                {showNewCollectionInput && (
                    <div className="mb-4 p-3 border border-indigo-300 dark:border-indigo-600 rounded-md bg-indigo-50 dark:bg-indigo-900/50">
                        <input
                            className="border p-1 rounded w-full mb-2 dark:bg-gray-700 dark:border-gray-600 text-sm"
                            placeholder="New Collection Name"
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            disabled={isCreatingCol}
                        />
                        <button
                            className={`w-full py-1 rounded text-sm transition-colors ${newColName.trim() && !isCreatingCol
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                                }`}
                            onClick={handleCreateCollection}
                            disabled={!newColName.trim() || isCreatingCol}
                        >
                            {isCreatingCol ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                )}

                {colCreationStatus && (
                    <div className={`p-2 mb-4 text-sm rounded-md ${colCreationStatus.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {colCreationStatus}
                    </div>
                )}
                {/* ----------------------------------- */}

                {loadingCollections && (
                    <p className="text-blue-500 text-sm mt-4">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
                        Loading collections...
                    </p>
                )}

                {collectionError && (
                    <div className="p-2 bg-red-100 dark:bg-red-900 text-red-600 text-sm rounded-md">
                        Error: {collectionError}
                    </div>
                )}

                {!loadingCollections && !collectionError && (
                    <div className="space-y-1">
                        {dbCollections.length === 0 ? (
                            <p className="text-gray-500 text-sm">No collections found.</p>
                        ) : (
                            // Render the list of fetched collection names
                            dbCollections.map((colName) => {
                                if (!colName.includes('.'))
                                    return <CollectionListItem
                                        key={colName}
                                        name={colName}
                                        isSelected={selectedCollection?.name === colName}
                                        onSelect={() => handleSelectCollection(colName)}
                                    />
                            })
                        )}
                    </div>
                )}
            </div>

            {/* COLLECTION VIEW (Middle Panel) */}
            <div className="flex-1 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 overflow-y-auto">
                {selectedCollection ? (
                    <CollectionView
                        collectionData={selectedCollection}
                        onSelectDocument={handleSelectDocument}
                    />
                ) : (
                    <p className="text-gray-500 text-center pt-10">Select a collection from the left panel to view documents.</p>
                )}
            </div>

            {/* DOCUMENT VIEW (Right Panel) */}
            <div className="w-[35%] bg-white dark:bg-gray-800 p-4 overflow-y-auto">
                {selectedDocument ? (
                    <DocumentView
                        docId={selectedDocument?._id}
                        collectionName={selectedCollection.name}
                    // Assume DocumentView uses the full selectedDocument prop to fetch data
                    />
                ) : (
                    <p className="text-gray-500 text-center pt-10">Select a document to view its fields.</p>
                )}
            </div>
        </div>
    );
}