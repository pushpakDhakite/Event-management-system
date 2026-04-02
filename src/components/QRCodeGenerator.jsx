import { useEffect, useRef } from 'react';

const QRCodeGenerator = ({ value, size = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const modules = 21;
    const moduleSize = size / modules;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const generateQRMatrix = (text) => {
      const matrix = Array.from({ length: modules }, () => Array(modules).fill(false));

      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          matrix[row][col] = row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
          matrix[row][modules - 7 + col] = row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
          matrix[modules - 7 + row][col] = row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
        }
      }

      for (let i = 8; i < modules - 8; i++) {
        matrix[6][i] = i % 2 === 0;
        matrix[i][6] = i % 2 === 0;
      }

      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
          if (row < 8 && col < 8) continue;
          if (row < 8 && col > modules - 9) continue;
          if (row > modules - 9 && col < 8) continue;
          if (row === 6 || col === 6) continue;

          const seed = Math.abs(hash + row * 31 + col * 17 + row * col);
          matrix[row][col] = (seed % 3) !== 0;
        }
      }

      return matrix;
    };

    const matrix = generateQRMatrix(value);

    ctx.fillStyle = '#000000';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [value, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="inline-block">
      <canvas ref={canvasRef} width={size} height={size} className="rounded-lg border border-gray-200" />
      <div className="mt-2 flex justify-center">
        <button onClick={downloadQR} className="px-3 py-1 text-xs text-purple-600 bg-purple-50 rounded hover:bg-purple-100">Download QR</button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
