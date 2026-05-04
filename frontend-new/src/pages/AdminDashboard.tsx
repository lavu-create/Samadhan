import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Download,
  RefreshCw,
  Eye,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useToast, ToastProvider } from '../context/ToastContext';
import ToastManager from '../context/ToastManager';
import api from '../services/api';
import type { Complaint, Stats } from '../types';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [handlerDraft, setHandlerDraft] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/stats/all'),
      ]);

      setComplaints(complaintsRes.data.data || []);
      setStats(statsRes.data.data || null);
      addToast('Data refreshed successfully!', 'success');
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      addToast('Failed to fetch data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      fetchData();
      addToast(`Status updated to ${newStatus}.`, 'success');
    } catch (err) {
      console.error('Failed to update status', err);
      addToast('Failed to update status. Please try again.', 'error');
    }
  };

  const openDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/complaints/${id}`);
      setSelectedComplaint(response.data.data);
      setHandlerDraft(response.data.data.handledBy || '');
    } catch (err) {
      console.error('Failed to load complaint details', err);
      addToast('Failed to load details.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedComplaint(null);
    setHandlerDraft('');
  };

  const saveHandler = async () => {
    if (!selectedComplaint) return;
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, { handledBy: handlerDraft });
      addToast('Handler updated successfully!', 'success');
      fetchData();
      setSelectedComplaint({
        ...selectedComplaint,
        handledBy: handlerDraft,
      });
    } catch (err) {
      console.error('Failed to update handler', err);
      addToast('Failed to update handler.', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('CSV export completed successfully!', 'success');
    } catch (err) {
      console.error('Export failed', err);
      addToast('Failed to export data. Please try again.', 'error');
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  // Safe optional chaining for chart data
  const chartData = stats?.categoryDistribution?.labels?.map((label, index) => ({
    name: label,
    value: stats?.categoryDistribution?.data[index] || 0,
  })) || [];

  const COLORS = ['#0ea5e9', '#6366f1', '#22c55e', '#f97316', '#ef4444'];

  // Calculate In Progress count safely
  const inProgress = stats ? (stats.total - (stats.pending || 0) - (stats.resolved || 0)) : 0;

  const statItems = [
    { label: 'Total', value: stats?.total || 0, color: '#0ea5e9', icon: <LayoutDashboard size={18} /> },
    { label: 'Pending', value: stats?.pending || 0, color: '#f97316', icon: <Clock size={18} /> },
    { label: 'In Progress', value: Math.max(0, inProgress), color: '#6366f1', icon: <Users size={18} /> },
    { label: 'Resolved', value: stats?.resolved || 0, color: '#22c55e', icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
              Admin Console
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ opacity: 0.7, textTransform: 'uppercase' }}>
              System Overview & Grievance Management
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              startIcon={<RefreshCw size={16} />}
              variant="outlined"
              size="small"
              onClick={fetchData}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2, backgroundColor: 'white' }}
            >
              Refresh
            </Button>
            <Button
              startIcon={<Download size={16} />}
              variant="contained"
              size="small"
              onClick={handleExport}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2 }}
            >
              Export
            </Button>
          </Stack>
        </Box>

        {/* Improved Stats Grid - Fixed Cutoff */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statItems.map((item) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  minHeight: 85,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CardContent sx={{ p: 2, width: '100%', '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(item.color, 0.08), color: item.color, display: 'flex', mr: 2 }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.2, mb: 0.2 }}>{item.value}</Typography>
                      <Typography variant="caption" fontWeight={800} color="text.secondary" noWrap sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Submissions - Wider Section */}
          <Grid size={{ xs: 12, lg: 8.5 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={900}>Recent Submissions</Typography>
                <Chip label={`${complaints.length} Records`} size="small" sx={{ fontWeight: 800, height: 20, fontSize: '0.6rem', backgroundColor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }} />
              </Box>
              <TableContainer sx={{ flexGrow: 1, maxHeight: '550px', overflowY: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, pl: 2.5, fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase' }}>Assignment</TableCell>
                      <TableCell sx={{ fontWeight: 800, py: 1.5, pr: 2.5, textAlign: 'right', fontSize: '0.7rem', color: 'text.secondary', textTransform: 'uppercase' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint._id} hover>
                        <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.8rem', pl: 2.5 }}>{complaint.id || (complaint._id ? complaint._id.slice(-6).toUpperCase() : 'N/A')}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>{complaint.category}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 150, opacity: 0.8 }}>
                            {complaint.location || 'Global'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={complaint.priority}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              fontSize: '0.65rem',
                              height: 18,
                              backgroundColor: complaint.priority === 'High' ? 'rgba(239, 68, 68, 0.12)' : complaint.priority === 'Medium' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                              color: complaint.priority === 'High' ? '#ef4444' : complaint.priority === 'Medium' ? '#f97316' : '#64748b',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={complaint.status}
                            onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                            variant="standard"
                            disableUnderline
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 900,
                              color: complaint.status === 'Resolved' ? 'success.main' : complaint.status === 'In Progress' ? 'info.main' : 'warning.main',
                              '& .MuiSelect-select': { py: 0.5, px: 1, borderRadius: 1.5, '&:focus': { backgroundColor: alpha(theme.palette.divider, 0.05) } }
                            }}
                          >
                            <MenuItem value="Pending" sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'warning.main' }}>Pending</MenuItem>
                            <MenuItem value="In Progress" sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'info.main' }}>In Progress</MenuItem>
                            <MenuItem value="Resolved" sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'success.main' }}>Resolved</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontWeight={700} color={complaint.handledBy ? 'text.primary' : 'text.disabled'}>
                            {complaint.handledBy || 'Unassigned'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 2.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => openDetails(complaint._id)}
                            sx={{ color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}
                          >
                            <Eye size={14} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Category Analysis - Fixed Congestion */}
          <Grid size={{ xs: 12, lg: 3.5 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', height: '100%' }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={900}>Category Analysis</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>System Distribution</Typography>
              </Box>
              <CardContent sx={{ pt: 3, pb: 1, px: 1, height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      hide={chartData.length > 5} // Hide labels if too many to avoid overlap
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                    />
                    <ChartTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '8px', fontSize: '11px' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={22}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {chartData.length > 5 && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1, fontSize: '0.65rem', fontStyle: 'italic' }}>
                    Hover bars for category names
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Investigation Dialog */}
        <Dialog open={Boolean(selectedComplaint)} onClose={closeDetails} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={900}>Investigation Record</Typography>
            <IconButton onClick={closeDetails} size="small"><RefreshCw size={18} style={{ opacity: 0.5 }} /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3 }}>
            {detailsLoading || !selectedComplaint ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
            ) : (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="primary.main" fontWeight={900} sx={{ textTransform: 'uppercase' }}>Issue Statement</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6, fontWeight: 500 }}>{selectedComplaint.description}</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Priority</Typography>
                    <Chip label={selectedComplaint.priority} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.6rem', fontWeight: 900 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Classification</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5, fontSize: '0.75rem' }}>{selectedComplaint.category}</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={900} sx={{ mb: 1, display: 'block' }}>Official Assignment</Typography>
                  <TextField
                    size="small"
                    value={handlerDraft}
                    onChange={(e) => setHandlerDraft(e.target.value)}
                    placeholder="Assign official"
                    fullWidth
                    sx={{ mb: 1.5, backgroundColor: 'white', '& .MuiInputBase-root': { fontSize: '0.75rem' } }}
                  />
                  <Button fullWidth variant="contained" size="small" onClick={saveHandler} sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'none' }}>Update Record</Button>
                </Box>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default function AdminDashboardWrapper() {
  return (
    <ToastProvider>
      <AdminDashboard />
      <ToastManager />
    </ToastProvider>
  );
}
