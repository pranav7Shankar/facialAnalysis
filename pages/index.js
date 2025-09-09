import { useState, useEffect } from 'react';

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalAnalyses: 2847,
        accuracyRate: 96.2,
        facesProcessed: 1453,
        processingTime: 127,
        activeModels: 8,
        successRate: 98.7
    });

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setResults(data);
                // Update stats after successful analysis
                setStats(prev => ({
                    ...prev,
                    totalAnalyses: prev.totalAnalyses + 1,
                    facesProcessed: prev.facesProcessed + (data.facesDetected || 0)
                }));
            } else {
                setError(data.error || 'Failed to analyze image');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetAnalysis = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResults(null);
        setError(null);
        if (typeof document !== 'undefined') {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = '';
        }
    };



    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-light text-gray-600">your</span>
                        <span className="text-2xl font-bold text-blue-600">LOGO</span>
                        <span className="text-xs text-gray-400 align-top">™</span>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-semibold text-slate-800">Facial Analysis Dashboard</div>
                        <div className="text-sm text-gray-600">{getCurrentDate()}</div>
                    </div>
                </header>

                {/* Main Title */}
                <h1 className="text-4xl font-bold text-slate-800 text-center mb-6">
                    Facial Analysis Dashboard
                </h1>



                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-4">
                    {/* Upload Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">Image Upload & Analysis</h2>

                        <div className="text-center">
                            <div className="mb-6">
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="fileInput"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Choose Image
                                </label>
                            </div>

                            {previewUrl && (
                                <div className="space-y-4">
                                    <div className="flex justify-center">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-48 rounded-lg border border-gray-200 object-cover"
                                        />
                                    </div>
                                    <div className="flex justify-center space-x-3">
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={loading}
                                            className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {loading ? 'Analyzing...' : 'Analyze'}
                                        </button>
                                        <button
                                            onClick={resetAnalysis}
                                            className="px-5 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Types Distribution */}
                    {/* Analysis Tips */}
                    {/* Analysis Tips */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6">Analysis Tips</h2>

                            <ul className="space-y-4 text-gray-700">
                                {[
                                    "Use clear, well-lit images for better detection accuracy.",
                                    "Ensure the face is fully visible and facing the camera.",
                                    "Higher resolution images give more precise emotion and feature analysis.",
                                    "Multiple faces in a single image may reduce accuracy per face.",
                                    "Be patient — complex images might take a few extra seconds to analyze."
                                ].map((tip, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="text-blue-600 mt-1">💡</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Greeting at the bottom */}
                        <div className="mt-8">
                            <p className="text-2xl font-bold text-blue-600 text-center">
                                Let’s make sense of your faces today
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {results && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                            Analysis Results
                        </h2>

                        {results.facesDetected === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">🤔</div>
                                <p className="text-lg text-gray-600">No faces detected in the image.</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                                        Detected {results.facesDetected} face{results.facesDetected > 1 ? 's' : ''}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {results.results.map((face, index) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-bold text-slate-800">
                                                    Face {face.faceId}
                                                </h3>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {face.confidence}% confidence
                        </span>
                                            </div>

                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                                    <div className="text-sm font-medium text-gray-600 mb-1">Age Range</div>
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {face.ageRange.Low} - {face.ageRange.High} years
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                                    <div className="text-sm font-medium text-gray-600 mb-1">Gender</div>
                                                    <div className="text-lg font-bold text-purple-600">
                                                        {face.gender.value}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {face.gender.confidence}% confidence
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                                    <div className="text-sm font-medium text-gray-600 mb-1">Image Quality</div>
                                                    <div className="text-sm text-gray-600">
                                                        Brightness: {face.quality.brightness}/100
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Sharpness: {face.quality.sharpness}/100
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Top Emotions */}
                                            <div className="mb-6">
                                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Top Emotions</h4>
                                                <div className="space-y-3">
                                                    {face.emotions.slice(0, 3).map((emotion, i) => (
                                                        <div key={i} className="flex items-center space-x-4">
                                                            <div className="w-16 text-sm font-medium text-gray-700 capitalize">
                                                                {emotion.type.toLowerCase()}
                                                            </div>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.max(emotion.confidence, 5)}%` }}
                                                                />
                                                            </div>
                                                            <div className="w-10 text-sm font-semibold text-gray-600">
                                                                {emotion.confidence}%
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Facial Features */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Facial Features</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {Object.entries(face.attributes).map(([key, value]) => {
                                                        if (value && typeof value === 'object') {
                                                            return (
                                                                <div key={key} className="bg-white rounded-lg p-3 text-center border border-gray-100">
                                                                    <div className="font-medium text-gray-700 text-sm mb-1">
                                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </div>
                                                                    <div className={`text-lg mb-1 ${value.value ? 'text-emerald-600' : 'text-red-400'}`}>
                                                                        {value.value ? '✓' : '✗'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {value.confidence}%
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                            {/* Emoji Highlights Section */}
                                            <div className="mt-6">
                                                <h4 className="text-lg font-semibold text-slate-800 mb-4 text-center">Emoji Highlights</h4>

                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Facial Features */}
                                                    <div className="flex-1 border border-gray-300 rounded-lg p-4">
                                                        <h5 className="text-sm font-medium text-gray-600 mb-2 text-center">Facial Features</h5>
                                                        <div className="flex flex-wrap gap-4 justify-center">
                                                            {Object.entries(face.attributes).map(([key, value]) => {
                                                                let emoji = '';
                                                                switch (key.toLowerCase()) {
                                                                    case 'smile':
                                                                        emoji = value.value ? '😊' : '😐';
                                                                        break;
                                                                    case 'eyeglasses':
                                                                        emoji = value.value ? '🕶️' : '👓';
                                                                        break;
                                                                    case 'sunglasses':
                                                                        emoji = value.value ? '😎' : '😶';
                                                                        break;
                                                                    case 'beard':
                                                                        emoji = value.value ? '🧔' : '👨';
                                                                        break;
                                                                    case 'mustache':
                                                                        emoji = value.value ? '👨‍🦰' : '👱';
                                                                        break;
                                                                    case 'eyesopen':
                                                                        emoji = value.value ? '👀' : '😴';
                                                                        break;
                                                                    case 'mouthopen':
                                                                        emoji = value.value ? '😮' : '😶';
                                                                        break;
                                                                    default:
                                                                        emoji = '✨';
                                                                }

                                                                return (
                                                                    <div
                                                                        key={key}
                                                                        className="text-2xl flex items-center justify-center w-12 h-12"
                                                                        title={key.replace(/([A-Z])/g, ' $1').trim()}
                                                                    >
                                                                        {emoji}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Emotions */}
                                                    <div className="flex-1 border border-yellow-300 rounded-lg p-4">
                                                        <h5 className="text-sm font-medium text-gray-600 mb-2 text-center">Emotions</h5>
                                                        <div className="flex flex-wrap gap-4 justify-center">
                                                            {face.emotions.slice(0, 5).map((emotion, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="text-2xl flex items-center justify-center w-12 h-12"
                                                                    title={`${emotion.type} - ${emotion.confidence}%`}
                                                                >
                                                                    {emotion.type === 'HAPPY' ? '😄' :
                                                                        emotion.type === 'SAD' ? '😢' :
                                                                            emotion.type === 'ANGRY' ? '😠' :
                                                                                emotion.type === 'CONFUSED' ? '😕' :
                                                                                    emotion.type === 'SURPRISED' ? '😲' :
                                                                                        emotion.type === 'DISGUSTED' ? '🤢' :
                                                                                            emotion.type === 'FEAR' ? '😨' :
                                                                                                '🙂'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center mt-8 pt-8 border-t border-gray-200">
                    <p className="text-gray-600">
                        Powered by <span className="font-semibold text-blue-600">Next.js</span> &
                        <span className="font-semibold text-orange-600"> AWS Rekognition</span>
                    </p>
                </footer>
            </div>
        </div>
    );
}