import PolicyPage from '@/components/PolicyPage';

export const metadata = {
  title: 'Shipping & Returns | Downtown Boutique',
  description: 'Shipping & Returns Policy for Downtown Boutique.',
};

export default function ShippingPage() {
  return <PolicyPage title="Shipping & Returns" policyKey="shippingAndReturns" />;
}
