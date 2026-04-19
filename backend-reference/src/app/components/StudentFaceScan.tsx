import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, Check, AlertCircle, Loader2, X, Video } from 'lucide-react';
import { FaceRecognitionService } from '../services/faceRecognitionService';
import { AttendanceService } from '../services/attendanceService';
import { useAuth } from '../contexts/AuthContext';

export default function StudentFaceScan() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError('');
      setPermissionDenied(false);
      setError('');

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access. Please use a modern browser.');
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setCameraActive(true);
              })
              .catch((playErr) => {
                console.error('Error playing video:', playErr);
                setCameraError('Failed to start video playback. Please try again.');
              });
          }
        };
      }
    } catch (err: any) {
      // Handle camera access errors
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
        setPermissionDenied(true);
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device. Please use a device with a camera.');
        console.warn('Camera not found:', err.message);
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.');
        console.warn('Camera in use:', err.message);
      } else {
        setCameraError('Failed to access camera. Please check your browser settings.');
        console.error('Camera error:', err);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    // Simulate capture animation
    setTimeout(() => {
      setCapturing(false);
      processImage(imageData);
    }, 500);
  };

  const processImage = async (imageData: string) => {
    setProcessing(true);
    setError('');

    try {
      // Step 1: Send image to face recognition service
      const faceData = imageData; // In production, this would be preprocessed

      // Step 2: Check liveness (anti-spoofing)
      const livenessResult = await FaceRecognitionService.detectLiveness(faceData);

      if (!livenessResult.isLive) {
        setError('Liveness check failed! Please ensure you are physically present. Photos and videos are not accepted.');
        setProcessing(false);
        setCapturedImage(null);
        return;
      }

      // Step 3: Recognize face
      const recognition = await FaceRecognitionService.recognizeFace(faceData);

      if (!recognition.student) {
        setError('Face not recognized. Please ensure proper lighting and face the camera directly. Try again or contact your teacher.');
        setProcessing(false);
        setCapturedImage(null);
        return;
      }

      // Step 4: Verify it's the logged-in student
      if (recognition.student.name !== user?.name) {
        setError(`Face recognized as ${recognition.student.name}, but you are logged in as ${user?.name}. Please scan your own face.`);
        setProcessing(false);
        setCapturedImage(null);
        return;
      }

      // Step 5: Mark attendance (send to backend API)
      const attendance = await AttendanceService.markAttendance(
        recognition.student.id,
        'PRESENT',
        'FACE_RECOGNITION',
        recognition.confidence
      );

      // Success! Show result
      setResult({
        student: recognition.student,
        confidence: recognition.confidence,
        livenessScore: livenessResult.confidence,
        attendance,
        capturedImage: imageData
      });

      // Stop camera after successful attendance
      stopCamera();
    } catch (err: any) {
      if (err.message?.includes('already marked')) {
        setError('Your attendance has already been marked for today!');
      } else {
        setError('An error occurred during face recognition. Please try again.');
      }
      setCapturedImage(null);
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCapturedImage(null);
    setError('');
    setCameraError('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Your Attendance</CardTitle>
        <CardDescription>Use face recognition to check in for today's class</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera/Capture Section */}
        <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
          {/* Live Video Feed */}
          {cameraActive && !result && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Face Detection Box Overlay (Visual Feedback) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-80 border-4 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
                </div>
              </div>
              {/* Capture Flash Effect */}
              {capturing && (
                <div className="absolute inset-0 bg-white animate-pulse" />
              )}
              {/* Processing Overlay */}
              {processing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white space-y-3">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                    <p className="font-semibold">Processing face recognition...</p>
                    <Progress value={66} className="w-48 mx-auto" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Captured Image Preview */}
          {capturedImage && !processing && !result && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          {/* Success Result */}
          {result && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl font-semibold text-green-900">Attendance Marked!</p>
                <p className="text-sm text-green-700">You're checked in for today</p>
              </div>
            </div>
          )}

          {/* Camera Inactive State */}
          {!cameraActive && !result && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400 space-y-3">
                <Video className="w-16 h-16 mx-auto" />
                <div>
                  <p className="font-semibold">Camera Ready</p>
                  <p className="text-sm">Click "Open Camera" to start</p>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Image Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Camera Error */}
        {cameraError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {cameraError}
              {permissionDenied && (
                <div className="mt-2 text-xs">
                  <p>To enable camera access:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Click the camera icon in your browser's address bar</li>
                    <li>Select "Allow" for camera permissions</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        {!result && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-blue-900">Instructions:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Ensure good lighting on your face</li>
              <li>Position your face inside the blue box</li>
              <li>Look directly at the camera</li>
              <li>Remove sunglasses or masks</li>
              <li>Stay still when capturing (1-2 seconds)</li>
              <li>Do not use photos or videos (liveness detection will fail)</li>
            </ul>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!cameraActive && !result && (
            <Button
              onClick={startCamera}
              className="flex-1 gap-2"
              size="lg"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </Button>
          )}

          {cameraActive && !processing && !result && (
            <>
              <Button
                onClick={captureImage}
                disabled={capturing}
                className="flex-1 gap-2"
                size="lg"
              >
                {capturing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Capture & Mark Attendance
                  </>
                )}
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                size="lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </>
          )}

          {result && (
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Done
            </Button>
          )}
        </div>

        {/* Processing Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Result Details */}
        {result && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border-2 border-green-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Attendance Successful</p>
                <p className="text-sm text-green-700">Status: {result.attendance.status}</p>
              </div>
            </div>

            {/* Captured Image Thumbnail */}
            {result.capturedImage && (
              <div className="flex gap-3 items-start">
                <img
                  src={result.capturedImage}
                  alt="Captured face"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-green-500"
                />
                <div className="flex-1 space-y-2">
                  <Badge className="bg-green-600">✓ Face Verified</Badge>
                  <p className="text-xs text-green-700">
                    Image captured and stored for records
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-800">Recognition Confidence</span>
                  <span className="font-semibold text-green-900">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.confidence * 100} className="[&>div]:bg-green-600" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-800">Liveness Score (Anti-Proxy)</span>
                  <span className="font-semibold text-green-900">
                    {(result.livenessScore * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.livenessScore * 100} className="[&>div]:bg-purple-600" />
              </div>
            </div>

            <div className="text-center pt-2 border-t border-green-300">
              <p className="text-xs text-green-700">
                Marked at: {new Date(result.attendance.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-xs text-green-700 mt-1">
                ✓ Verified via AI Face Recognition with Live Camera
              </p>
            </div>
          </div>
        )}

        {/* Camera Status Info */}
        {!result && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {cameraActive
                ? '📹 Camera is active - Position your face in the box'
                : 'Make sure to mark attendance at the start of each class'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
