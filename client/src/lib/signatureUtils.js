/**
 * Safe signature capture utility
 * Handles different methods to extract signature from react-signature-canvas
 * 
 * Fixes issue with react-signature-canvas@^1.1.0-alpha.2 where getTrimmedCanvas()
 * causes: "trim_canvas__WEBPACK_IMPORTED_MODULE_8__ is not a function"
 */

/**
 * Extract signature data from SignatureCanvas ref
 * Returns Base64 data URL or null if empty
 */
export const getSignatureFromRef = (sigRef) => {
  if (!sigRef?.current) return null;
  
  const pad = sigRef.current;
  
  // Check if pad is empty
  if (pad.isEmpty && pad.isEmpty()) return null;
  
  try {
    // Method 1: Try getTrimmedCanvas (original, may fail in alpha version)
    if (typeof pad.getTrimmedCanvas === 'function') {
      try {
        const trimmedCanvas = pad.getTrimmedCanvas();
        if (trimmedCanvas && typeof trimmedCanvas.toDataURL === 'function') {
          return trimmedCanvas.toDataURL('image/png');
        }
      } catch (trimError) {
        console.warn('getTrimmedCanvas failed, falling back to getCanvas:', trimError.message);
        // Fall through to next method
      }
    }
    
    // Method 2: Try getCanvas() method
    if (typeof pad.getCanvas === 'function') {
      try {
        const canvas = pad.getCanvas();
        if (canvas && typeof canvas.toDataURL === 'function') {
          return canvas.toDataURL('image/png');
        }
      } catch (canvasError) {
        console.warn('getCanvas failed, trying direct canvas access:', canvasError.message);
        // Fall through to next method
      }
    }
    
    // Method 3: Direct canvas access (internal property)
    // SignatureCanvas typically exposes the canvas via _canvas or canvas property
    const canvas = pad._canvas || pad.canvas || (pad.ref && pad.ref.canvas);
    if (canvas && typeof canvas.toDataURL === 'function') {
      return canvas.toDataURL('image/png');
    }
    
    // Method 4: Try accessing through canvasRef if it exists
    if (pad.canvasRef && pad.canvasRef.current) {
      const refCanvas = pad.canvasRef.current;
      if (typeof refCanvas.toDataURL === 'function') {
        return refCanvas.toDataURL('image/png');
      }
    }
    
    console.error('Unable to extract canvas from SignatureCanvas - all methods failed');
    return null;
  } catch (error) {
    console.error('Unexpected error extracting signature:', error);
    return null;
  }
};

/**
 * Clear signature from SignatureCanvas ref
 */
export const clearSignatureRef = (sigRef) => {
  if (sigRef?.current && typeof sigRef.current.clear === 'function') {
    try {
      sigRef.current.clear();
    } catch (error) {
      console.error('Error clearing signature:', error);
    }
  }
};

/**
 * Check if signature pad is empty
 */
export const isSignaturePadEmpty = (sigRef) => {
  if (!sigRef?.current) return true;
  
  if (typeof sigRef.current.isEmpty === 'function') {
    try {
      return sigRef.current.isEmpty();
    } catch (error) {
      console.error('Error checking if signature is empty:', error);
      return true;
    }
  }
  
  return true;
};
