import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sdk } from '@/services/sdk';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ApperIcon from '@/components/ApperIcon';

const FIELDS = ['Id', 'Name', 'category_c', 'district_c', 'status_c', 'is_premium_c', 'is_verified_c', 'premium_expiry_c'];

export const route = { path: '/admin', layout: 'owner', access: "profile === 'Admin_c'" };
export const nav = { icon: 'LayoutDashboard', label: 'Admin Overview', section: 'Administration', profiles: ['Admin_c'], order: 1 };

export default function AdminDashboard() {
  const { data, loading, error, run } = useFetch(async () => {
    const result = await sdk.table('businesses_c').select(FIELDS).fetch();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }, []);

  const businesses = data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const pending = businesses.filter((item) => item.status_c === 'Pending Approval');
  const expiredPremiums = businesses.filter((item) => item.is_premium_c && item.premium_expiry_c && item.premium_expiry_c < today);
  const premium = businesses.filter((item) => item.is_premium_c && (!item.premium_expiry_c || item.premium_expiry_c >= today));
  const verified = businesses.filter((item) => item.is_verified_c);

  async function runExpiryCheck() {
    if (!expiredPremiums.length) {
      toast.success('No expired Premium listings found.');
      return;
    }
    let updated = 0;
    for (const item of expiredPremiums) {
      const result = await sdk.table('businesses_c').update({
        Id: item.Id,
        is_premium_c: false,
        listing_type_c: 'Free',
      });
      if (result.data?.length) updated += 1;
    }
    toast.success(`${updated} expired Premium listing(s) returned to Free status.`);
    run();
  }

  const stats = [
    { label: 'Total Businesses', value: businesses.length, icon: 'Store', tone: 'bg-primary/10 text-primary' },
    { label: 'Pending Approval', value: pending.length, icon: 'Clock3', tone: 'bg-warning-muted text-warning' },
    { label: 'Active Premium', value: premium.length, icon: 'Crown', tone: 'bg-highlight/20 text-highlight-foreground' },
    { label: 'Verified Businesses', value: verified.length, icon: 'ShieldCheck', tone: 'bg-success-muted text-success' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Control centre</p>
          <h1 className="mt-2 text-3xl font-extrabold">Super Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Patna Business Directory का संचालन और listing moderation।</p>
        </div>
        <Button asChild><Link to="/admin/businesses">Manage Listings <ApperIcon name="ArrowRight" size={15} /></Link></Button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error.message}<Button variant="link" onClick={run}>Retry</Button></div>}

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => <Card key={item.label}><CardContent className="flex items-center gap-4 p-5"><span className={`flex size-11 items-center justify-center rounded-xl ${item.tone}`}><ApperIcon name={item.icon} size={21} /></span><span><span className="block text-xs text-muted-foreground">{item.label}</span><span className="mt-1 block text-2xl font-extrabold">{loading ? '—' : item.value}</span></span></CardContent></Card>)}
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold">Premium Expiry Monitor</h2><p className="mt-1 text-sm text-muted-foreground">{expiredPremiums.length} expired Premium listing(s) need to return to Free status.</p></div>
          <Button variant="outline" onClick={runExpiryCheck} disabled={loading}><ApperIcon name="RefreshCw" size={15} /> Run Expiry Check</Button>
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-bold">Pending Approvals</h2><p className="mt-1 text-xs text-muted-foreground">नई business listings review करें।</p></div><Button variant="outline" size="sm" asChild><Link to="/admin/businesses">View All</Link></Button></div>
          <div className="mt-5 space-y-3">{pending.slice(0, 5).map((item) => <div key={item.Id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0"><span className="flex size-10 items-center justify-center rounded-xl bg-warning-muted text-warning"><ApperIcon name="Store" size={18} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.Name}</span><span className="block text-xs text-muted-foreground">{item.category_c} • {item.district_c}</span></span><Badge variant="outline">Pending</Badge></div>)}{!loading && pending.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No pending listings.</p>}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h2 className="font-bold">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild><Link to="/admin/businesses"><ApperIcon name="ClipboardCheck" size={17} /> Review Business Listings</Link></Button>
            <Button variant="outline" className="w-full justify-start" asChild><Link to="/admin/operations"><ApperIcon name="SlidersHorizontal" size={17} /> All Operations & Settings</Link></Button>
            <Button variant="outline" className="w-full justify-start" asChild><Link to="/businesses"><ApperIcon name="ExternalLink" size={17} /> View Public Directory</Link></Button>
            <Button variant="outline" className="w-full justify-start" asChild><Link to="/"><ApperIcon name="House" size={17} /> Open Homepage</Link></Button>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}
