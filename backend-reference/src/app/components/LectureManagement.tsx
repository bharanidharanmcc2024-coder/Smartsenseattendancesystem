import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Play, Square, Upload, Video, Eye, Trash2, Clock } from 'lucide-react';
import { Lecture, LectureAccess } from '../types/lecture';
import { LectureService } from '../services/lectureService';
import { useAuth } from '../contexts/AuthContext';

export default function LectureManagement() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [recording, setRecording] = useState<Lecture | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [lectureAccess, setLectureAccess] = useState<LectureAccess[]>([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: 'Computer Science',
    className: 'Computer Science - Year 3',
    description: '',
    duration: 0
  });

  useEffect(() => {
    loadLectures();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 60000); // Increment every minute
    }
    return () => clearInterval(interval);
  }, [recording]);

  const loadLectures = async () => {
    const data = await LectureService.getLecturesByTeacher(user?.id || 2);
    setLectures(data);
  };

  const handleStartRecording = async () => {
    const newRecording = await LectureService.startRecording(
      `Lecture - ${new Date().toLocaleDateString()}`,
      'Computer Science',
      'Computer Science - Year 3',
      user?.id || 2,
      user?.name || 'Teacher'
    );
    setRecording(newRecording);
    setRecordingDuration(0);
    loadLectures();
  };

  const handleStopRecording = async () => {
    if (recording) {
      await LectureService.stopRecording(recording.id, recordingDuration);
      setRecording(null);
      setRecordingDuration(0);
      loadLectures();
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await LectureService.uploadLecture({
      ...uploadForm,
      teacherId: user?.id || 2,
      teacherName: user?.name || 'Teacher',
      recordingUrl: `https://example.com/lecture_upload_${Date.now()}.mp4`,
      lectureDate: new Date().toISOString(),
      status: 'AVAILABLE'
    });
    setUploadForm({ title: '', subject: 'Computer Science', className: 'Computer Science - Year 3', description: '', duration: 0 });
    setIsUploadDialogOpen(false);
    loadLectures();
  };

  const handleViewAccess = async (lecture: Lecture) => {
    setSelectedLecture(lecture);
    const access = await LectureService.getLectureAccess(lecture.id);
    setLectureAccess(access);
  };

  const handleDeleteLecture = async (id: number) => {
    if (confirm('Are you sure you want to delete this lecture?')) {
      await LectureService.deleteLecture(id);
      loadLectures();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      RECORDING: { variant: 'destructive', text: 'Recording' },
      PROCESSING: { variant: 'secondary', text: 'Processing' },
      AVAILABLE: { variant: 'default', text: 'Available', className: 'bg-green-500' },
      ARCHIVED: { variant: 'outline', text: 'Archived' }
    };
    const config = variants[status] || variants.AVAILABLE;
    return <Badge {...config}>{config.text}</Badge>;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Lecture Recording</CardTitle>
          <CardDescription>Start/stop lecture recording</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recording ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-semibold text-red-900">Recording in Progress</p>
                      <p className="text-sm text-red-700">{recording.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      <span className="text-lg font-mono text-red-900">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <Button variant="destructive" onClick={handleStopRecording} className="gap-2">
                      <Square className="w-4 h-4" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Ready to Record</p>
                <p className="text-sm text-gray-600">Click start to begin recording your lecture</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleStartRecording} className="gap-2">
                  <Play className="w-4 h-4" />
                  Start Recording
                </Button>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Lecture
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Recorded Lecture</DialogTitle>
                      <DialogDescription>Upload a pre-recorded lecture video</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Lecture Title</Label>
                        <Input
                          id="title"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={uploadForm.subject}
                          onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="className">Class Name</Label>
                        <Input
                          id="className"
                          value={uploadForm.className}
                          onChange={(e) => setUploadForm({ ...uploadForm, className: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={uploadForm.duration}
                          onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Upload</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lecture List */}
      <Card>
        <CardHeader>
          <CardTitle>Recorded Lectures</CardTitle>
          <CardDescription>Manage your uploaded and recorded lectures</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lectures.map((lecture) => (
                <TableRow key={lecture.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{lecture.title}</p>
                        {lecture.description && (
                          <p className="text-xs text-gray-500">{lecture.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{lecture.subject}</TableCell>
                  <TableCell>{new Date(lecture.lectureDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatDuration(lecture.duration)}</TableCell>
                  <TableCell>{getStatusBadge(lecture.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAccess(lecture)}
                            disabled={lecture.status === 'RECORDING'}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Student Access Log</DialogTitle>
                            <DialogDescription>{selectedLecture?.title}</DialogDescription>
                          </DialogHeader>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Access Date</TableHead>
                                <TableHead>Watch Duration</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {lectureAccess.map((access) => (
                                <TableRow key={access.id}>
                                  <TableCell>{access.studentName}</TableCell>
                                  <TableCell>{new Date(access.accessDate).toLocaleString()}</TableCell>
                                  <TableCell>{formatDuration(access.watchDuration)}</TableCell>
                                  <TableCell>
                                    {access.completed ? (
                                      <Badge className="bg-green-500">Completed</Badge>
                                    ) : (
                                      <Badge variant="secondary">In Progress</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {lectureAccess.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-gray-500">
                                    No access records yet
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteLecture(lecture.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
