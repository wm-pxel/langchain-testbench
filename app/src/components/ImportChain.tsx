import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { importChain } from '../api/api';
import "./style/ImportChain.css";

interface ImportChainProps {
  isImportModalOpen: boolean;
  setIsImportModalOpen: (value: boolean) => void;
}

const ImportChain: React.FC<ImportChainProps> = ({ isImportModalOpen, setIsImportModalOpen }) => {
  console.log('Rendering ImportChain'); // Add this line
  const [chainName, setChainName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  const handleChainNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChainName(event.target.value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!chainName || !selectedFile) return;
    
    try {
      await importChain(chainName, selectedFile);
      setIsImportModalOpen(false);
    } catch (error) {
      console.error('Error importing chain:', error);
      // Handle error condition, e.g., display an error message to the user
    }
  };

  const handleCancel = () => {
    setIsImportModalOpen(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsFileDragOver(true);
  };

  const handleDragLeave = () => {
    setIsFileDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsFileDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('file_upload');
    if (fileInput) {
      fileInput.click();
    }
  };  
  const isImportDisabled = !chainName || !selectedFile;

  // Check if the target container element exists
  const containerElement = document.getElementById('chain-import-modal');
  if (!containerElement) {
    return null; // Return null if the container element is not found
  }

  // Render the ImportChain component using ReactDOM.createPortal
  return ReactDOM.createPortal(
    <>
      {isImportModalOpen && (
        <div className="chain-import-modal">
          <div className="modal-content">
            <div className='input-group'>
              <label htmlFor="chain_name">Chain Name:</label>
              <input
                type="text"
                id="chain_name"
                value={chainName}
                onChange={handleChainNameChange}
              />
            </div>
            <div className='drop-area-outer'>
              <div
                className={`drop-area ${isFileDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <p>Drag and drop a file in this are</p>
                <p>or click the button below to upload.</p>
                <div className='button-container'>
                  <button type="button">Browse</button>
                </div>
              </div>
            </div>
            <input
              type="file"
              id="file_upload"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button disabled={isImportDisabled} onClick={handleImport}>Import</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
    </>,
    containerElement // Use the container element as the target for ReactDOM.createPortal
  );
};

export default ImportChain;