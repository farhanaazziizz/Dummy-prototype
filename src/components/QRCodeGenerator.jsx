import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const qrRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleGenerateQR = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url);
      setQrValue(url);
      setError('');
    } catch (err) {
      setError('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Logo must be PNG or JPG format');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadQR = () => {
    if (!qrValue) {
      setError('Please generate QR code first');
      return;
    }

    // Get the QR canvas
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    // Create a new canvas for the final image with logo
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    const size = 200;

    finalCanvas.width = size;
    finalCanvas.height = size;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw QR code
    ctx.drawImage(qrCanvas, 0, 0, size, size);

    // If logo exists, draw it in the center
    if (logo) {
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = size * 0.2; // Logo is 20% of QR size
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw white background for logo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        // Download
        downloadCanvas(finalCanvas);
      };
      logoImg.src = logo;
    } else {
      downloadCanvas(finalCanvas);
    }
  };

  const downloadCanvas = (canvas) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.png';
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-accent-50 to-accent-100 px-5 py-4 border-b border-accent-200">
        <div className="flex items-center space-x-2">
          <svg className="h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <h2 className="text-lg font-bold text-accent-900">QR Code Generator</h2>
        </div>
        <p className="text-xs text-accent-600 mt-1">Convert URLs into scannable QR codes</p>
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              />
              <svg className="absolute right-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleGenerateQR}
            className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Generate QR Code</span>
          </button>

          {qrValue && (
            <>
              <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Add Logo (Optional)
                </label>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 border-2 border-gray-300 mb-3"
                >
                  {logo ? '✓ Change Logo' : '+ Upload Logo'}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {logo && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-700 font-semibold">Logo uploaded successfully</span>
                    </div>
                    <button
                      onClick={() => setLogo(null)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-3 text-center">Preview</p>
                <div ref={qrRef} className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
                  <QRCodeCanvas
                    value={qrValue}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              <button
                onClick={handleDownloadQR}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download QR Code (200x200px PNG)</span>
              </button>
            </>
          )}
        </div>

        <div className="mt-5 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-blue-800">
              <strong className="font-semibold">Note:</strong> QR code generation is completely local. No data is sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
