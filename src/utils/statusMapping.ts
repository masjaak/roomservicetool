export function mapOrderStatusToStep(status: string | undefined | null): number {
  if (!status) return 0;
  
  switch (status.toLowerCase()) {
    case 'incoming':
      return 0;
    case 'confirmed':
      return 1;
    case 'kitchen':
    case 'preparing':
      return 2;
    case 'quality_check':
      return 3;
    case 'delivery':
    case 'on_the_way':
    case 'on the way':
      return 4;
    case 'delivered':
    case 'completed':
      return 5;
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}
