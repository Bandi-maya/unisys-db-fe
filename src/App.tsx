import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FirestoreExplorer from './components/FirestoreExplorer';
import './App.css';

import DatabaseListComponent from './components/Databases';
import Metadata from './components/Metadata';

export default function App() {
  // Pass initialData to FirestoreExplorer, simulating data loaded for a specific database
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/databases" replace />} />

        <Route path="/databases" element={<DatabaseListComponent />} />
        <Route path="/databases/metadata/:dbName/*" element={<Metadata />} />

        <Route
          path="/database/:dbName/*"
          element={<FirestoreExplorer />}
        />

      </Routes>
    </Router>
  );
}