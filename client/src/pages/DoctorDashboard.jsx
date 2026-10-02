import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Tooltip } from '../components/ui/Tooltip';
import { Pagination } from '../components/ui/Pagination';
import { Tabs, TabContent } from '../components/ui/Tabs';
import toast from 'react-hot-toast';
import {
  User,
  Clock,
  Calendar,
  IndianRupee,
  Award,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  List,
  Check,
  XCircle,
  Copy,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { motion } from 'framer-motion';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedist',
  'Pulmonologist',
  'Gastroenterologist',
  'Endocrinologist',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist',
  'Gynecologist',
  'Pediatrician',
  'Urologist',
  'Nephrologist',
  'Oncologist',
  'Rheumatologist',
  'Dentist',
];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'queue' | 'profile' | 'availability'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    specialty: '',
    fee: 0,
    bio: '',
    experienceYears: 0,
    slotDurationMinutes: 30,
    availability: [],
    isApproved: false,
  });

  // Queue state
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueStatusFilter, setQueueStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Confirm dialog state
  const [cancelDialogAppt, setCancelDialogAppt] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors/me/profile');
      if (res.data?.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const res = await api.get('/appointments/doctor');
      if (res.data?.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load doctor appointments');
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, [fetchProfile, fetchAppointments]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    try {
      const res = await api.patch(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]:
        name === 'fee' || name === 'experienceYears' || name === 'slotDurationMinutes'
          ? Number(value)
          : value,
    }));
  };

  const handleAddAvailability = () => {
    const usedDays = profile.availability.map((a) => a.day);
    const availableDay = WEEKDAYS.find((d) => !usedDays.includes(d)) || 'Monday';

    setProfile((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: availableDay, startTime: '09:00', endTime: '17:00' },
      ],
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.availability];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, availability: updated };
    });
  };

  const handleRemoveAvailability = (index) => {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleCopyToAllDays = (sourceRule) => {
    const allDaysRules = WEEKDAYS.map((day) => ({
      day,
      startTime: sourceRule.startTime,
      endTime: sourceRule.endTime,
    }));
    setProfile((prev) => ({ ...prev, availability: allDaysRules }));
    toast.success(`Copied schedule (${sourceRule.startTime} - ${sourceRule.endTime}) to all 7 days!`);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/doctors/profile', profile);
      if (res.data?.success) {
        setProfile(res.data.data);
        toast.success('Profile and schedule saved successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Derived statistics & charts
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter((a) => a.date === todayStr).length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const totalEarnings = appointments
    .filter((a) => a.payment?.status === 'paid')
    .reduce((sum, a) => sum + (a.payment?.amount || profile.fee || 0), 0);

  // Group appointments by day for Recharts
  const chartData = WEEKDAYS.map((day) => {
    const count = appointments.filter((a) => {
      if (!a.date) return false;
      const d = new Date(a.date);
      const dayName = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
      return dayName === day;
    }).length;
    return { day: day.slice(0, 3), appointments: count };
  });

  // Filtered queue table
  const filteredQueue = appointments.filter((a) => {
    const patientName = a.patient?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(queueSearch.toLowerCase());
    const matchesStatus =
      queueStatusFilter === 'all' || a.status === queueStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQueue.length / pageSize) || 1;
  const paginatedQueue = filteredQueue.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <DashboardLayout title="Doctor Dashboard">
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Doctor Workspace — Dr. ${user?.name}`}
      subtitle="Manage your profile, availability grid, and patient consultation queue."
    >
      {/* Pending Approval Banner */}
      {!profile.isApproved && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold">Account Verification Pending (Admin Review)</h4>
            <p className="mt-0.5">
              Set up your profile details and working hours below. Once an admin approves your profile, your slots will go live for patient booking.
            </p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        tabs={[
          { value: 'overview', label: 'Overview & Stats', icon: TrendingUp },
          { value: 'queue', label: `Consultation Queue (${appointments.length})`, icon: List, badge: pendingCount },
          { value: 'profile', label: 'Profile Editor & Preview', icon: User },
          { value: 'availability', label: `Working Schedule (${profile.availability?.length || 0} Days)`, icon: Clock },
        ]}
      >
        {/* TAB 1: Overview & Stats */}
        <TabContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-5 flex items-center gap-4 bg-teal-500/5 border-teal-200 dark:border-teal-800/60">
              <div className="p-3.5 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{todayCount}</div>
                <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">Today&apos;s Appointments</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-amber-500/5 border-amber-200 dark:border-amber-800/60">
              <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{pendingCount}</div>
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Pending Requests</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-blue-500/5 border-blue-200 dark:border-blue-800/60">
              <div className="p-3.5 rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{completedCount}</div>
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Completed Visits</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-emerald-500/5 border-emerald-200 dark:border-emerald-800/60">
              <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">₹{totalEarnings}</div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Total Revenue</div>
              </div>
            </Card>
          </div>

          {/* Recharts Appointments Weekly Chart */}
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Consultations per Day</CardTitle>
              <CardDescription>Overview of patient bookings distribution across weekdays</CardDescription>
            </CardHeader>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="appointments" fill="#0d9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabContent>

        {/* TAB 2: Consultation Queue Table */}
        <TabContent value="queue">
          <Card className="p-5 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                <Input
                  placeholder="Search patient name..."
                  icon={Search}
                  value={queueSearch}
                  onChange={(e) => {
                    setQueueSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Select
                  value={queueStatusFilter}
                  onChange={(e) => {
                    setQueueStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </div>
          </Card>

          {loadingAppointments ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : filteredQueue.length === 0 ? (
            <EmptyState
              icon={List}
              title="No Patient Appointments"
              description="No consultation requests match your filter criteria."
            />
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQueue.map((appt) => {
                    const isPaid = appt.payment?.status === 'paid';
                    return (
                      <TableRow key={appt._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm" fallback={appt.patient?.name} />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {appt.patient?.name || 'Patient'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {appt.patient?.email} • {appt.patient?.phone || 'No phone'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {appt.date}
                          </div>
                          <div className="text-[11px] text-slate-400">{appt.startTime}</div>
                        </TableCell>
                        <TableCell>
                          <Badge status={appt.status} />
                        </TableCell>
                        <TableCell>
                          <Badge status={appt.payment?.status || 'unpaid'} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {appt.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                loading={updatingId === appt._id}
                                onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                                icon={Check}
                              >
                                Confirm
                              </Button>
                            )}

                            {appt.status === 'confirmed' && (
                              <Tooltip content={!isPaid ? 'Consultation must be paid before marking completed' : ''}>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    disabled={!isPaid}
                                    loading={updatingId === appt._id}
                                    onClick={() => handleUpdateStatus(appt._id, 'completed')}
                                    icon={CheckCircle}
                                  >
                                    Complete
                                  </Button>
                                </div>
                              </Tooltip>
                            )}

                            {['pending', 'confirmed'].includes(appt.status) && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setCancelDialogAppt(appt)}
                                icon={XCircle}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabContent>

        {/* TAB 3: Profile Editor & Live Preview Card */}
        <TabContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle>Clinical Profile Details</CardTitle>
                  <CardDescription>Update your public doctor directory information</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <Select
                    label="Medical Specialty *"
                    name="specialty"
                    value={profile.specialty}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="">Select Specialty</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Consultation Fee (₹) *"
                      name="fee"
                      type="number"
                      min="0"
                      step="50"
                      placeholder="500"
                      icon={IndianRupee}
                      value={profile.fee}
                      onChange={handleProfileChange}
                      required
                    />

                    <Input
                      label="Experience (Years)"
                      name="experienceYears"
                      type="number"
                      min="0"
                      placeholder="5"
                      icon={Award}
                      value={profile.experienceYears}
                      onChange={handleProfileChange}
                    />

                    <Select
                      label="Slot Duration (Minutes)"
                      name="slotDurationMinutes"
                      value={profile.slotDurationMinutes}
                      onChange={handleProfileChange}
                    >
                      <option value={15}>15 Mins</option>
                      <option value={20}>20 Mins</option>
                      <option value={30}>30 Mins</option>
                      <option value={45}>45 Mins</option>
                      <option value={60}>60 Mins</option>
                    </Select>
                  </div>

                  <Textarea
                    label="Professional Bio"
                    name="bio"
                    rows={4}
                    placeholder="Provide your background, credentials, and medical philosophy..."
                    value={profile.bio}
                    onChange={handleProfileChange}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" loading={saving} icon={Save}>
                      Save Profile Updates
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right Col: Live Preview Card */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-500" /> Patient Directory Card Preview
              </h3>
              <Card className="p-6 border-teal-500/40 shadow-xl relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" fallback={user?.name} />
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Dr. {user?.name || 'Your Name'}
                        </h4>
                        <Badge status="confirmed" className="mt-1">
                          {profile.specialty || 'General Practitioner'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-teal-600 dark:text-teal-400">
                        ₹{profile.fee || 0}
                      </div>
                      <span className="text-[10px] text-slate-400">per consult</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                    {profile.bio || 'No bio provided yet. Add your professional qualifications to showcase your practice.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span>{profile.experienceYears || 0} Yrs Exp.</span>
                    <span>•</span>
                    <span>{profile.slotDurationMinutes || 30}m Slot Duration</span>
                  </div>

                  <Button variant="primary" className="w-full" disabled>
                    Book Consultation (Preview)
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabContent>

        {/* TAB 4: Weekly Availability Grid with Copy-To-All-Days */}
        <TabContent value="availability">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weekly Working Hours & Slots Grid</CardTitle>
                <CardDescription>Configure which days and times you accept consultation appointments</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAvailability}
                disabled={profile.availability?.length >= 7}
                icon={Plus}
              >
                Add Working Day
              </Button>
            </CardHeader>

            {profile.availability?.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No Active Availability Rules"
                description="Click below to add your first day of consultations."
                actionLabel="Add Day"
                onAction={handleAddAvailability}
              />
            ) : (
              <div className="space-y-3 pt-2">
                {profile.availability.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <Select
                      value={rule.day}
                      onChange={(e) => handleAvailabilityChange(idx, 'day', e.target.value)}
                      className="sm:w-40"
                    >
                      {WEEKDAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input
                        type="time"
                        value={rule.startTime}
                        onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <Input
                        type="time"
                        value={rule.endTime}
                        onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToAllDays(rule)}
                        icon={Copy}
                      >
                        Copy to All Days
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveAvailability(idx)}
                        icon={Trash2}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="primary" loading={saving} onClick={handleSubmit} icon={Save}>
                    Save Schedule Rules
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabContent>
      </Tabs>

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelDialogAppt}
        onClose={() => setCancelDialogAppt(null)}
        onConfirm={() => {
          if (cancelDialogAppt) {
            handleUpdateStatus(cancelDialogAppt._id, 'cancelled');
            setCancelDialogAppt(null);
          }
        }}
        title="Cancel Patient Appointment?"
        description="Are you sure you want to cancel this patient appointment slot?"
        confirmLabel="Cancel Appointment"
      />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
