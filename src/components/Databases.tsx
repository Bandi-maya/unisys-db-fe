import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export default function DatabaseListComponent() {
    const [databases, setDatabases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- NEW STATES for Creation ---
    const [newDbName, setNewDbName] = useState('');
    const [isCreatingDb, setIsCreatingDb] = useState(false);
    const [createStatus, setCreateStatus] = useState<any>(null);
    
    const navigate = useNavigate();

    // --- Data Fetching Function ---
    const fetchDatabases = async () => {
        setLoading(true);
        setError(null);
        
        // Target: /databases (on the database router)
        const url = `${API_BASE_URL}/databases`; 

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setDatabases(data);
        } catch (err: any) {
            console.error("Database fetch error:", err);
            setError(err.message || "Failed to connect to the database API.");
        } finally {
            setLoading(false);
        }
    };

    // --- API Handler for Creating/Verifying Database ---
    const handleCreateDatabase = async () => {
        const dbName = newDbName.trim();
        if (!dbName) return;

        setIsCreatingDb(true);
        setCreateStatus(null);
        
        // Target: POST /databases/{dbname}
        const url = `${API_BASE_URL}/databases/${dbName}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || `Creation failed with status: ${response.status}`);
            }

            // Success: Clear input, show success message, and trigger list refresh
            setNewDbName('');
            setCreateStatus(`Database '${dbName}' verified/created successfully.`);
            
            // Re-fetch the database list to show the new entry immediately
            await fetchDatabases(); 

            // Optionally, navigate directly to the new database
            // navigate(`/database/${dbName}`); 

        } catch (err: any) {
            console.error("Database creation error:", err);
            setCreateStatus(`Error creating database: ${err.message}`);
        } finally {
            setIsCreatingDb(false);
            // Clear status message after a delay
            setTimeout(() => setCreateStatus(null), 5000);
        }
    };

    // Initial data load effect
    useEffect(() => {
        fetchDatabases();
    }, []);

    // --- RENDERING LOGIC ---

    return (
        <div className="p-6 max-w-xl mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 border-b pb-2">
                🗄️ Available MongoDB Databases
            </h1>

            {/* Global Error Display */}
            {error && (
                <div className="p-4 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 rounded-md">
                    <p className="font-semibold">Connection Error:</p>
                    <p className="text-sm break-all">{error}</p>
                </div>
            )}
            
            {/* Database Creation Status */}
            {createStatus && (
                 <div className={`p-3 mb-4 text-sm rounded-md ${createStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {createStatus}
                 </div>
            )}
            
            {/* --- Create Database Section --- */}
            <div className="mb-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold mb-2">Initialize New Database</h3>
                <div className="flex space-x-2">
                    <input
                        className="flex-grow border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Enter new database name"
                        value={newDbName}
                        onChange={(e) => setNewDbName(e.target.value)}
                        disabled={isCreatingDb}
                    />
                    <button
                        className={`px-4 py-2 rounded transition-colors ${newDbName.trim() && !isCreatingDb
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                        }`}
                        onClick={handleCreateDatabase}
                        disabled={!newDbName.trim() || isCreatingDb}
                    >
                        {isCreatingDb ? 'Initializing...' : 'Create'}
                    </button>
                </div>
            </div>
            
            {/* --- Database List --- */}
            
            {loading && (
                <div className="text-center py-8">
                    <p className="text-blue-500">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                        Fetching databases...
                    </p>
                </div>
            )}

            {!loading && !error && (
                <div>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        Total databases found: <span className="font-semibold text-lg">{databases.length}</span>
                    </p>

                    <ul className="space-y-3">
                        {databases.map((dbName) => (
                            <li
                                key={dbName}
                                onClick={() => navigate(`/database/${dbName}`)}
                                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                <span className="font-medium text-lg">{dbName}</span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                    MongoDB
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}