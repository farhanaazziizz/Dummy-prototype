import SignatureManager from './SignatureManager';
import QRCodeGenerator from './QRCodeGenerator';

const Sidebar = ({ onSignatureSelect }) => {
  return (
    <div className="w-96 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 h-full overflow-y-auto shadow-inner">
      <div className="p-6 space-y-6">
        <SignatureManager onSignatureSelect={onSignatureSelect} />
        <QRCodeGenerator />
      </div>
    </div>
  );
};

export default Sidebar;
