import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sdk } from '@/services/sdk';
import BusinessCard from '@/components/BusinessCard';
import PublicHeader from '@/components/PublicHeader';
import { Button } from '@/components/ui/button';
import ApperIcon from '@/components/ApperIcon';

const { isIn } = window.ApperSDK.CoreSDK;
const FIELDS = ['Id', 'Name', 'category_c', 'district_c', 'city_c', 'area_c', 'description_c', 'phone_c', 'whatsapp_c', 'logo_c', 'slug_c', 'premium_expiry_c', 'is_premium_c', 'is_verified_c', 'rating_c', 'reviews_count_c'];

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem('pbd_favorites') || '[]');
  } catch {
    return [];
  }
}

export const route = { path: '/favorites', layout: 'public', access: 'public' };

export default function Favorites() {
  const [ids, setIds] = useState(readFavorites);
  const { data, loading, error, run } = useFetch(async () => {
    if (!ids.length) return [];
    const result = await sdk.table('businesses_c').select(FIELDS).where(isIn('Id', ids)).fetch();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }, [ids.join('|')]);

  function clearFavorites() {
    localStorage.setItem('pbd_favorites', JSON.stringify([]));
    setIds([]);
  }

  return (
    <div className="min-h-svh bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Saved locally on this device</p><h1 className="mt-2 text-3xl font-extrabold">My Favourites</h1><p className="mt-2 text-sm text-muted-foreground">आपके पसंदीदा बिज़नेस। Login की आवश्यकता नहीं है।</p></div>
          {ids.length > 0 && <Button variant="outline" onClick={clearFavorites}>Clear All</Button>}
        </div>
        {error && <p className="mt-6 text-sm text-destructive">{error.message}<Button variant="link" onClick={run}>Retry</Button></p>}
        {loading && <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><div className="h-40 animate-pulse rounded-2xl bg-muted" /><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>}
        {!loading && !error && (data ?? []).length === 0 && <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center"><ApperIcon name="Heart" size={32} className="mx-auto text-muted-foreground" /><h2 className="mt-3 font-bold">No favourites saved</h2><p className="mt-1 text-sm text-muted-foreground">Business cards पर Heart दबाकर उन्हें यहाँ save करें।</p><Button asChild className="mt-4"><Link to="/businesses">Explore Businesses</Link></Button></div>}
        {!loading && (data ?? []).length > 0 && <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((business) => <BusinessCard key={business.Id} business={business} />)}</div>}
      </main>
    </div>
  );
}
