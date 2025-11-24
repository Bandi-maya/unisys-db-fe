import './App.css'
import { useEffect, useState } from "react";
import { initialData } from "./components/data";
import FirestoreTree from "./components/FirestoreTree";
import CollectionView from "./components/CollectionView";
import DocumentView from "./components/DocumentView";

export default function App() {
  const [db, setDb] = useState(initialData);
  const [selectedCollection, setSelectedCollection] = useState()
  const [selectedDocument, setSelectedDocument] = useState<any>()
  const [prevPath, setPrevPath] = useState('')

  const handleSelectCollection = (colData: any) => {
    setSelectedCollection(colData)
    setSelectedDocument(undefined)
  };

  const handleSelectDocument = (docData: any, col: any = {}) => {
    setSelectedCollection(col)
    setSelectedDocument(docData)
  };

  useEffect(() => {
    if (selectedCollection?.['path']) {
      setPrevPath(selectedCollection?.['path'])
    }
  }, [selectedCollection])

  return (
    <div className="h-screen flex bg-gray-100">


      {/* LEFT FIRESTORE TREE */}
      <div className="w-72 bg-white border-r p-4 overflow-y-auto">
        {prevPath}
        <h2 className="text-xl font-bold mb-4">Firestore</h2>

        <FirestoreTree
          data={db}
          onSelectCollection={(data: any) => {
            // setPrevPath(col)
            handleSelectCollection(data)
          }}
          onSelectDocument={(doc: any, colData: any) => {
            // setPrevPath('/' + col + '/' + id)
            handleSelectDocument(doc, colData)
          }
          }
        />
      </div>

      {/* COLLECTION VIEW */}
      <div className="flex-1 bg-white border-r p-4 overflow-y-auto">
        {selectedCollection ? (
          <CollectionView
            collectionData={selectedCollection}
            // onAddDocument={addDocument}
            onSelectDocument={(doc: any, colData: any) => {

              handleSelectDocument(doc, colData)
            }}
          />
        ) : (
          <p>Select a collection</p>
        )}
      </div>

      {/* DOCUMENT VIEW */}
      <div className="w-[35%] bg-white p-4 overflow-y-auto">
        {selectedDocument ? (
          <DocumentView
            documentData={selectedDocument}
            onSelectCollection={(data: any) => {
              handleSelectCollection(data)
            }}
          // onAddField={addField}
          // onAddSubCollection={addSubCollection}
          />
        ) : (
          <p>Select a document</p>
        )}
      </div>
    </div>
  );
}
