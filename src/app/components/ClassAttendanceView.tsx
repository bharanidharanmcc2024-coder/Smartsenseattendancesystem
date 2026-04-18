import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AttendanceService } from '../services/attendanceService';
import { StudentService } from '../services/studentService';
import { Attendance, Student } from '../types';

export default function ClassAttendanceView() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attendanceData, studentsData] = await Promise.all([
        AttendanceService.getAttendanceByDate(selectedDate),
        StudentService.getAllStudents()
      ]);
      setAttendance(attendanceData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentAttendance = (studentId: number) => {
    return attendance.find(a => a.studentId === studentId);
  };

  const getStatusBadge = (status?: 'PRESENT' | 'ABSENT' | 'LATE') => {
    if (!status) return <Badge variant="outline">Not Marked</Badge>;

    const variants: Record<string, any> = {
      PRESENT: { variant: 'default', className: 'bg-green-500' },
      ABSENT: { variant: 'destructive', className: '' },
      LATE: { variant: 'secondary', className: 'bg-yellow-500' }
    };

    return <Badge {...variants[status]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Class Attendance Records</CardTitle>
            <CardDescription>View attendance for selected date</CardDescription>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const record = getStudentAttendance(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>{getStatusBadge(record?.status)}</TableCell>
                    <TableCell>
                      {record?.verificationMethod === 'FACE_RECOGNITION' ? '🤖 AI' : '✍️ Manual'}
                    </TableCell>
                    <TableCell>
                      {record ? new Date(record.timestamp).toLocaleTimeString() : '-'}
                    </TableCell>
                    <TableCell>
                      {record?.confidence ? `${(record.confidence * 100).toFixed(0)}%` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
