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
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">QR Code Generator</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          onClick={handleGenerateQR}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Generate QR Code
        </button>

        {qrValue && (
          <>
            <div className="border-t pt-3 mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Logo (Optional)
              </label>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors mb-2"
              >
                {logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoUpload}
                className="hidden"
              />
              {logo && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Logo uploaded</span>
                  <button
                    onClick={() => setLogo(null)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div ref={qrRef} className="flex justify-center p-4 bg-gray-50 rounded-md">
              <QRCodeCanvas
                value={qrValue}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <button
              onClick={handleDownloadQR}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Download QR Code (200x200px PNG)
            </button>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> QR code generation is completely local. No data is sent to any server.
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
