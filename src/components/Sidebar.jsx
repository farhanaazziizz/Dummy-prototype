import SignatureManager from './SignatureManager';
import QRCodeGenerator from './QRCodeGenerator';

const Sidebar = ({ onSignatureSelect }) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <SignatureManager onSignatureSelect={onSignatureSelect} />
        <QRCodeGenerator />
      </div>
    </div>
  );
};

export default Sidebar;
