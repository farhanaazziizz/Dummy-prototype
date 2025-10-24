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
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">E-Signature & QR Generator</h1>
                <p className="text-primary-100 text-sm">Professional Document Signing Solution</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <svg
                className="h-5 w-5 text-green-300"
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
              <span className="text-sm text-white font-medium">100% Secure & Private</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <label className="block text-xs font-semibold text-primary-100 mb-1.5 uppercase tracking-wide">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                placeholder="Enter your name"
                className="bg-white/90 px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-sm font-medium text-gray-800 placeholder-gray-400"
                style={{ minWidth: '220px' }}
              />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-primary-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              className={`flex items-center space-x-2 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg ${
                hasSignatures && pdfFile
                  ? 'bg-accent-500 hover:bg-accent-600 text-white hover:shadow-xl transform hover:-translate-y-0.5'
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

      <div className="bg-primary-800/50 backdrop-blur-sm px-8 py-2.5">
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-primary-100">
            <strong className="font-semibold">Privacy Notice:</strong> All processing happens locally in your browser. No data is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
