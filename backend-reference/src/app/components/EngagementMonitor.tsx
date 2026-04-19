import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EngagementService } from '../services/engagementService';
import { StudentService } from '../services/studentService';
import { Student } from '../types';

export default function EngagementMonitor() {
  const [students, setStudents] = useState<Student[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const studentsData = await StudentService.getAllStudents();
      setStudents(studentsData);

      const data = await Promise.all(
        studentsData.map(async (student) => {
          const avg = await EngagementService.getAverageEngagement(student.id);
          return {
            id: student.id,
            name: student.name,
            attention: avg.attention,
            participation: avg.participation,
            overall: Math.round((avg.attention + avg.participation) / 2)
          };
        })
      );

      setEngagementData(data);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 65) return { label: 'Good', color: 'bg-blue-500' };
    if (score >= 50) return { label: 'Average', color: 'bg-yellow-500' };
    return { label: 'Needs Attention', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
          <CardDescription>Student attention and participation metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading engagement data...</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attention" stroke="#3b82f6" name="Attention Score" key="attention-line" />
                <Line type="monotone" dataKey="participation" stroke="#8b5cf6" name="Participation Score" key="participation-line" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Engagement Details</CardTitle>
          <CardDescription>Individual engagement metrics and levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Attention Score</TableHead>
                <TableHead>Participation Score</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagementData.map((data) => {
                const level = getEngagementLevel(data.overall);
                return (
                  <TableRow key={data.id}>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={data.attention} className="w-24" />
                        <span className="text-sm">{data.attention}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={data.participation} className="w-24 [&>div]:bg-purple-500" />
                        <span className="text-sm">{data.participation}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{data.overall}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={level.color}>{level.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
