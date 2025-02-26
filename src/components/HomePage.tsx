import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Navbar } from './Navbar';
import { FileText, Upload, Image, X } from 'lucide-react';

interface HomePageProps {
  userEmail: string | null;
}

export function HomePage({ userEmail }: HomePageProps) {
  const [textFile, setTextFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const textInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type.toLowerCase());
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'text' | 'audio' | 'image') => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const allowedTypes: { [key: string]: string[] } = {
      text: ['text/plain'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac'],
      image: ['image/jpeg', 'image/jpg', 'image/png']
    };

    if (validateFileType(file, allowedTypes[type])) {
      switch (type) {
        case 'text':
          setTextFile(file);
          break;
        case 'audio':
          setAudioFile(file);
          break;
        case 'image':
          setImageFile(file);
          break;
      }
    } else {
      alert(`Invalid file type. Please upload a ${type} file.`);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: 'text' | 'audio' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    switch (type) {
      case 'text':
        setTextFile(file);
        break;
      case 'audio':
        setAudioFile(file);
        break;
      case 'image':
        setImageFile(file);
        break;
    }
  };

  const clearFile = (type: 'text' | 'audio' | 'image') => {
    switch (type) {
      case 'text':
        setTextFile(null);
        if (textInputRef.current) textInputRef.current.value = '';
        break;
      case 'audio':
        setAudioFile(null);
        if (audioInputRef.current) audioInputRef.current.value = '';
        break;
      case 'image':
        setImageFile(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        break;
    }
  };

  
  const handleAnalyzeContent = async () => {
    const formData = new FormData();
  
    if (textFile) {
      console.log("Appending text file:", textFile.name);
      formData.append("text", textFile);
    }
    if (audioFile) {
      console.log("Appending audio file:", audioFile.name);
      formData.append("audio", audioFile);
    }
    if (imageFile) {
      console.log("Appending image file:", imageFile.name);
      formData.append("image", imageFile);
    }
  
    if (!textFile && !audioFile && !imageFile) {
      alert("Please upload at least one file.");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      console.log("Response:", data);
      alert(`Analysis Result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Error analyzing content.");
    }
  };

  const handleFileUpload = async () => {
    if (!imageFile) {
        alert("Please select a file before uploading.");
        return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("type", "image"); // Ensure correct type

    try {
        const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        alert(`Analysis Result: ${JSON.stringify(result)}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file.");
    }
  };

  const handleUpload = async () => {
    const selectedFile = textFile || audioFile || imageFile;
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }
  
    const fileType = selectedFile.type;
    let dataType = "";
  
    if (fileType.startsWith("image/")) {
      dataType = "image";
    } else if (fileType.startsWith("audio/")) {
      dataType = "audio";
    } else if (fileType === "text/plain") {
      dataType = "text";
    } else {
      alert("Unsupported file format.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", dataType);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Upload failed");
      }
  
      const result = await response.json();
      alert(`Analysis Result: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a237e] via-[#4a148c] to-[#880e4f]">
      <Navbar userEmail={userEmail} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          AI Content Detection
        </h1>
        <p className="text-gray-300 text-lg mb-16 max-w-3xl mx-auto">
          Upload your content and our advanced ML models will analyze whether it's AI-generated or human-created with high accuracy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Analyze Text Card */}
          <div
            className="bg-[#2e1f3e]/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-purple-500/30 relative"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'text')}
          >
            <input
              type="file"
              ref={textInputRef}
              accept=".txt"
              onChange={(e) => handleFileSelect(e, 'text')}
              className="hidden"
            />
            <div className="flex justify-center mb-6">
              <FileText className="w-12 h-12 text-purple-300" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Analyze Text</h2>
            {textFile ? (
              <div className="text-purple-300 mb-6">
                <p className="truncate">{textFile.name}</p>
                <button
                  onClick={() => clearFile('text')}
                  className="mt-2 flex items-center space-x-1 mx-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <p className="text-gray-400 mb-6">Accepted formats: .txt </p>
            )}
            <button
              onClick={() => !textFile && textInputRef.current?.click()}
              className={`bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-2 rounded-lg transition-colors duration-200 ${
                textFile ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!!textFile}
            >
              Select text
            </button>
          </div>

          {/* Analyze Audio Card */}
          <div
            className="bg-[#2e1f3e]/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-purple-500/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'audio')}
          >
            <input
              type="file"
              ref={audioInputRef}
              accept="audio/mpeg,audio/wav,audio/m4a,audio/aac"
              onChange={(e) => handleFileSelect(e, 'audio')}
              className="hidden"
            />
            <div className="flex justify-center mb-6">
              <Upload className="w-12 h-12 text-purple-300" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Analyze Audio</h2>
            {audioFile ? (
              <div className="text-purple-300 mb-6">
                <p className="truncate">{audioFile.name}</p>
                <button
                  onClick={() => clearFile('audio')}
                  className="mt-2 flex items-center space-x-1 mx-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <p className="text-gray-400 mb-6">Accepted formats: mp3, wav, m4a, aac</p>
            )}
            <button
              onClick={() => !audioFile && audioInputRef.current?.click()}
              className={`bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-2 rounded-lg transition-colors duration-200 ${
                audioFile ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!!audioFile}
            >
              Select audio
            </button>
          </div>

          {/* Analyze Image Card */}
          <div
            className="bg-[#2e1f3e]/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-purple-500/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'image')}
          >
            <input
              type="file"
              ref={imageInputRef}
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => handleFileSelect(e, 'image')}
              className="hidden"
            />
            <div className="flex justify-center mb-6">
              <Image className="w-12 h-12 text-purple-300" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Analyze Image</h2>
            {imageFile ? (
              <div className="text-purple-300 mb-6">
                <p className="truncate">{imageFile.name}</p>
                <button
                  onClick={() => clearFile('image')}
                  className="mt-2 flex items-center space-x-1 mx-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <p className="text-gray-400 mb-6">Accepted formats: jpg, jpeg, png</p>
            )}
            <button
              onClick={() => !imageFile && imageInputRef.current?.click()}
              className={`bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-2 rounded-lg transition-colors duration-200 ${
                imageFile ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!!imageFile}
            >
              Select image
            </button>

          
        
          </div>
        </div>

        <button
  onClick={handleUpload}
  className={`bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 ${
    !(textFile || audioFile || imageFile) ? "opacity-50 cursor-not-allowed" : ""
  }`}
  disabled={!(textFile || audioFile || imageFile)}
>
  Analyze Content
</button>
      </main>
    </div>
  );
}