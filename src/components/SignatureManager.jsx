import { useState, useRef } from 'react';
import { saveSignature, getSignatures, deleteSignature, validateImageFile } from '../utils/storageUtils';

const SignatureManager = ({ onSignatureSelect }) => {
  const [signatures, setSignatures] = useState(getSignatures());
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target.result);
        setShowCropModal(true);
        setError('');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCropAndSave = () => {
    if (!tempImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match cropped area or full image if no crop
      const cropW = cropArea.width || img.width;
      const cropH = cropArea.height || img.height;
      const cropX = cropArea.x || 0;
      const cropY = cropArea.y || 0;

      canvas.width = cropW;
      canvas.height = cropH;

      // Draw cropped image
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Get base64 data
      const croppedImage = canvas.toDataURL('image/png');

      // Save signature
      try {
        const newSig = saveSignature({ image: croppedImage });
        setSignatures(getSignatures());
        setShowCropModal(false);
        setTempImage(null);
        setCropArea({ x: 0, y: 0, width: 0, height: 0 });
        setError('');
      } catch (err) {
        setError(err.message);
      }
    };
    img.src = tempImage;
  };

  const handleSkipCrop = () => {
    if (!tempImage) return;

    try {
      const newSig = saveSignature({ image: tempImage });
      setSignatures(getSignatures());
      setShowCropModal(false);
      setTempImage(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this signature?')) {
      deleteSignature(id);
      setSignatures(getSignatures());
      if (selectedSignature?.id === id) {
        setSelectedSignature(null);
      }
    }
  };

  const handleSelectSignature = (sig) => {
    setSelectedSignature(sig);
    onSignatureSelect(sig);
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-5 py-4 border-b border-primary-200">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h2 className="text-lg font-bold text-primary-900">Signature Manager</h2>
        </div>
        <p className="text-xs text-primary-600 mt-1">Upload and manage your digital signatures</p>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-pulse">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 mb-5"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Upload Signature</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />

        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-3">
          {signatures.length === 0 ? (
            <div className="text-center py-8 px-4">
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <p className="text-sm text-gray-500 font-medium">No signatures saved</p>
              <p className="text-xs text-gray-400 mt-1">Upload your first signature to get started</p>
            </div>
          ) : (
            signatures.map((sig) => (
              <div
                key={sig.id}
                className={`group border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  selectedSignature?.id === sig.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
                onClick={() => handleSelectSignature(sig)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
                      <img src={sig.image} alt="Signature" className="h-14 w-auto object-contain" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Signature #{sig.id}</p>
                      {selectedSignature?.id === sig.id && (
                        <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sig.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCropModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Crop Signature (Optional)</h3>
              <p className="text-primary-100 text-sm mt-1">Adjust your signature before saving</p>
            </div>
            <div className="p-6">
              <div className="mb-4 max-h-96 overflow-auto border-2 border-gray-200 rounded-lg bg-gray-50">
                <img src={tempImage} alt="Preview" className="w-full" />
              </div>
              <p className="text-sm text-gray-600 mb-5 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
                <strong className="text-blue-700">Tip:</strong> You can crop the signature or use it as is.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSkipCrop}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Use as is
                </button>
                <button
                  onClick={handleCropAndSave}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Crop & Save
                </button>
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setTempImage(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureManager;
