import { useState, useEffect, useRef } from 'react';

export default function AttendanceKiosk() {
    const [darkMode, setDarkMode] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [attendanceLog, setAttendanceLog] = useState([]);
    const [autoCapture, setAutoCapture] = useState(false);
    const [captureInterval, setCaptureInterval] = useState(5);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);

    // Initialize dark mode
    useEffect(() => {
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
    }, []);

    // Start webcam
    const startWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCapturing(true);
            speak('Webcam started. Ready for attendance.');
        } catch (err) {
            setStatusMessage('Error accessing webcam: ' + err.message);
            speak('Error accessing webcam');
        }
    };

    // Stop webcam
    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCapturing(false);
            setAutoCapture(false);
            speak('Webcam stopped');
        }
    };

    // Text-to-speech function
    const speak = (text) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Play sound effect
    const playSound = (type) => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const audioContext = new AudioCtx();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'success') {
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'error') {
            oscillator.frequency.value = 200;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    };

    // Capture and analyze
    const captureAndAnalyze = async () => {
        if (!videoRef.current || analyzing) return;
        setAnalyzing(true);
        setStatusMessage('Analyzing...');
        try {
            // Capture frame from video
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Convert to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

            // Create form data
            const formData = new FormData();
            formData.append('image', blob, 'capture.jpg');

            // Send to API
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (response.ok && data.facesDetected > 0) {
                const face = data.results[0];
                const emotion = face.emotions[0].type.toLowerCase();
                const age = Math.round((face.ageRange.Low + face.ageRange.High) / 2);
                const gender = face.gender.value;

                const record = {
                    id: Date.now(),
                    timestamp: new Date().toLocaleString(),
                    gender,
                    age,
                    emotion,
                    confidence: face.confidence
                };
                setLastResult(face);
                setAttendanceLog(prev => [record, ...prev.slice(0, 9)]);

                playSound('success');
                speak(`Attendance marked. You seem ${emotion}. Have a great day!`);
                setStatusMessage('✓ Attendance marked successfully!');
            } else {
                playSound('error');
                speak('No face detected. Please position yourself in front of the camera.');
                setStatusMessage('⚠ No face detected. Please try again.');
            }
        } catch (err) {
            playSound('error');
            speak('Error processing image');
            setStatusMessage('Error: ' + err.message);
        } finally {
            setAnalyzing(false);
            setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    // Auto-capture effect
    useEffect(() => {
        if (autoCapture && isCapturing) {
            intervalRef.current = setInterval(() => {
                captureAndAnalyze();
            }, captureInterval * 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoCapture, isCapturing, captureInterval]);

    const themeClasses = darkMode
        ? 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
        : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 text-slate-900';

    return (
        <div className={themeClasses}>
            {/* Header */}
            <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-white/80'} backdrop-blur-sm border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-orange-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                                <span className="text-2xl">👤</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Smart Attendance Kiosk</h1>
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    AI-Powered Check-In System
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} transition-colors`}
                        >
                            {darkMode ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Camera View */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'} shadow-xl`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Camera View</h2>
                                <div className="flex items-center space-x-2">
                                    {isCapturing && (
                                        <span className="flex items-center">
                                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                            <span className="text-sm">Live</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Video Container */}
                            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
                                {!isCapturing ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-6xl mb-4">📷</div>
                                        <p className={`text-lg mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-300'}`}>
                                            Camera is off
                                        </p>
                                        <button
                                            onClick={startWebcam}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold transition-all shadow-lg"
                                        >
                                            Start Webcam
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        {analyzing && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                    <p className="text-white font-semibold">Analyzing...</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <canvas ref={canvasRef} className="hidden" />

                            {/* Status Message */}
                            {statusMessage && (
                                <div className={`mb-4 p-4 rounded-lg ${
                                    statusMessage.includes('✓') 
                                        ? 'bg-green-500/20 border border-green-500 text-green-300'
                                        : 'bg-orange-500/20 border border-orange-500 text-orange-300'
                                }`}>
                                    <p className="font-semibold text-center">{statusMessage}</p>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="space-y-4">
                                {isCapturing && (
                                    <>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={captureAndAnalyze}
                                                disabled={analyzing}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                📸 Mark Attendance
                                            </button>
                                            <button
                                                onClick={stopWebcam}
                                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                                            >
                                                Stop Camera
                                            </button>
                                        </div>

                                        {/* Auto-capture Settings */}
                                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="font-semibold">Auto-Capture Mode</label>
                                                <button
                                                    onClick={() => setAutoCapture(!autoCapture)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoCapture ? 'bg-green-500' : darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoCapture ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            {autoCapture && (
                                                <div>
                                                    <label className="text-sm mb-2 block">Interval: {captureInterval}s</label>
                                                    <input
                                                        type="range"
                                                        min="3"
                                                        max="30"
                                                        value={captureInterval}
                                                        onChange={(e) => setCaptureInterval(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Last Result & Log */}
                    <div className="space-y-6">
                        {/* Last Result */}
                        {lastResult && (
                            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'} shadow-xl`}>
                                <h3 className="text-lg font-bold mb-4">Last Check-In</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Gender:</span>
                                        <span className="font-semibold">{lastResult.gender.value}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Age:</span>
                                        <span className="font-semibold">{lastResult.ageRange.Low}-{lastResult.ageRange.High}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Emotion:</span>
                                        <span className="font-semibold capitalize">{lastResult.emotions[0].type.toLowerCase()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Confidence:</span>
                                        <span className="font-semibold">{lastResult.confidence}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Log */}
                        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'} shadow-xl`}>
                            <h3 className="text-lg font-bold mb-4">Recent Check-Ins</h3>
                            {attendanceLog.length === 0 ? (
                                <p className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    No check-ins yet
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {attendanceLog.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-semibold">
                                                    {log.gender} · Age {log.age}
                                                </span>
                                                <span className="text-xs capitalize px-2 py-1 rounded bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                                                    {log.emotion}
                                                </span>
                                            </div>
                                            <p className={darkMode ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                                                {log.timestamp}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200'} shadow-xl`}>
                            <h3 className="text-lg font-bold mb-4">Instructions</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start">
                                    <span className="mr-2">1.</span>
                                    <span>Click "Start Webcam" to begin</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">2.</span>
                                    <span>Position your face clearly in the frame</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">3.</span>
                                    <span>Click "Mark Attendance" or enable auto-capture</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">4.</span>
                                    <span>Wait for audio confirmation</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


