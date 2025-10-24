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

      const cropW = cropArea.width || img.width;
      const cropH = cropArea.height || img.height;
      const cropX = cropArea.x || 0;
      const cropY = cropArea.y || 0;

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const croppedImage = canvas.toDataURL('image/png');

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Signature Manager</h2>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-3 rounded-md transition-colors mb-3 text-sm"
        >
          Upload Signature
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />

        <canvas ref={canvasRef} className="hidden" />

        <div className="space-y-2">
          {signatures.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No signatures saved</p>
          ) : (
            signatures.map((sig) => (
              <div
                key={sig.id}
                className={`border rounded-md p-2 cursor-pointer transition-all ${
                  selectedSignature?.id === sig.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectSignature(sig)}
              >
                <div className="flex items-center justify-between">
                  <img src={sig.image} alt="Signature" className="h-10 object-contain" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sig.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-2xl w-full mx-4">
            <h3 className="text-base font-semibold mb-3">Crop Signature (Optional)</h3>
            <div className="mb-3 max-h-80 overflow-auto border rounded">
              <img src={tempImage} alt="Preview" className="w-full" />
            </div>
            <p className="text-xs text-gray-600 mb-3">
              You can crop the signature or use it as is.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSkipCrop}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-md text-sm"
              >
                Use as is
              </button>
              <button
                onClick={handleCropAndSave}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md text-sm"
              >
                Crop & Save
              </button>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setTempImage(null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureManager;
