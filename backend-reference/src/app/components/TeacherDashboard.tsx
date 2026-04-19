import { useState, useEffect } from 'react';
import Layout from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Video, Users, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { DashboardSummary } from '../types';
import { DashboardService } from '../services/dashboardService';
import { LectureService } from '../services/lectureService';
import LectureManagement from './LectureManagement';
import ClassAttendanceView from './ClassAttendanceView';
import EngagementMonitor from './EngagementMonitor';

export default function TeacherDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    LectureService.initializeLectures();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const summaryData = await DashboardService.getDashboardSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <Layout title="Teacher Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Teacher Dashboard">
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
              <p className="text-xs text-muted-foreground">In your classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{summary.presentToday}</div>
              <Progress
                value={(summary.presentToday / summary.totalStudents) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">{summary.averageAttendance}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-purple-600">{summary.averageEngagement}%</div>
              <p className="text-xs text-muted-foreground">Class participation</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {summary.alerts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alerts</CardTitle>
                <Badge variant="destructive">{summary.alerts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.alerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} className={alert.severity === 'CRITICAL' ? 'border-red-500' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="lectures" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lectures" className="gap-2">
              <Video className="w-4 h-4" />
              Lecture Management
            </TabsTrigger>
            <TabsTrigger value="view">Attendance Records</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="lectures">
            <LectureManagement />
          </TabsContent>

          <TabsContent value="view">
            <ClassAttendanceView />
          </TabsContent>

          <TabsContent value="engagement">
            <EngagementMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
