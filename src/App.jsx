import { useState, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import PDFViewer from './components/PDFViewer';
import { embedSignatureInPDF, formatTimestamp, downloadPDF } from './utils/pdfUtils';

function App() {
  const [userName, setUserName] = useState('');
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [placedSignatures, setPlacedSignatures] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const pdfContainerRef = useRef(null);

  const handlePDFUpload = ({ file, arrayBuffer, name }) => {
    setPdfFile(arrayBuffer);
    setPdfArrayBuffer(arrayBuffer);
    setPlacedSignatures([]);
  };

  const handlePageClick = useCallback(
    (e, pageIndex) => {
      if (!selectedSignature || !userName.trim()) {
        if (!userName.trim()) {
          alert('Please enter your name first');
        } else {
          alert('Please select a signature first');
        }
        return;
      }

      // Get the page element
      const pageElement = e.currentTarget;
      const rect = pageElement.getBoundingClientRect();
      const containerRect = pdfContainerRef.current.getBoundingClientRect();

      // Calculate relative position
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate absolute position relative to container
      const absoluteX = e.clientX - containerRect.left + pdfContainerRef.current.scrollLeft;
      const absoluteY = e.clientY - containerRect.top + pdfContainerRef.current.scrollTop;

      const newSignature = {
        id: Date.now(),
        imageData: selectedSignature.image,
        userName: userName,
        timestamp: formatTimestamp(),
        x: x,
        y: y,
        absoluteX: absoluteX,
        absoluteY: absoluteY,
        width: 150,
        height: 75,
        pageIndex: pageIndex,
      };

      setPlacedSignatures((prev) => [...prev, newSignature]);
    },
    [selectedSignature, userName]
  );

  const handleSignatureResize = (id, ref) => {
    setPlacedSignatures((prev) =>
      prev.map((sig) =>
        sig.id === id
          ? {
              ...sig,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            }
          : sig
      )
    );
  };

  const handleSignatureDragStop = (id, d) => {
    setPlacedSignatures((prev) =>
      prev.map((sig) =>
        sig.id === id
          ? {
              ...sig,
              absoluteX: d.x,
              absoluteY: d.y,
            }
          : sig
      )
    );
    setIsDragging(false);
  };

  const handleRemoveSignature = (id) => {
    setPlacedSignatures((prev) => prev.filter((sig) => sig.id !== id));
  };

  const handleExport = async () => {
    if (!pdfArrayBuffer || placedSignatures.length === 0) {
      alert('Please add at least one signature to the PDF');
      return;
    }

    try {
      // Calculate actual PDF coordinates
      const signaturesWithPDFCoords = placedSignatures.map((sig) => {
        const pageElements = document.querySelectorAll('.pdf-page');
        const pageElement = pageElements[sig.pageIndex];
        const pageCanvas = pageElement?.querySelector('canvas');

        if (pageCanvas) {
          const displayWidth = pageCanvas.offsetWidth;
          const displayHeight = pageCanvas.offsetHeight;
          const actualWidth = pageCanvas.width;
          const actualHeight = pageCanvas.height;

          const scaleX = actualWidth / displayWidth;
          const scaleY = actualHeight / displayHeight;

          return {
            ...sig,
            x: sig.x * scaleX,
            y: sig.y * scaleY,
            width: sig.width * scaleX,
            height: sig.height * scaleY,
          };
        }
        return sig;
      });

      const modifiedPdfBytes = await embedSignatureInPDF(
        pdfArrayBuffer,
        signaturesWithPDFCoords
      );
      downloadPDF(modifiedPdfBytes, 'signed-document.pdf');
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF: ' + error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar
        userName={userName}
        onUserNameChange={setUserName}
        onPDFUpload={handlePDFUpload}
        onExport={handleExport}
        hasSignatures={placedSignatures.length > 0}
        pdfFile={pdfFile}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSignatureSelect={setSelectedSignature} />

        <div className="flex-1 relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
          {!pdfFile ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-xl">
                <div className="bg-primary-100 rounded-full p-6 inline-block mb-4">
                  <svg
                    className="h-16 w-16 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload a PDF to Get Started</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Click "Upload PDF" button in the top bar to begin signing your document
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-3">
                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-base font-bold text-blue-900">Quick Start Guide</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    <div className="flex items-start space-x-2 bg-white rounded p-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Upload Signature</p>
                        <p className="text-xs text-gray-600">Upload signature in sidebar</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 bg-white rounded p-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Enter Your Name</p>
                        <p className="text-xs text-gray-600">Type name in top bar</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 bg-white rounded p-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Upload PDF</p>
                        <p className="text-xs text-gray-600">Click "Upload PDF" button</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 bg-white rounded p-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Place & Sign</p>
                        <p className="text-xs text-gray-600">Click PDF to place signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              <PDFViewer
                pdfFile={pdfFile}
                onPageClick={handlePageClick}
                containerRef={pdfContainerRef}
              />

              {placedSignatures.map((sig) => (
                <Rnd
                  key={sig.id}
                  default={{
                    x: sig.absoluteX,
                    y: sig.absoluteY,
                    width: sig.width,
                    height: sig.height,
                  }}
                  minWidth={100}
                  minHeight={50}
                  bounds="parent"
                  lockAspectRatio={true}
                  onDragStart={() => setIsDragging(true)}
                  onDragStop={(e, d) => handleSignatureDragStop(sig.id, d)}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    handleSignatureResize(sig.id, ref);
                    handleSignatureDragStop(sig.id, position);
                  }}
                  style={{
                    border: '3px dashed #6366f1',
                    background: 'rgba(99, 102, 241, 0.1)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    borderRadius: '8px',
                  }}
                  className="shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-full p-1">
                    <img
                      src={sig.imageData}
                      alt="Signature"
                      className="h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                    <button
                      onClick={() => handleRemoveSignature(sig.id)}
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                      style={{ pointerEvents: 'auto' }}
                    >
                      ×
                    </button>
                    <div
                      className="absolute left-full ml-3 top-0 text-xs bg-white px-3 py-2 border-2 border-primary-200 rounded-lg shadow-lg"
                      style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}
                    >
                      <div className="font-bold text-primary-700">Digitally signed by</div>
                      <div className="font-semibold text-gray-800">{sig.userName}</div>
                      <div className="text-gray-500 text-[10px]">{sig.timestamp}</div>
                    </div>
                  </div>
                </Rnd>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
