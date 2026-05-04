import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  FormControlLabel,
  Switch,
  ListSubheader,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Search, PlusCircle, RefreshCw, Camera, Upload, X, MapPin } from 'lucide-react';
import api from '../services/api';
import type { Complaint } from '../types';

const UserDashboard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const categoryGroups = [
    {
      label: 'Technical',
      options: [
        { value: 'Technical - LMS Issue', label: 'LMS Issue' },
        { value: 'Technical - WebKiosk Down', label: 'WebKiosk Down' },
        { value: 'Technical - E-Ticket Issue', label: 'E-Ticket Issue' },
        { value: 'Technical - Email Access', label: 'Email Access' },
        { value: 'Technical - Wi-Fi/Network', label: 'Wi-Fi / Network' },
        { value: 'Technical - Portal Login Issue', label: 'Portal Login Issue' },
        { value: 'Technical - Software Installation', label: 'Software Installation' },
        { value: 'Technical - Hardware Fault', label: 'Hardware Fault' },
        { value: 'Technical - Lab System Issue', label: 'Lab System Issue' },
        { value: 'Technical - Other', label: 'Other (Technical)' },
      ],
    },
    {
      label: 'Billing',
      options: [
        { value: 'Billing - Fee Payment', label: 'Fee Payment' },
        { value: 'Billing - Receipt Correction', label: 'Receipt Correction' },
        { value: 'Billing - Scholarship/Refund', label: 'Scholarship / Refund' },
        { value: 'Billing - Hostel Fee', label: 'Hostel Fee' },
        { value: 'Billing - Library Fine', label: 'Library Fine' },
        { value: 'Billing - Other', label: 'Other (Billing)' },
      ],
    },
    {
      label: 'Service',
      options: [
        { value: 'Service - Mess/Cafeteria', label: 'Mess / Cafeteria' },
        { value: 'Service - Housekeeping', label: 'Housekeeping' },
        { value: 'Service - Transport/Bus', label: 'Transport / Bus' },
        { value: 'Service - Security', label: 'Security' },
        { value: 'Service - Medical', label: 'Medical' },
        { value: 'Service - Other', label: 'Other (Service)' },
      ],
    },
    {
      label: 'Infrastructure',
      options: [
        { value: 'Infrastructure - Classroom', label: 'Classroom' },
        { value: 'Infrastructure - Lab', label: 'Lab' },
        { value: 'Infrastructure - Washroom', label: 'Washroom' },
        { value: 'Infrastructure - Hostel Room', label: 'Hostel Room' },
        { value: 'Infrastructure - Power/Electricity', label: 'Power / Electricity' },
        { value: 'Infrastructure - Water Supply', label: 'Water Supply' },
        { value: 'Infrastructure - Parking', label: 'Parking' },
        { value: 'Infrastructure - Other', label: 'Other (Infrastructure)' },
      ],
    },
    {
      label: 'Other',
      options: [
        { value: 'Other - Suggestion', label: 'Suggestion' },
        { value: 'Other - General Query', label: 'General Query' },
      ],
    },
  ];
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSupported, setGpsSupported] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_ATTACHMENTS = 3;
  const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await api.get('/complaints/my');
      setComplaints(response.data.data);
    } catch (err) {
      setError('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    setGpsSupported(Boolean(navigator.geolocation));
  }, []);

  useEffect(() => {
    setCameraSupported(Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      if (!cameraOpen) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false);
        // setCameraError('Camera is not supported on this device/browser.');
        setCameraOpen(false);
        return;
      }

      // setCameraError('');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // setCameraError('Unable to access camera. Please allow camera permissions.');
        setCameraOpen(false);
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!location.trim()) {
        setError('Please provide the exact campus location.');
        setSubmitting(false);
        return;
      }

      const attachmentPayload = await Promise.all(
        attachments.map(async (file) => {
          const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });

          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data,
          };
        })
      );

      await api.post('/complaints', {
        category,
        priority,
        description,
        location: location.trim(),
        isAnonymous,
        attachments: attachmentPayload,
      });
      setSuccess('Complaint submitted successfully!');
      setCategory('');
      setPriority('Medium');
      setDescription('');
      setLocation('');
      setIsAnonymous(false);
      attachmentPreviews.forEach((url) => URL.revokeObjectURL(url));
      setAttachments([]);
      setAttachmentPreviews([]);
      // setAttachmentError('');
      fetchComplaints();
    } catch (err: any) {
      const apiError = err.response?.data;
      if (apiError?.errors?.length) {
        setError(apiError.errors.map((item: { msg: string }) => item.msg).join(', '));
      } else {
        setError(apiError?.message || 'Failed to submit complaint');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  const filteredComplaints = complaints.filter(c =>
    (
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(search.toLowerCase())
    ) &&
    (statusFilter === '' || c.status === statusFilter)
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    addAttachments(Array.from(files));
  };

  const handleUseGps = () => {
    // setGpsError('');
    if (!navigator.geolocation) {
      setGpsSupported(false);
      // setGpsError('GPS is not supported on this device/browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // setGpsCoords({ lat, lon });
        setLocation(`GPS: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        setGpsLoading(false);
      },
      (_err) => {
        // setGpsError(err.message || 'Unable to access GPS location.');
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const addAttachments = (files: File[]) => {
    // setAttachmentError('');

    const nextFiles = [...attachments];
    const nextPreviews = [...attachmentPreviews];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        // setAttachmentError('Only image files are allowed.');
        continue;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        // setAttachmentError('Each image must be under 2MB.');
        continue;
      }
      if (nextFiles.length >= MAX_ATTACHMENTS) {
        // setAttachmentError(`Maximum ${MAX_ATTACHMENTS} images allowed.`);
        break;
      }

      nextFiles.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    }

    setAttachments(nextFiles);
    setAttachmentPreviews(nextPreviews);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    if (attachments.length >= MAX_ATTACHMENTS) {
      // setAttachmentError(`Maximum ${MAX_ATTACHMENTS} images allowed.`);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const blob = await fetch(dataUrl).then(res => res.blob());
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type });

    addAttachments([file]);
  };

  const removeAttachment = (index: number) => {
    const preview = attachmentPreviews[index];
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Header Cell Styles for Sticky Header Visibility
  const headerCellSx = {
    fontWeight: 800,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: 'text.secondary',
    backgroundColor: theme.palette.background.paper, // Solid background
    borderBottom: `2px solid ${theme.palette.divider}`,
    height: 48,
    py: 0,
    zIndex: 10, // Ensure header is above body rows
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
          User Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ opacity: 0.7 }}>
          Submit new complaints and track their resolution status in real-time.
        </Typography>
      </Box>

      {/* Main Layout Container */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={4}
        alignItems="stretch"
      >
        {/* LEFT - Submission Form */}
        <Box sx={{ flex: { xs: 1, md: 0.4 }, display: 'flex' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <PlusCircle size={22} color={theme.palette.primary.main} /> Submit New Complaint
            </Typography>

            {success && <Alert data-testid="complaint-success" severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert data-testid="complaint-error" severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <form onSubmit={handleSubmit} data-testid="complaint-form" style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                fullWidth
                select
                label="Category"
                size="small"
                id="complaint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                margin="normal"
                required
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              >
                {categoryGroups.map((group) => (
                  [
                    <ListSubheader key={`${group.label}-header`} sx={{ fontWeight: 800, lineHeight: '36px' }}>{group.label}</ListSubheader>,
                    ...group.options.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                        {option.label}
                      </MenuItem>
                    )),
                  ]
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Priority"
                size="small"
                id="complaint-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                margin="normal"
                required
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              >
                <MenuItem value="Low" sx={{ fontSize: '0.85rem' }}>Low</MenuItem>
                <MenuItem value="Medium" sx={{ fontSize: '0.85rem' }}>Medium</MenuItem>
                <MenuItem value="High" sx={{ fontSize: '0.85rem' }}>High</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Location"
                size="small"
                id="complaint-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                margin="normal"
                required
                placeholder="e.g. Block B, Room 302"
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              />

              <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MapPin size={14} />}
                  onClick={handleUseGps}
                  disabled={!gpsSupported || gpsLoading}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.7rem' }}
                >
                  {gpsLoading ? 'Locating...' : 'Use GPS'}
                </Button>
              </Stack>

              <TextField
                fullWidth
                label="Description"
                size="small"
                multiline
                rows={3}
                id="complaint-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                required
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              />

              <FormControlLabel
                sx={{ mt: 1, mb: 2 }}
                control={<Switch size="small" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />}
                label={<Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Anonymous Submission</Typography>}
              />

              {/* ATTACHMENTS SECTION */}
              <Box sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider', backgroundColor: alpha(theme.palette.text.primary, 0.01), mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary">Attachments</Typography>
                  <Chip label={`${attachments.length}/${MAX_ATTACHMENTS}`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800 }} />
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="outlined" size="small" startIcon={<Camera size={14} />} onClick={() => setCameraOpen(true)} disabled={!cameraSupported} sx={{ fontSize: '0.7rem' }}>Capture</Button>
                  <Button variant="outlined" size="small" startIcon={<Upload size={14} />} onClick={() => uploadInputRef.current?.click()} sx={{ fontSize: '0.7rem' }}>Upload</Button>
                </Stack>
                <input ref={uploadInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />

                {cameraOpen && (
                  <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', backgroundColor: '#000' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                    <Stack direction="row" spacing={1} sx={{ p: 1, justifyContent: 'center' }}>
                      <Button variant="contained" size="small" onClick={capturePhoto} sx={{ fontSize: '0.7rem' }}>Snap</Button>
                      <Button variant="outlined" size="small" onClick={stopCamera} sx={{ fontSize: '0.7rem', color: 'white' }}>Close</Button>
                    </Stack>
                  </Box>
                )}

                {attachmentPreviews.length > 0 && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {attachmentPreviews.map((preview, index) => (
                      <Box key={preview} sx={{ position: 'relative', width: 50, height: 50 }}>
                        <Box component="img" src={preview} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }} />
                        <IconButton size="small" onClick={() => removeAttachment(index)} sx={{ position: 'absolute', top: -6, right: -6, bgcolor: 'error.main', color: 'white', p: 0.1 }}><X size={10} /></IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={submitting}
                data-testid="complaint-submit"
                sx={{ borderRadius: 2.5, py: 1.2, fontWeight: 900, textTransform: 'none', boxShadow: isDark ? 'none' : '0 8px 16px rgba(14, 165, 233, 0.15)' }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Complaint'}
              </Button>
            </form>
          </Paper>
        </Box>

        {/* RIGHT - Complaints List - Limited Height & Scroll */}
        <Box sx={{ flex: { xs: 1, md: 0.6 }, display: 'flex', height: { md: '750px' }, minHeight: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: '100%'
            }}
          >
            {/* Header Content - Fixed */}
            <Box sx={{ p: { xs: 2, md: 3 }, pb: 2, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>My Complaints</Typography>
                <IconButton onClick={fetchComplaints} size="small"><RefreshCw size={18} /></IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                    sx: { borderRadius: 2, fontSize: '0.85rem' }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  size="small"
                  placeholder="Status"
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 100, '& .MuiInputBase-root': { borderRadius: 2, fontSize: '0.85rem' } }}
                >
                  <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All</MenuItem>
                  <MenuItem value="Pending" sx={{ fontSize: '0.85rem' }}>Pending</MenuItem>
                  <MenuItem value="In Progress" sx={{ fontSize: '0.85rem' }}>In Progress</MenuItem>
                  <MenuItem value="Resolved" sx={{ fontSize: '0.85rem' }}>Resolved</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Scrollable Table Area */}
            <TableContainer sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>ID</TableCell>
                    <TableCell sx={headerCellSx}>Category</TableCell>
                    <TableCell sx={headerCellSx}>Location</TableCell>
                    <TableCell sx={headerCellSx}>Status</TableCell>
                    <TableCell sx={headerCellSx}>Handler</TableCell>
                    <TableCell sx={headerCellSx}>Files</TableCell>
                    <TableCell sx={headerCellSx}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : filteredComplaints.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><Typography variant="body2" color="text.disabled" fontWeight={600}>No records</Typography></TableCell></TableRow>
                  ) : filteredComplaints.map((complaint) => (
                    <TableRow key={complaint._id} hover sx={{ height: 52 }}>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.8rem' }}>{complaint.id || (complaint._id ? complaint._id.slice(-4).toUpperCase() : 'N/A')}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{complaint.category}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{complaint.location}</TableCell>
                      <TableCell>
                        <Chip label={complaint.status} color={getStatusColor(complaint.status) as any} size="small" sx={{ fontWeight: 900, fontSize: '0.65rem', height: 20 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{complaint.handledBy || '—'}</TableCell>
                      <TableCell>
                        <Chip label={complaint.attachmentCount || 0} variant="outlined" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>{complaint.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default UserDashboard;
