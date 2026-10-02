import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Tabs, TabContent } from '../components/ui/Tabs';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Users,
  Activity,
  IndianRupee,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDocId, setExpandedDocId] = useState(null);

  // Dialog state
  const [dialogConfig, setDialogConfig] = useState(null); // { doc, action: 'approve' | 'reject' }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch platform statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const res = await api.get('/admin/doctors', {
        params: { status: statusFilter },
      });
      if (res.data?.success) {
        setDoctors(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor applications');
    } finally {
      setLoadingDoctors(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStats();
    fetchDoctors();
  }, [fetchStats, fetchDoctors]);

  const executeApprovalAction = async () => {
    if (!dialogConfig) return;
    const { doc, action } = dialogConfig;
    setActionLoading(true);

    try {
      if (action === 'approve') {
        const res = await api.put(`/admin/doctors/${doc._id}/approve`);
        if (res.data?.success) {
          toast.success(`Dr. ${doc.user?.name} approved!`);
        }
      } else {
        const res = await api.put(`/admin/doctors/${doc._id}/reject`);
        if (res.data?.success) {
          toast.success(`Dr. ${doc.user?.name} approval revoked.`);
        }
      }

      // Optimistic update
      setDoctors((prev) =>
        prev.map((d) => (d._id === doc._id ? { ...d, isApproved: action === 'approve' } : d))
      );
      fetchStats();
      setDialogConfig(null);
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    const email = doc.user?.email || '';
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  // Calculate chart distributions
  const pendingDocsCount = doctors.filter((d) => !d.isApproved).length;
  const approvedDocsCount = doctors.filter((d) => d.isApproved).length;

  const doctorApprovalData = [
    { name: 'Approved Doctors', value: approvedDocsCount, color: '#10b981' },
    { name: 'Pending Approvals', value: pendingDocsCount, color: '#f59e0b' },
  ];

  // Specialty Breakdown Chart
  const specialtyCounts = {};
  doctors.forEach((d) => {
    const spec = d.specialty || 'General';
    specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
  });

  const specialtyChartData = Object.keys(specialtyCounts).map((spec) => ({
    specialty: spec.length > 12 ? `${spec.slice(0, 10)}...` : spec,
    count: specialtyCounts[spec],
  }));

  return (
    <DashboardLayout
      title="Admin Control Center"
      subtitle="Platform telemetry metrics, practitioner verification, and system administration."
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 flex items-center gap-4 bg-teal-500/5 border-teal-200 dark:border-teal-800/60">
          <div className="p-3.5 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {loadingStats ? <Skeleton className="h-7 w-12" /> : stats.totalPatients}
            </div>
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              Registered Patients
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-blue-500/5 border-blue-200 dark:border-blue-800/60">
          <div className="p-3.5 rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {loadingStats ? <Skeleton className="h-7 w-12" /> : stats.totalDoctors}
            </div>
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Total Practitioners
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-purple-500/5 border-purple-200 dark:border-purple-800/60">
          <div className="p-3.5 rounded-2xl bg-purple-500 text-white shadow-md shadow-purple-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {loadingStats ? <Skeleton className="h-7 w-12" /> : stats.totalAppointments}
            </div>
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
              Total Appointments
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-emerald-500/5 border-emerald-200 dark:border-emerald-800/60">
          <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {loadingStats ? <Skeleton className="h-7 w-16" /> : `₹${stats.totalRevenue}`}
            </div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Gross Gross Volume
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Doctor Approval Status</CardTitle>
            <CardDescription>Ratio of verified vs pending practitioner applications</CardDescription>
          </CardHeader>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doctorApprovalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {doctorApprovalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle>Specialties Distribution</CardTitle>
            <CardDescription>Breakdown of doctors registered by clinical domain</CardDescription>
          </CardHeader>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyChartData}>
                <XAxis dataKey="specialty" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Doctor Approvals Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Practitioner Verification Pipeline</CardTitle>
            <CardDescription>
              Review pending doctor accounts and manage clinical access permissions
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search doctor..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
            </Select>
          </div>
        </CardHeader>

        {loadingDoctors ? (
          <div className="space-y-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Doctors Match Filter"
            description="No practitioner accounts match the selected status or search term."
          />
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Practitioner</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Fee (₹)</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doc) => {
                const isExpanded = expandedDocId === doc._id;
                return (
                  <React.Fragment key={doc._id}>
                    <TableRow hover className="cursor-pointer">
                      <TableCell onClick={() => setExpandedDocId(isExpanded ? null : doc._id)}>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" fallback={doc.user?.name} />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>Dr. {doc.user?.name || 'N/A'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{doc.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge status="confirmed">{doc.specialty || 'General'}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-teal-600 dark:text-teal-400">
                        ₹{doc.fee}
                      </TableCell>
                      <TableCell>{doc.experienceYears} Yrs</TableCell>
                      <TableCell>
                        <Badge status={doc.isApproved ? 'approved' : 'pending'} />
                      </TableCell>
                      <TableCell className="text-right">
                        {!doc.isApproved ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setDialogConfig({ doc, action: 'approve' })}
                            icon={CheckCircle}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDialogConfig({ doc, action: 'reject' })}
                            icon={XCircle}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50/60 dark:bg-slate-800/30">
                        <TableCell colSpan={6} className="p-4">
                          <div className="text-xs space-y-2">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              Clinical Biography & Schedule Rules:
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {doc.bio || 'No professional bio provided.'}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="font-semibold text-slate-500">Working Days:</span>
                              {doc.availability?.length > 0 ? (
                                doc.availability.map((a, i) => (
                                  <Badge key={i} variant="primary" className="text-[10px]">
                                    {a.day} ({a.startTime}-{a.endTime})
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-slate-400">No working schedule configured</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!dialogConfig}
        onClose={() => setDialogConfig(null)}
        onConfirm={executeApprovalAction}
        loading={actionLoading}
        title={
          dialogConfig?.action === 'approve'
            ? `Approve Dr. ${dialogConfig?.doc?.user?.name}?`
            : `Revoke Approval for Dr. ${dialogConfig?.doc?.user?.name}?`
        }
        description={
          dialogConfig?.action === 'approve'
            ? 'Approving this doctor will allow their consultation slots to appear live in the patient directory.'
            : 'Revoking approval will hide their consultation schedule from patient directory.'
        }
        confirmLabel={dialogConfig?.action === 'approve' ? 'Yes, Approve Account' : 'Revoke Approval'}
        variant={dialogConfig?.action === 'approve' ? 'primary' : 'danger'}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
