// src/components/dashboard/admin/PackageFormModal.tsx
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { packagesApi, destinationsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description is too short'),
  type: z.enum(['INTERNATIONAL', 'DOMESTIC', 'HONEYMOON', 'ADVENTURE', 'CORPORATE', 'PILGRIMAGE', 'CRUISE', 'WILDLIFE']),
  destinationId: z.string().min(1, 'Please select a destination'),
  duration: z.number().int().min(1).max(60),
  basePrice: z.number().positive(),
  discountedPrice: z.number().positive().optional(),
  coverImage: z.string().url('Invalid URL'),
  isFeatured: z.boolean().default(false),
  highlights: z.array(z.string()).min(1, 'Add at least one highlight'),
  inclusions: z.array(z.string()).min(1, 'Add at least one inclusion'),
  exclusions: z.array(z.string()),
  itinerary: z.array(z.object({
    day: z.number().int().positive(),
    title: z.string().min(1, 'Required'),
    description: z.string().min(1, 'Required'),
    activities: z.array(z.string()).default([]),
  })).min(1, 'Add at least one itinerary day'),
});

type PackageFormData = z.infer<typeof schema>;

interface Props {
  pkg?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PackageFormModal({ pkg, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!pkg;

  const { data: destinations } = useQuery({
    queryKey: ['destinations-list'],
    queryFn: () => destinationsApi.list().then(res => res.data.data),
  });

  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<PackageFormData>({
    resolver: zodResolver(schema),
    defaultValues: pkg ? {
      ...pkg,
      basePrice: Number(pkg.basePrice),
      discountedPrice: pkg.discountedPrice ? Number(pkg.discountedPrice) : undefined,
    } : {
      type: 'INTERNATIONAL',
      duration: 3,
      basePrice: 0,
      isFeatured: false,
      highlights: [''],
      inclusions: [''],
      exclusions: [''],
      itinerary: [{ day: 1, title: '', description: '', activities: [''] }],
    },
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: "highlights" as any
  });

  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({
    control,
    name: "inclusions" as any
  });

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control,
    name: "itinerary" as any
  });

  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await packagesApi.update(pkg.id, data);
        toast.success('Package updated successfully');
      } else {
        await packagesApi.create(data);
        toast.success('New package added to portfolio');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-md z-[100]" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
          {/* Header */}
          <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy-950">{isEdit ? 'Refine Package' : 'Create Masterpiece'}</h2>
              <p className="text-[10px] font-black text-silk-500 uppercase tracking-[0.2em] mt-1">Portfolio Management</p>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            {/* Section 1: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-navy-500 border-b border-gray-100 pb-2">Core Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Package Title</label>
                  <input {...register('title')} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-silk-400 transition-all font-medium" />
                  {errors.title && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.title.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Category</label>
                    <select {...register('type')} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-silk-400 transition-all font-medium">
                      {['INTERNATIONAL', 'DOMESTIC', 'HONEYMOON', 'ADVENTURE', 'CORPORATE', 'PILGRIMAGE', 'CRUISE', 'WILDLIFE'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Featured</label>
                    <div className="flex items-center h-[46px]">
                      <input type="checkbox" {...register('isFeatured')} className="w-5 h-5 rounded border-gray-300 text-silk-500 focus:ring-silk-500" />
                      <span className="ml-2 text-xs font-bold text-navy-700">Star Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Destination</label>
                  <select {...register('destinationId')} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-silk-400 transition-all font-medium">
                    <option value="">Select Destination</option>
                    {destinations?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                    ))}
                  </select>
                  {errors.destinationId && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.destinationId.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Duration (Nights)</label>
                  <input type="number" {...register('duration', { valueAsNumber: true })} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-silk-400 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Base Price (INR)</label>
                  <input type="number" {...register('basePrice', { valueAsNumber: true })} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-silk-400 transition-all font-medium font-num" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Narrative Description</label>
                <textarea {...register('description')} rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-silk-400 transition-all font-medium resize-none" />
                {errors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-navy-400 uppercase tracking-wider ml-1">Cover Image Source (URL)</label>
                <div className="relative">
                  <ImageIcon size={16} className="absolute left-4 top-3.5 text-gray-300" />
                  <input {...register('coverImage')} placeholder="https://unsplash.com/..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-11 pr-4 text-xs focus:outline-none focus:border-silk-400 transition-all font-medium" />
                </div>
              </div>
            </div>

            {/* Section 2: Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-navy-500">Highlights</h3>
                  <button type="button" onClick={() => appendHighlight('')} className="p-1 px-2 text-[9px] font-bold bg-silk-50 text-silk-600 rounded-lg hover:bg-silk-100 transition-all">Add Field</button>
                </div>
                {highlightFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`highlights.${index}` as any)} className="flex-1 bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs font-medium" />
                    <button type="button" onClick={() => removeHighlight(index)} className="p-2 text-red-300 hover:text-red-500 self-center"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-navy-500">Inclusions</h3>
                  <button type="button" onClick={() => appendInclusion('')} className="p-1 px-2 text-[9px] font-bold bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all">Add Field</button>
                </div>
                {inclusionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`inclusions.${index}` as any)} className="flex-1 bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs font-medium" />
                    <button type="button" onClick={() => removeInclusion(index)} className="p-2 text-red-300 hover:text-red-500 self-center"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Itinerary */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-navy-500">Curated Itinerary</h3>
                <button type="button" onClick={() => appendItinerary({ day: itineraryFields.length + 1, title: '', description: '', activities: [''] })} className="flex items-center gap-1.5 p-1.5 px-3 text-[10px] font-black uppercase tracking-widest bg-navy-950 text-white rounded-xl hover:bg-navy-800 transition-all">
                  <Plus size={14} /> Add Day
                </button>
              </div>
              
              <div className="space-y-8">
                {itineraryFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 relative group">
                    <button type="button" onClick={() => removeItinerary(index)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-[80px_1fr] gap-6">
                      <div className="flex flex-col items-center justify-center border-r border-gray-100">
                        <span className="text-[10px] font-black text-silk-500 uppercase tracking-widest">Day</span>
                        <input type="number" {...register(`itinerary.${index}.day` as any, { valueAsNumber: true })} className="w-12 h-12 text-center text-xl font-display font-black text-navy-950 bg-white border border-gray-100 rounded-xl mt-1 focus:outline-none focus:border-silk-400 transition-all" />
                      </div>
                      <div className="space-y-4">
                        <input {...register(`itinerary.${index}.title` as any)} placeholder="Day Title (e.g. Arrival in Paris)" className="w-full bg-white border border-gray-100 rounded-xl py-2 px-4 text-sm font-bold focus:outline-none focus:border-silk-400 transition-all" />
                        <textarea {...register(`itinerary.${index}.description` as any)} rows={2} placeholder="Day overview..." className="w-full bg-white border border-gray-100 rounded-xl py-2 px-4 text-xs font-medium focus:outline-none focus:border-silk-400 transition-all resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-10 py-8 border-t border-gray-100 flex items-center justify-end gap-4 shrink-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            <button type="button" onClick={onClose} className="px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-navy-950 transition-colors">Discard</button>
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="px-10 py-3.5 bg-silk-400 text-navy-950 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-silk-400/20 hover:bg-silk-300 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-100 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Finalize Portfolio'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
