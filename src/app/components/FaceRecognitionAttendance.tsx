import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, Check, X, AlertCircle } from 'lucide-react';
import { FaceRecognitionService } from '../services/faceRecognitionService';
import { AttendanceService } from '../services/attendanceService';

interface FaceRecognitionAttendanceProps {
  onUpdate: () => void;
}

export default function FaceRecognitionAttendance({ onUpdate }: FaceRecognitionAttendanceProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setScanning(true);
    setError('');
    setResult(null);

    try {
      // Step 1: Capture face
      const faceData = await FaceRecognitionService.captureFace();

      // Step 2: Check liveness
      const livenessResult = await FaceRecognitionService.detectLiveness(faceData);

      if (!livenessResult.isLive) {
        setError('Liveness check failed! Possible proxy attendance detected.');
        setScanning(false);
        return;
      }

      // Step 3: Recognize face
      const recognition = await FaceRecognitionService.recognizeFace(faceData);

      if (!recognition.student) {
        setError('Face not recognized. Please try again or mark attendance manually.');
        setScanning(false);
        return;
      }

      // Step 4: Mark attendance
      const attendance = await AttendanceService.markAttendance(
        recognition.student.id,
        'PRESENT',
        'FACE_RECOGNITION',
        recognition.confidence
      );

      setResult({
        student: recognition.student,
        confidence: recognition.confidence,
        livenessScore: livenessResult.confidence,
        attendance
      });

      onUpdate();
    } catch (err) {
      setError('An error occurred during face recognition. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Camera/Scan Section */}
      <Card>
        <CardHeader>
          <CardTitle>Face Recognition Scanner</CardTitle>
          <CardDescription>Position student's face in front of camera</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simulated Camera View */}
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {scanning ? (
              <div className="text-center text-white space-y-3">
                <div className="w-48 h-48 border-4 border-blue-500 rounded-lg animate-pulse" />
                <p>Scanning face...</p>
                <Progress value={66} className="w-48 mx-auto" />
              </div>
            ) : (
              <div className="text-center text-gray-400 space-y-3">
                <Camera className="w-16 h-16 mx-auto" />
                <p>Camera ready</p>
                <p className="text-sm">Click "Start Scan" to begin</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleScan}
            disabled={scanning}
            className="w-full gap-2"
            size="lg"
          >
            <Camera className="w-5 h-5" />
            {scanning ? 'Scanning...' : 'Start Face Scan'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recognition Results</CardTitle>
          <CardDescription>AI verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{result.student.name}</p>
                  <p className="text-sm text-gray-500">{result.student.rollNumber}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Recognition Confidence</span>
                    <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={result.confidence * 100} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Liveness Score</span>
                    <span className="font-semibold">{(result.livenessScore * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={result.livenessScore * 100} className="[&>div]:bg-purple-500" />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Attendance Marked</p>
                    <p className="text-sm text-green-700">
                      Status: Present • Method: Face Recognition
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {new Date(result.attendance.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              <Badge className="w-full justify-center" variant="outline">
                ✓ Anti-Proxy Verification Passed
              </Badge>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <Camera className="w-12 h-12 mx-auto mb-3" />
              <p>No scan results yet</p>
              <p className="text-sm">Start a face scan to see results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
