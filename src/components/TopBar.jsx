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
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">E-Signature & QR Generator</h1>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm text-gray-600">100% Local & Secure</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                placeholder="Enter your name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                style={{ minWidth: '200px' }}
              />
            </div>

            <div className="h-12 w-px bg-gray-300"></div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
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
              className={`flex items-center space-x-2 font-medium py-2 px-4 rounded-md transition-colors ${
                hasSignatures && pdfFile
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-t border-blue-100 px-6 py-2">
        <p className="text-xs text-blue-800">
          <strong>Privacy Notice:</strong> All processing is done locally in your browser. Your PDF and signatures are never sent to any server.
        </p>
      </div>
    </div>
  );
};

export default TopBar;
