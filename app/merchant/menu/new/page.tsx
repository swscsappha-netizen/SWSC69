'use client';

import { useApp } from '@/context/AppContext';
import MenuForm from '@/components/MenuForm';

export default function NewMenuPage() {
  const { currentUser } = useApp();
  const shopId = currentUser.shopId || 'shop_1';

  return <MenuForm mode="new" shopId={shopId} />;
}
