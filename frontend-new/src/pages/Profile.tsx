import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Grid,
  Chip,
  Divider,
  IconButton,
  TextField,
  Button,
  Alert,
  Collapse,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, ShieldCheck, Pencil, X, Check, Camera, Trash2 } from 'lucide-react';
import api from '../services/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Profile Picture state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile image from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`profile_img_${user.email}`);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user?.email]);

  // Seed the input when entering edit mode
  useEffect(() => {
    if (editMode && user) {
      setNameInput(user.name || '');
    }
  }, [editMode, user]);

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (alert) {
      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setAlert(null), 4000);
    }
    return () => {
      if (alertTimer.current) clearTimeout(alertTimer.current);
    };
  }, [alert]);

  if (!user) return null;

  const displayName = user.name || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleCancel = () => {
    setEditMode(false);
    setNameInput('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfileImage(base64);
      localStorage.setItem(`profile_img_${user.email}`, base64);
      updateUser({ profilePic: base64 });
      setAlert({ type: 'success', message: 'Profile picture updated!' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`profile_img_${user.email}`);
    updateUser({ profilePic: undefined });
    setAlert({ type: 'success', message: 'Profile picture removed.' });
  };

  const handleSave = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setAlert({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    if (trimmed.length < 2) {
      setAlert({ type: 'error', message: 'Name must be at least 2 characters.' });
      return;
    }
    if (trimmed === user.name) {
      setEditMode(false);
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/profile/update', { name: trimmed });
      const updatedName: string = response.data?.data?.name ?? trimmed;
      // Merge only the changed field — leaves email, role, etc. intact
      updateUser({ name: updatedName });
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.message ||
        'Failed to save. Please try again.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Page heading */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your personal information.
      </Typography>

      {/* Feedback alert */}
      <Collapse in={!!alert}>
        <Alert
          severity={alert?.type}
          onClose={() => setAlert(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {alert?.message}
        </Alert>
      </Collapse>

      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Grid container spacing={4} alignItems="flex-start">

          {/* Left column — avatar + role chip */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={profileImage || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  bgcolor: profileImage ? 'transparent' : 'primary.main',
                  fontSize: 48,
                  boxShadow: '0 4px 20px rgba(14,165,233,0.3)',
                  border: '3px solid',
                  borderColor: 'background.paper',
                }}
              >
                {!profileImage && avatarLetter}
              </Avatar>
              <Tooltip title="Update photo">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <Camera size={16} />
                </IconButton>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Box>

            {profileImage && (
              <Box sx={{ mb: 2 }}>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<Trash2 size={14} />}
                  onClick={handleRemoveImage}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Remove Photo
                </Button>
              </Box>
            )}

            <Typography variant="h5" fontWeight={600}>
              {displayName}
            </Typography>
            <Chip
              label={user.role}
              color={user.role === 'Admin' ? 'secondary' : 'primary'}
              size="small"
              sx={{ mt: 1, fontWeight: 600 }}
            />
          </Grid>

          {/* Right column — info fields + edit */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Full Name row */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                  >
                    <UserIcon size={14} />
                    Full Name
                  </Typography>
                  {!editMode && (
                    <Tooltip title="Edit name">
                      <IconButton
                        size="small"
                        onClick={() => setEditMode(true)}
                        aria-label="Edit name"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <Pencil size={15} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {editMode ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <TextField
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      size="small"
                      placeholder="Enter your name"
                      autoFocus
                      disabled={saving}
                      inputProps={{ maxLength: 80 }}
                      sx={{ flex: 1, minWidth: 180 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSave}
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Check size={14} />}
                      sx={{ minWidth: 80, height: 40, borderRadius: 2 }}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancel}
                      disabled={saving}
                      startIcon={<X size={14} />}
                      sx={{ height: 40, borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body1" fontWeight={500}>
                    {displayName}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Email row — always read-only */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
                >
                  <Mail size={14} />
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.email}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                  Email cannot be changed.
                </Typography>
              </Box>

              <Divider />

              {/* Role row */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
                >
                  <ShieldCheck size={14} />
                  Account Role
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user.role}
                </Typography>
              </Box>

            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
