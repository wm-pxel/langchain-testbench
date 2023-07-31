import React, { useState, useRef } from 'react';
import { importChain } from '../api/api';
import "./style/ImportChain.css";

interface ImportChainProps {
  isImportModalOpen: boolean;
  onClose: () => void;
}

const ImportChain: React.FC<ImportChainProps> = ({ isImportModalOpen, onClose }) => {

  const [chainName, setChainName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      onClose(); // Close the modal after successful import
    } catch (error) {
      console.error('Error importing chain:', error);
      // Handle error condition, e.g., display an error message to the user
    }
  };

  const handleCancel = () => {
    onClose(); // Close the modal when cancel is clicked
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isImportDisabled = !chainName || !selectedFile;

  // Render the ImportChain modal as a floating dialog
  return (
    <div className={`chain-import-modal ${isImportModalOpen ? 'open' : ''}`}>
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
            <p>Drag and drop a file in this area</p>
            <p>or click the button below to upload.</p>
            <div className='button-container'>
              <button type="button">Browse</button>
            </div>
          </div>
        </div>
        <input
          type="file"
          id="file_upload"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button disabled={isImportDisabled} onClick={handleImport}>Import</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ImportChain;
