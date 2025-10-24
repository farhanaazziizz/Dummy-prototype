import { useRef } from 'react';
import { validatePDFFile } from '../utils/storageUtils';

const TopBar = ({ userName, onUserNameChange, onPDFUpload, onExport, hasSignatures, pdfFile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validatePDFFile(file);
      const arrayBuffer = await file.readAsArrayBuffer();
      onPDFUpload({ file, arrayBuffer, name: file.name });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-white shadow-md border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">E-Signature & QR Generator</h1>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              100% Secure
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              placeholder="Enter your name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-48"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload PDF</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={onExport}
              disabled={!hasSignatures || !pdfFile}
              className={`flex items-center space-x-2 font-medium py-2 px-4 rounded-md transition-colors text-sm ${
                hasSignatures && pdfFile
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
