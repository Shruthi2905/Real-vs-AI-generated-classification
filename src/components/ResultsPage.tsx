import { useLocation } from 'react-router-dom';

export function ResultsPage() {
    const location = useLocation();
    const { inputType, inputData, result } = location.state || {};
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
        <div className="w-full max-w-lg p-4 shadow-lg bg-white rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
          {inputType === "image" && inputData && <img src={inputData} alt="Uploaded" className="w-full max-h-80 object-contain rounded-lg border" />}
          {inputType === "audio" && inputData && <audio controls className="w-full mt-4"><source src={inputData} type="audio/mpeg" /></audio>}
          {inputType === "text" && inputData && <p className="text-gray-800 bg-gray-200 p-3 rounded-lg">{inputData}</p>}
          <p className="text-lg font-semibold mt-4">Result: {result}</p>
        </div>
      </div>
    );
  }
  