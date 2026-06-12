export const adoptionRequestStatuses = ['pending', 'approved', 'rejected'] as const;

export type AdoptionRequestStatus = (typeof adoptionRequestStatuses)[number];

export const adoptionRequestStatusLabels: Record<AdoptionRequestStatus, string> = {
  pending: '待處理',
  approved: '已核准',
  rejected: '已拒絕',
};

export const isAdoptionRequestStatus = (value: string): value is AdoptionRequestStatus =>
  adoptionRequestStatuses.includes(value as AdoptionRequestStatus);

export const getAdoptionRequestStatusMeta = (status: string | null | undefined) => {
  if (!status) {
    return {
      label: '-',
      tone: 'default' as const,
    };
  }

  if (isAdoptionRequestStatus(status)) {
    return {
      label: adoptionRequestStatusLabels[status],
      tone: status,
    };
  }

  return {
    label: status,
    tone: 'default' as const,
  };
};
