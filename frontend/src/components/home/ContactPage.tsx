// src/components/home/ContactPage.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { enquiryApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { LazySection } from '@/components/ui/index';

const ENQUIRY_TYPES = [
  { value: 'GENERAL',   label: 'General Enquiry' },
  { value: 'PACKAGE',   label: 'Package Booking' },
  { value: 'CORPORATE', label: 'Corporate Travel' },
  { value: 'MICE',      label: 'MICE / Events' },
];

const CONTACT_INFO = [
  { icon: Phone,   label: 'Call Us (Primary)',  value: '+91 74116 05384',         sub: 'Mon–Sat, 9 AM – 7 PM' },
  { icon: Phone,   label: 'Support Line',       value: '+91 86600 47495',         sub: 'Concierge Support' },
  { icon: Mail,    label: 'Email',             value: 'hello@tripinminutes.in',  sub: 'Reply within 24h' },
  { icon: MapPin,  label: 'Bangalore Office',  value: 'Mittal Tower, MG Road',   sub: 'Bangalore 560001' },
  { icon: MapPin,  label: 'Mumbai Office',     value: 'Sudama Space, Virar West', sub: 'Mumbai 401303' },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '', enquiryType: 'GENERAL',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enquiryApi.submit(form);
      setSubmitted(true);
      toast.success('Enquiry submitted! We will contact you within 24 hours.');
    } catch {
      toast.error('Failed to submit. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-20">
      {/* Hero */}
      <div className="bg-[#F8F7F4] py-12 sm:py-20 relative overflow-hidden border-b border-navy-100/50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-silk-500 blur-[120px] -mr-48 -mt-48 rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-silk-500 blur-[100px] -ml-32 -mb-32 rounded-full" />
        </div>
        <div className="container-app text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-silk-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center">Get In Touch</p>
            <h1 className="font-display font-bold text-navy-900 text-4xl md:text-6xl mb-6 tracking-tight text-center">
              Contact Us
            </h1>
            <p className="text-navy-900/60 text-base max-w-sm mx-auto leading-relaxed font-medium text-center">
              Have a question or want to plan your dream trip? Our travel experts are here to help.
            </p>
          </motion.div>
        </div>
      </div>

      <LazySection className="container-app py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact info sidebar */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-[#020617] mb-6 tracking-tight">Concierge Details</h2>
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="bg-white rounded-2xl p-4 flex items-start gap-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 border border-transparent hover:border-gray-50">
                <div className="w-10 h-10 bg-silk-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-silk-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-[#020617] mt-1">{value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            <a href="https://wa.me/917411605384" target="_blank" rel="noreferrer"
              className="btn bg-emerald-500 text-white hover:bg-emerald-600 w-full justify-center mt-2">
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-2xl shadow-navy-800/5">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#020617] mb-3 tracking-tight">Enquiry Received!</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Our travel expert will reach out to you within 24 hours at <br/><strong className="text-[#020617]">{form.email}</strong>.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '', enquiryType: 'GENERAL' }); }}
                  className="bg-[#020617] hover:bg-silk-500 text-white hover:text-white font-black px-8 py-3 rounded-xl transition-all duration-300 uppercase tracking-widest text-[11px] shadow-lg hover:shadow-silk-500/20">
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 space-y-5 sm:space-y-6 shadow-2xl shadow-navy-800/5">
                <h2 className="font-display font-bold text-2xl text-[#020617] tracking-tight">Send us a message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Priya Sharma" className="input-field" required />
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210" className="input-field" required />
                  </div>
                </div>

                <div>
                  <label className="input-label">Email Address</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" className="input-field" required />
                </div>

                <div>
                  <label className="input-label">Enquiry Type</label>
                  <select value={form.enquiryType} onChange={(e) => setForm({ ...form, enquiryType: e.target.value })}
                    className="input-field">
                    {ENQUIRY_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Subject</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g., Planning a Europe trip for 4 people" className="input-field" required />
                </div>

                <div>
                  <label className="input-label">Message</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your travel plans, dates, budget, and any special requirements…"
                    rows={5} className="input-field resize-none" required />
                </div>

                <button type="submit" disabled={loading} 
                  className="bg-[#020617] hover:bg-silk-500 text-white hover:text-white font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl transition-all duration-300 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 w-full shadow-xl hover:shadow-silk-500/30">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    : <><Send size={15} /> Send Enquiry</>}
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </LazySection>
    </div>
  );
}
