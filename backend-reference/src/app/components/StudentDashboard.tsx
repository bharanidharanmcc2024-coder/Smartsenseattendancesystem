import { useState, useEffect } from 'react';
import Layout from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Award, AlertTriangle, Video, Play, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceService } from '../services/attendanceService';
import { EngagementService } from '../services/engagementService';
import { StudentService } from '../services/studentService';
import { LectureService } from '../services/lectureService';
import { Attendance, Student } from '../types';
import { Lecture, QuizResult } from '../types/lecture';
import StudentFaceScan from './StudentFaceScan';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [avgEngagement, setAvgEngagement] = useState({ attention: 0, participation: 0 });
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    LectureService.initializeLectures();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const students = await StudentService.getAllStudents();
      const currentStudent = students.find(s => s.name === user?.name);

      if (currentStudent) {
        setStudent(currentStudent);

        const [attendanceData, engagementData, lecturesData, quizzesData] = await Promise.all([
          AttendanceService.getAttendanceByStudent(currentStudent.id),
          EngagementService.getAverageEngagement(currentStudent.id),
          LectureService.getLecturesByClass(currentStudent.className),
          LectureService.getQuizResultsByStudent(currentStudent.id)
        ]);

        setAttendance(attendanceData);
        setAvgEngagement(engagementData);
        setLectures(lecturesData.filter(l => l.status === 'AVAILABLE'));
        setQuizResults(quizzesData);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !student) {
    return (
      <Layout title="Student Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length;
  const lateDays = attendance.filter(a => a.status === 'LATE').length;
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  const last7Days = attendance.slice(0, 7).reverse();
  const attendanceChartData = last7Days.map((a, index) => ({
    id: `${a.id}-${index}`, // Unique key for React
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: a.status === 'PRESENT' ? 1 : 0,
    confidence: a.confidence ? a.confidence * 100 : 0
  }));

  const alerts = [];
  if (attendancePercentage < 75) {
    alerts.push({
      type: 'warning',
      message: `Your attendance is ${Math.round(attendancePercentage)}%. Minimum required is 75%.`
    });
  }
  if (avgEngagement.attention < 60) {
    alerts.push({
      type: 'info',
      message: 'Your attention score is below average. Consider improving focus in class.'
    });
  }

  const handleWatchLecture = async (lecture: Lecture) => {
    if (student) {
      await LectureService.recordAccess(lecture.id, student.id, student.name);
      window.open(lecture.recordingUrl, '_blank');
    }
  };

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Face Scan Section */}
        <StudentFaceScan />

        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
                {student.name.charAt(0)}
              </div>
              <div>
                <CardTitle>{student.name}</CardTitle>
                <CardDescription>
                  {student.rollNumber} • {student.className}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{Math.round(attendancePercentage)}%</div>
              <Progress value={attendancePercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {presentDays} / {totalDays} days present
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Attention Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">{avgEngagement.attention}%</div>
              <Progress value={avgEngagement.attention} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">Average in class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Participation</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-purple-600">{avgEngagement.participation}%</div>
              <Progress value={avgEngagement.participation} className="mt-2 [&>div]:bg-purple-500" />
              <p className="text-xs text-muted-foreground mt-2">Class involvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className="text-lg px-4 py-2"
                variant={attendancePercentage >= 75 ? 'default' : 'destructive'}
              >
                {attendancePercentage >= 75 ? '✓ Good Standing' : '⚠ Below Required'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
              <CardDescription>Your recent attendance pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="status" fill="#22c55e" name="Present (1=Yes, 0=No)" key="attendance-bar" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Face Recognition Confidence</CardTitle>
              <CardDescription>AI verification scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="#3b82f6" name="Confidence %" key="confidence-line" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Additional Features */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">Recent Attendance</TabsTrigger>
            <TabsTrigger value="lectures" className="gap-2">
              <Video className="w-4 h-4" />
              Lecture Recordings
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Quiz Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance Records</CardTitle>
                <CardDescription>Your last 10 attendance entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.slice(0, 10).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === 'PRESENT'
                                ? 'default'
                                : record.status === 'LATE'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className={record.status === 'PRESENT' ? 'bg-green-500' : record.status === 'LATE' ? 'bg-yellow-500' : ''}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(record.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          {record.verificationMethod === 'FACE_RECOGNITION' ? '🤖 AI Face Scan' : '✍️ Manual'}
                        </TableCell>
                        <TableCell>
                          {record.confidence ? `${(record.confidence * 100).toFixed(0)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lectures">
            <Card>
              <CardHeader>
                <CardTitle>Available Lecture Recordings</CardTitle>
                <CardDescription>Watch recorded lectures from your class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lectures.map((lecture) => (
                    <Card key={lecture.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Video className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{lecture.title}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {lecture.subject}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">{lecture.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Duration: {lecture.duration} min</span>
                          <span>{new Date(lecture.lectureDate).toLocaleDateString()}</span>
                        </div>
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleWatchLecture(lecture)}
                        >
                          <Play className="w-4 h-4" />
                          Watch Lecture
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {lectures.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No lecture recordings available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Quiz & Participation Results</CardTitle>
                <CardDescription>Your performance on quizzes and class activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quiz Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizResults.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">{quiz.quizTitle}</TableCell>
                        <TableCell>{quiz.subject}</TableCell>
                        <TableCell>{quiz.score} / {quiz.maxScore}</TableCell>
                        <TableCell>
                          <Badge
                            variant={quiz.percentage >= 80 ? 'default' : quiz.percentage >= 60 ? 'secondary' : 'destructive'}
                            className={quiz.percentage >= 80 ? 'bg-green-500' : ''}
                          >
                            {quiz.percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(quiz.submittedDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {quizResults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No quiz results available yet</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
