import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, PhoneCall } from 'lucide-react';
import { useCreateEnquiry } from '@/hooks/index';
import { cn } from '@/lib/utils';

interface EnquirySidebarProps {
  packageId?: string;
  packageName?: string;
}

export default function EnquirySidebar({ packageId, packageName }: EnquirySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: submitEnquiry, isPending } = useCreateEnquiry();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: packageName ? `I am interested in the ${packageName} package. Please contact me with more details.` : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitEnquiry({
        ...form,
        subject: `Enquiry for ${packageName || 'Travel Package'}`,
        packageId,
        enquiryType: 'PACKAGE',
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
        setForm({ name: '', email: '', phone: '', message: '' });
      }, 3000);
    } catch (err) {
      console.error('Enquiry submission failed', err);
      alert('Failed to submit enquiry. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-full border border-silk-300 text-silk-700 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-silk-50 transition-all flex items-center justify-center gap-2 group"
      >
        <PhoneCall size={14} className="group-hover:rotate-12 transition-transform" />
        Request a Call Back
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100"
            >
              {isSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="text-emerald-500" size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-navy mb-2">Enquiry Received!</h3>
                  <p className="text-gray-500 text-sm">Our luxury concierge will contact you within 24 hours.</p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-navy">Request a Call</h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Expert assistance for your journey</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Loader2 size={20} className="rotate-45 text-gray-300" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="input-label">Full Name</label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          className="input-field text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Email Address</label>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            className="input-field text-sm"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="input-label">Phone Number</label>
                          <input
                            required
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="input-field text-sm"
                            placeholder="+91"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="input-label">How can we help?</label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                          className="input-field text-sm resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-5 bg-navy text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-navy/20 transition-all flex items-center justify-center gap-3"
                    >
                      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                      {isPending ? 'Submitting...' : 'Send Enquiry'}
                    </button>
                    
                    <p className="text-[10px] text-gray-400 text-center px-6 leading-relaxed">
                      By submitting, you agree to be contacted by our travel specialists regarding your enquiry.
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
