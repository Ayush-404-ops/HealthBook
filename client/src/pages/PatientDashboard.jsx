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
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Tabs, TabContent } from '../components/ui/Tabs';
import SlotPicker from '../components/SlotPicker';
import SymptomNavigator from '../components/SymptomNavigator';
import toast from 'react-hot-toast';
import {
  Search,
  Calendar,
  Clock,
  IndianRupee,
  Award,
  ChevronRight,
  CreditCard,
  XCircle,
  CheckCircle,
  Filter,
  Grid,
  List,
  Printer,
  Sparkles,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTIES = [
  'All Specialties',
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

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'appointments'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [appointmentSubTab, setAppointmentSubTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled'

  // Directory State
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [maxFee, setMaxFee] = useState(2000);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Appointments State
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [payingApptId, setPayingApptId] = useState(null);
  const [cancelDialogAppt, setCancelDialogAppt] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [receiptAppt, setReceiptAppt] = useState(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const params = {};
      if (selectedSpecialty && selectedSpecialty !== 'All Specialties') {
        params.specialty = selectedSpecialty;
      }
      if (maxFee) {
        params.maxFee = maxFee;
      }

      const res = await api.get('/doctors', { params });
      if (res.data?.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor directory');
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedSpecialty, maxFee]);

  const fetchMyAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const res = await api.get('/appointments/mine');
      if (res.data?.success) {
        setMyAppointments(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch your appointments');
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
  }, [fetchDoctors, fetchMyAppointments]);

  const handleCancelAppointment = async () => {
    if (!cancelDialogAppt) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/appointments/${cancelDialogAppt._id}/cancel`);
      if (res.data?.success) {
        toast.success('Appointment cancelled. Refund initiated if paid.');
        setCancelDialogAppt(null);
        fetchMyAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  // Razorpay Checkout Handler
  const handlePayNow = async (appointmentId) => {
    setPayingApptId(appointmentId);
    try {
      const orderRes = await api.post('/payments/create-order', { appointmentId });
      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Order creation failed');
      }

      const { orderId, amount, currency, keyId, isDemo } = orderRes.data.data;

      // Handle Demo Checkout Mode if placeholder keys are used in .env
      if (isDemo || keyId === 'rzp_test_demo' || keyId.includes('xxxx')) {
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature',
          appointmentId,
        });

        if (verifyRes.data?.success) {
          toast.success('Payment verified (Demo Mode) & consultation confirmed! 🎉');
          fetchMyAppointments();
        }
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'HealthBook Medical',
        description: 'Doctor Consultation Checkout',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });

            if (verifyRes.data?.success) {
              toast.success('Payment verified & consultation confirmed! 🎉');
              fetchMyAppointments();
            }
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#0d9488',
        },
      };

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Please refresh the page.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setPayingApptId(null);
    }
  };

  const handleBookingSuccess = () => {
    setSelectedDoctor(null);
    fetchMyAppointments();
    setActiveTab('appointments');
  };

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate stats & next appointment countdown
  const upcomingCount = myAppointments.filter((a) => ['pending', 'confirmed'].includes(a.status)).length;
  const completedCount = myAppointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = myAppointments.filter((a) => a.status === 'cancelled').length;

  const nextAppointment = myAppointments.find((a) => ['pending', 'confirmed'].includes(a.status));

  const filteredSubAppointments = myAppointments.filter((a) => {
    if (appointmentSubTab === 'upcoming') return ['pending', 'confirmed'].includes(a.status);
    if (appointmentSubTab === 'completed') return a.status === 'completed';
    if (appointmentSubTab === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name || 'Patient'} 👋`}
      subtitle="Find top medical specialists, get AI symptom guidance, and manage consultations."
    >
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-200 dark:border-teal-800/60">
          <div className="p-3.5 rounded-2xl bg-teal-500 text-white shadow-md shadow-teal-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {upcomingCount}
            </div>
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              Upcoming Consultations
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800/60">
          <div className="p-3.5 rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {completedCount}
            </div>
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Completed Visits
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-800/60">
          <div className="p-3.5 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {cancelledCount}
            </div>
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Cancelled Visits
            </div>
          </div>
        </Card>
      </div>

      {/* Next Appointment Highlight Banner */}
      {nextAppointment && (
        <Card className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-xl border-teal-500/30 mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Next Upcoming Consultation
              </span>
              <h3 className="text-xl font-bold text-white">
                Dr. {nextAppointment.doctor?.user?.name}
              </h3>
              <p className="text-xs text-slate-300">
                {nextAppointment.doctor?.specialty} • {nextAppointment.date} at {nextAppointment.startTime}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={nextAppointment.status} className="text-xs px-3 py-1" />
              {nextAppointment.payment?.status === 'unpaid' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handlePayNow(nextAppointment._id)}
                  loading={payingApptId === nextAppointment._id}
                  icon={CreditCard}
                >
                  Pay ₹{nextAppointment.payment?.amount || nextAppointment.doctor?.fee}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Tabs (Find Specialists vs My Appointments) */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        tabs={[
          { value: 'directory', label: `Find Specialists (${doctors.length})`, icon: Stethoscope },
          { value: 'appointments', label: `My Appointments (${myAppointments.length})`, icon: Calendar, badge: upcomingCount },
        ]}
      >
        {/* TAB 1: Doctor Directory & AI Navigator */}
        <TabContent value="directory">
          <div id="ai-navigator">
            <SymptomNavigator onApplySpecialty={(spec) => setSelectedSpecialty(spec)} />
          </div>

          <div id="find-doctors">
            {/* Filter Bar */}
            <Card className="p-5 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <Input
                    placeholder="Search doctor by name..."
                    icon={Search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <Select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </Select>

                  <div className="flex flex-col gap-1 justify-center">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Max Fee:</span>
                      <span className="text-teal-600 dark:text-teal-400">₹{maxFee}</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="100"
                      value={maxFee}
                      onChange={(e) => setMaxFee(e.target.value)}
                      className="accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('All Specialties');
                      setMaxFee(2000);
                    }}
                  >
                    Reset
                  </Button>
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-slate-100 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-400'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Doctors Grid / List View */}
            {loadingDoctors ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton circle className="w-12 h-12" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-12" />
                    <Skeleton className="h-10 rounded-xl" />
                  </Card>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No Specialists Found"
                description="Try broadening your search term, specialty filter, or fee range slider."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('All Specialties');
                  setMaxFee(3000);
                }}
              />
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredDoctors.map((doctor) => (
                  <motion.div
                    key={doctor._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 flex flex-col justify-between h-full hover:border-teal-500/50 transition-all">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar size="lg" fallback={doctor.user?.name} />
                            <div>
                              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Dr. {doctor.user?.name}
                              </h3>
                              <Badge status="confirmed" className="mt-1">
                                {doctor.specialty || 'General Physician'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-black text-teal-600 dark:text-teal-400">
                              ₹{doctor.fee}
                            </div>
                            <span className="text-[10px] text-slate-400">per consult</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {doctor.bio || 'Experienced practitioner dedicated to patient wellbeing.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-800/80 py-3">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-teal-500" />
                            <span>{doctor.experienceYears || 0} Yrs Exp.</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{doctor.slotDurationMinutes || 30}m Slot</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        icon={ArrowRight}
                        onClick={() => setSelectedDoctor(doctor)}
                        className="w-full mt-5"
                      >
                        Book Consultation
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabContent>

        {/* TAB 2: My Appointments */}
        <TabContent value="appointments">
          {/* Subtabs (Upcoming, Completed, Cancelled) */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setAppointmentSubTab('upcoming')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                appointmentSubTab === 'upcoming'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              type="button"
              onClick={() => setAppointmentSubTab('completed')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                appointmentSubTab === 'completed'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setAppointmentSubTab('cancelled')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                appointmentSubTab === 'cancelled'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>

          {loadingAppointments ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : filteredSubAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={`No ${appointmentSubTab} appointments`}
              description="You do not have any appointments in this category."
              actionLabel="Book New Appointment"
              onAction={() => setActiveTab('directory')}
            />
          ) : (
            <div className="space-y-4">
              {filteredSubAppointments.map((appt) => {
                const isUnpaid = appt.payment?.status === 'unpaid' && appt.status !== 'cancelled';
                return (
                  <Card key={appt._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          Dr. {appt.doctor?.user?.name || 'Practitioner'}
                        </h4>
                        <Badge status={appt.status} />
                        <Badge status={appt.payment?.status || 'unpaid'} />
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
                          {appt.doctor?.specialty || 'General'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {appt.startTime}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <IndianRupee className="w-3.5 h-3.5" /> ₹{appt.payment?.amount || appt.doctor?.fee}
                        </span>
                      </div>

                      {appt.notes && (
                        <p className="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          &ldquo;{appt.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {isUnpaid && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={payingApptId === appt._id}
                          onClick={() => handlePayNow(appt._id)}
                          icon={CreditCard}
                        >
                          Pay Now (₹{appt.payment?.amount || appt.doctor?.fee})
                        </Button>
                      )}

                      {appt.payment?.status === 'paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReceiptAppt(appt)}
                          icon={Printer}
                        >
                          Print Receipt
                        </Button>
                      )}

                      {['pending', 'confirmed'].includes(appt.status) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancelDialogAppt(appt)}
                          icon={XCircle}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabContent>
      </Tabs>

      {/* Booking Stepper Modal */}
      <Modal
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        title={`Book Consultation with Dr. ${selectedDoctor?.user?.name}`}
        description={`${selectedDoctor?.specialty} • Fee: ₹${selectedDoctor?.fee}`}
        maxWidth="max-w-xl"
      >
        {selectedDoctor && (
          <SlotPicker doctor={selectedDoctor} onBookingSuccess={handleBookingSuccess} />
        )}
      </Modal>

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelDialogAppt}
        onClose={() => setCancelDialogAppt(null)}
        onConfirm={handleCancelAppointment}
        loading={cancelling}
        title="Cancel Appointment?"
        description="Are you sure you want to cancel this appointment? If you have already paid, an automated refund will be initiated."
        confirmLabel="Yes, Cancel Appointment"
        cancelLabel="Keep Appointment"
      />

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={!!receiptAppt}
        onClose={() => setReceiptAppt(null)}
        title="Official Consultation Receipt"
        maxWidth="max-w-md"
      >
        {receiptAppt && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">HealthBook Medical Receipt</span>
                <Badge status="paid">PAID</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Dr. {receiptAppt.doctor?.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{receiptAppt.date} at {receiptAppt.startTime}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-sm">
                <span>Amount Paid:</span>
                <span className="text-teal-600 dark:text-teal-400">₹{receiptAppt.payment?.amount || receiptAppt.doctor?.fee}</span>
              </div>
            </div>

            <Button variant="primary" className="w-full" icon={Printer} onClick={() => window.print()}>
              Print Receipt Document
            </Button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default PatientDashboard;
