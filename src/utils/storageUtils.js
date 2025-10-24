// Storage utilities for managing signatures in sessionStorage

export const saveSignature = (signature) => {
  try {
    const signatures = getSignatures();
    const newSignature = {
      id: Date.now(),
      image: signature.image,
      name: signature.name || 'Signature',
      createdAt: new Date().toISOString()
    };
    signatures.push(newSignature);
    sessionStorage.setItem('signatures', JSON.stringify(signatures));
    return newSignature;
  } catch (error) {
    console.error('Error saving signature:', error);
    throw new Error('Failed to save signature');
  }
};

export const getSignatures = () => {
  try {
    const signatures = sessionStorage.getItem('signatures');
    return signatures ? JSON.parse(signatures) : [];
  } catch (error) {
    console.error('Error getting signatures:', error);
    return [];
  }
};

export const deleteSignature = (id) => {
  try {
    const signatures = getSignatures();
    const filtered = signatures.filter(sig => sig.id !== id);
    sessionStorage.setItem('signatures', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting signature:', error);
    return false;
  }
};

export const clearAllSignatures = () => {
  try {
    sessionStorage.removeItem('signatures');
    return true;
  } catch (error) {
    console.error('Error clearing signatures:', error);
    return false;
  }
};

export const validateImageFile = (file) => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG and JPG are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds 2MB limit.');
  }

  return true;
};

export const validatePDFFile = (file) => {
  const validType = 'application/pdf';
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.type !== validType) {
    throw new Error('Invalid file type. Only PDF files are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('PDF file size exceeds 10MB limit.');
  }

  return true;
};
