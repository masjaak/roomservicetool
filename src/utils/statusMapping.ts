export function mapOrderStatusToStep(status: string | undefined | null): number {
  if (!status) return 0;
  
  switch (status.toLowerCase()) {
    case 'incoming':
      return 0;
    case 'kitchen':
      return 1;
    case 'delivery':
    case 'on_the_way':
    case 'on the way':
      return 2;
    case 'delivered':
    case 'completed':
      return 3;
    default:
      return 0;
  }
}
