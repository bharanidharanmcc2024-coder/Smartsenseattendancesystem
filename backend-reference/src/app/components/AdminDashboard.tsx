import { useState, useEffect } from 'react';
import Layout from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserX, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { DashboardSummary, Student, AttendanceReport, Alert as AlertType } from '../types';
import { DashboardService } from '../services/dashboardService';
import { StudentService } from '../services/studentService';
import { AttendanceService } from '../services/attendanceService';
import StudentManagement from './StudentManagement';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, studentsData, reportsData] = await Promise.all([
        DashboardService.getDashboardSummary(),
        StudentService.getAllStudents(),
        AttendanceService.generateReport()
      ]);
      setSummary(summaryData);
      setStudents(studentsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id: number) => {
    await DashboardService.resolveAlert(id);
    loadData();
  };

  if (loading || !summary) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  const attendanceChartData = reports.slice(0, 8).map((r, index) => ({
    id: `student-${r.studentId}-${index}`, // Unique key for React
    name: r.studentName.split(' ')[0],
    attendance: Math.round(r.percentage)
  }));

  const statusPieData = [
    { name: 'Present', value: summary.presentToday },
    { name: 'Absent', value: summary.absentToday }
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{summary.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{summary.presentToday}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((summary.presentToday / summary.totalStudents) * 100)}% attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{summary.absentToday}</div>
              <p className="text-xs text-muted-foreground">Need follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">{summary.averageEngagement}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {summary.alerts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>System notifications requiring attention</CardDescription>
                </div>
                <Badge variant="destructive">{summary.alerts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.alerts.map((alert) => (
                <Alert key={alert.id} className={alert.severity === 'CRITICAL' ? 'border-red-500' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Individual student attendance percentages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#3b82f6" key="admin-attendance-bar" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Status</CardTitle>
                  <CardDescription>Present vs Absent distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>Detailed attendance records for all students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.studentId}>
                        <TableCell>{report.studentName}</TableCell>
                        <TableCell>{report.className}</TableCell>
                        <TableCell>{report.totalDays}</TableCell>
                        <TableCell className="text-green-600">{report.presentDays}</TableCell>
                        <TableCell className="text-red-600">{report.absentDays}</TableCell>
                        <TableCell className="text-yellow-600">{report.lateDays}</TableCell>
                        <TableCell>
                          <Badge variant={report.percentage >= 75 ? 'default' : 'destructive'}>
                            {Math.round(report.percentage)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
