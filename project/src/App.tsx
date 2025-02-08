import { Navbar } from './components/Navbar';
import { UploadBox } from './components/UploadBox';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-purple to-navy-dark">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-light mb-4">
            AI Content Detection
          </h1>
          <p className="text-pink-light/80 max-w-2xl mx-auto">
            Upload your content and our advanced ML models will analyze whether it's
            AI-generated or human-created with high accuracy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <UploadBox
            type="text"
            title="Analyze Text"
            accept=".txt,.pdf,.doc,.docx"
          />
          <UploadBox
            type="audio"
            title="Analyze Audio"
            accept=".mp3,.wav,.m4a,.aac"
          />
          <UploadBox
            type="image"
            title="Analyze Image"
            accept=".jpg,.jpeg,.png"
          />
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-pink hover:bg-pink-dark text-navy-dark font-medium transition-colors rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Analyze Content
          </button>
        </div>
      </main>
    </div>
  );
}