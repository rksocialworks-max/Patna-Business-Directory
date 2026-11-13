import { Link } from 'react-router-dom';
import { useAuth } from '@/layouts/RootLayout';
import { useFetch } from '@/hooks/useFetch';
import { sdk } from '@/services/sdk';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ApperIcon from '@/components/ApperIcon';

const FIELDS = [
  'Id',
  'Name',
  'category_c',
  'district_c',
  'city_c',
  'status_c',
  'is_premium_c',
  'is_verified_c',
  'premium_expiry_c',
  'CreatedOn',
];

export const route = {
  path: '/owner/businesses',
  layout: 'owner',
  access: "profile === 'BusinessOwner_c'",
};

export const nav = {
  icon: 'Store',
  label: 'My Businesses',
  section: 'Workspace',
  profiles: ['BusinessOwner_c'],
  order: 10,
};

export default function OwnerMyBusinesses() {
  const { user } = useAuth();

  const { data, loading, error, run } = useFetch(async () => {
    const result = await sdk.table('businesses_c')
      .select(FIELDS)
      .orderByDesc('CreatedOn')
      .fetch();

    if (!result.success) throw new Error(result.message);
    return result.data;
  }, [user?.Id]);

  const businesses = data ?? [];
  const approvedCount = businesses.filter((item) => item.status_c === 'Approved').length;
  const pendingCount = businesses.filter((item) => item.status_c === 'Pending Approval').length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Owner workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold">My Businesses</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            अपने सभी registered businesses और उनकी listing स्थिति देखें।
          </p>
        </div>
        <Button asChild>
          <Link to="/owner/businesses/new">
            <ApperIcon name="Plus" size={16} />
            Add New Business
          </Link>
        </Button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Businesses</p>
          <p className="mt-2 text-2xl font-extrabold">{businesses.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Approved</p>
          <p className="mt-2 text-2xl font-extrabold text-success">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending Approval</p>
          <p className="mt-2 text-2xl font-extrabold text-warning">{pendingCount}</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
          {error.message}
          <Button variant="link" onClick={run}>Retry</Button>
        </div>
      )}

      {loading && (
        <div className="mt-7 space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        </div>
      )}

      {!loading && !error && businesses.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <ApperIcon name="Store" size={30} className="mx-auto text-muted-foreground" />
          <h2 className="mt-3 font-bold">अभी कोई Business नहीं है</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            अपना पहला Business जोड़कर शुरुआत करें।
          </p>
          <Button asChild className="mt-4">
            <Link to="/owner/businesses/new">Add Business</Link>
          </Button>
        </div>
      )}

      {!loading && businesses.length > 0 && (
        <div className="mt-7 space-y-3">
          {businesses.map((business) => (
            <div
              key={business.Id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-extrabold text-primary">
                {business.Name?.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{business.Name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {business.city_c}, {business.district_c} • {business.category_c}
                </p>
                {business.is_premium_c && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Premium expiry: {business.premium_expiry_c || 'Not set'}
                  </p>
                )}
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                {business.is_premium_c && (
                  <Badge className="bg-highlight text-highlight-foreground">Premium</Badge>
                )}
                <Badge variant={business.status_c === 'Approved' ? 'secondary' : 'outline'}>
                  {business.status_c}
                </Badge>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/owner/businesses/${business.Id}`}>Manage</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
