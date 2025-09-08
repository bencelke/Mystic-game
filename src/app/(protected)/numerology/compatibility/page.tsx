import { redirect } from 'next/navigation';

export default function CompatibilityPage() {
  redirect('/numerology?tab=compat');
}