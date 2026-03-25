import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiryApi } from '@/lib/api';

export function useCreateEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      message: string;
      packageName?: string;
      packageId?: string;
      enquiryType?: string;
      subject?: string;
    }) => enquiryApi.submit(data),
    onSuccess: () => {
      // Refresh notifications or admin data if needed
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
