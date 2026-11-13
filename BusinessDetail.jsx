import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sdk } from '@/services/sdk';
import { toast } from 'sonner';
import PublicHeader from '@/components/PublicHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ApperIcon from '@/components/ApperIcon';
import BusinessExtras from '@/components/BusinessExtras';

const { eq } = window.ApperSDK.CoreSDK;
const FIELDS = [
  'Id', 'Name', 'category_c', 'subcategory_c', 'district_c', 'city_c',
  'area_c', 'pincode_c', 'address_c', 'description_c', 'owner_name_c',
  'phone_c', 'whatsapp_c', 'email_c', 'website_c', 'facebook_c',
  'instagram_c', 'youtube_c', 'linkedin_c', 'x_c', 'telegram_c', 'status_c', 'listing_type_c', 'is_premium_c',
  'is_verified_c', 'rating_c', 'reviews_count_c', 'premium_expiry_c', 'map_url_c', 'hours_c', 'holiday_info_c', 'logo_c', 'cover_c', 'photos_c', 'seo_title_c', 'meta_description_c', 'slug_c',
];

export const route = { path: '/businesses/:id/:slug?', layout: 'public', access: 'public' };

export default function BusinessDetail() {
  const { id } = useParams();
  const [review, setReview] = useState({ customer_name_c: '', mobile_c: '', rating_c: '5', title_c: '', review_c: '' });
  const [enquiry, setEnquiry] = useState({ customer_name_c: '', mobile_c: '', message_c: '', branch_c: '' });
  const [report, setReport] = useState({ reason_c: 'Incorrect Info', description_c: '' });
  const [saving, setSaving] = useState('');

  const { data: business, loading, error, run } = useFetch(async () => {
    const result = await sdk.table('businesses_c').select(FIELDS).get(id);
    return result.data;
  }, [id]);

  const { data: reviews, loading: reviewsLoading, run: runReviews } = useFetch(async () => {
    const result = await sdk.table('reviews_c').select(['Id', 'Name', 'customer_name_c', 'rating_c', 'title_c', 'review_c', 'owner_reply_c']).where(eq('business_c', id)).where(eq('status_c', 'Approved')).orderByDesc('CreatedOn').fetch();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }, [id]);

  const { data: enquiryBranches } = useFetch(async () => {
    const result = await sdk.table('branches_c').select(['Id', 'Name', 'business_c', 'status_c']).where(eq('business_c', id)).fetch();
    if (!result.success) throw new Error(result.message);
    return result.data.filter((branch) => branch.status_c === 'Active');
  }, [id]);

  useEffect(() => {
    if (business?.Name) {
      document.title = business.seo_title_c || `${business.Name} | Patna Business Directory`;
      let description = document.querySelector('meta[name="description"]');
      if (!description) {
        description = document.createElement('meta');
        description.name = 'description';
        document.head.appendChild(description);
      }
      description.content = business.meta_description_c || String(business.description_c || '').slice(0, 155);
      const setMeta = (property, content) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.content = content;
      };
      setMeta('og:title', document.title);
      setMeta('og:description', description.content);
      setMeta('og:type', 'business.business');
      setMeta('og:url', window.location.href);
    }
  }, [business]);

  async function submitReview(event) {
    event.preventDefault();
    setSaving('review');
    try {
      const existing = await sdk.table('reviews_c')
        .select(['Id'])
        .where(eq('business_c', id))
        .where(eq('mobile_c', review.mobile_c))
        .fetch();
      if (!existing.success) throw new Error(existing.message);
      const payload = {
        Name: review.title_c || `Review for ${business.Name}`,
        business_c: id,
        customer_name_c: review.customer_name_c,
        mobile_c: review.mobile_c,
        rating_c: Number(review.rating_c),
        title_c: review.title_c,
        review_c: review.review_c,
        status_c: 'Pending',
        report_status_c: 'None',
      };
      if (existing.data?.[0]) {
        toast.error('A review from this mobile number already exists for this business. Secure review editing requires mobile OTP verification, which is not connected in this demo.');
        return;
      }
      const result = await sdk.table('reviews_c').create(payload);
      if (result.messages?.length) toast.error(result.messages[0]);
      if (!result.data?.length) return;
      toast.success('Review submitted for Admin approval.');
      setReview({ customer_name_c: '', mobile_c: '', rating_c: '5', title_c: '', review_c: '' });
      runReviews();
    } finally {
      setSaving('');
    }
  }

  async function submitEnquiry(event) {
    event.preventDefault();
    setSaving('enquiry');
    try {
      const result = await sdk.table('enquiries_c').create({
        Name: `Enquiry from ${enquiry.customer_name_c}`,
        business_c: id,
        customer_name_c: enquiry.customer_name_c,
        mobile_c: enquiry.mobile_c,
        message_c: enquiry.message_c,
        source_c: 'Form',
        branch_c: enquiry.branch_c || null,
        status_c: 'New',
      });
      if (result.messages?.length) toast.error(result.messages[0]);
      if (!result.data?.length) return;
      toast.success('Enquiry submitted to the business.');
      setEnquiry({ customer_name_c: '', mobile_c: '', message_c: '', branch_c: '' });
    } finally {
      setSaving('');
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    setSaving('report');
    try {
      const result = await sdk.table('reports_c').create({
        Name: `Report: ${business.Name}`,
        business_c: id,
        reason_c: report.reason_c,
        description_c: report.description_c,
        status_c: 'New',
      });
      if (result.messages?.length) toast.error(result.messages[0]);
      if (!result.data?.length) return;
      toast.success('Report sent to Admin for review.');
      setReport({ reason_c: 'Incorrect Info', description_c: '' });
    } finally {
      setSaving('');
    }
  }

  if (loading) {
    return <div className="min-h-svh bg-background"><PublicHeader /><div className="mx-auto max-w-5xl animate-pulse p-8"><div className="h-48 rounded-3xl bg-muted" /><div className="mt-6 h-8 w-1/2 rounded bg-muted" /></div></div>;
  }

  if (error || !business) {
    return <div className="min-h-svh bg-background"><PublicHeader /><div className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Business profile नहीं मिला</h1><p className="mt-2 text-sm text-muted-foreground">{error?.message ?? 'यह listing उपलब्ध नहीं है।'}</p><Button asChild className="mt-5"><Link to="/businesses">सभी बिज़नेस देखें</Link></Button><Button variant="ghost" className="ml-2" onClick={run}>Retry</Button></div></div>;
  }

  const phone = business.phone_c || '';
  const whatsapp = business.whatsapp_c || phone;
  const premiumActive = Boolean(business.is_premium_c) && (!business.premium_expiry_c || business.premium_expiry_c >= new Date().toISOString().slice(0, 10));
  const logoUrl = business.logo_c?.[0]?.url ?? business.logo_c?.[0]?.Url ?? '';
  const coverUrl = premiumActive ? (business.cover_c?.[0]?.url ?? business.cover_c?.[0]?.Url ?? '') : '';

  return (
    <div className="min-h-svh bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <Link to="/businesses" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ApperIcon name="ArrowLeft" size={16} /> सभी बिज़नेस</Link>
        <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="h-40 bg-primary bg-cover bg-center md:h-56" style={coverUrl ? { backgroundImage: "linear-gradient(90deg, rgba(18,42,90,.35), rgba(18,42,90,.15)), url(" + coverUrl + ")" } : undefined} />
          <div className="p-5 md:p-8">
            <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-card bg-primary/10 text-3xl font-extrabold text-primary shadow-md">{logoUrl ? <img src={logoUrl} alt={business.Name + " logo"} className="size-full object-cover" /> : business.Name.slice(0, 1)}</div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap gap-2">{premiumActive && <Badge className="bg-highlight text-highlight-foreground">Premium Business</Badge>}{business.is_verified_c && <Badge className="bg-success-muted text-success">Admin Verified</Badge>}</div>
                <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">{business.Name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{business.category_c} • {business.city_c}, {business.district_c}</p>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-highlight/15 px-3 py-2 text-sm font-bold"><ApperIcon name="Star" size={16} className="fill-highlight text-highlight" /> {Number(business.rating_c || 0).toFixed(1)} <span className="font-normal text-muted-foreground">({business.reviews_count_c || 0})</span></div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {phone && <Button asChild><a href={`tel:${phone}`}><ApperIcon name="Phone" size={16} /> Call Now</a></Button>}
              {whatsapp && <Button variant="outline" asChild><a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><ApperIcon name="MessageCircle" size={16} /> WhatsApp Chat</a></Button>}
              {premiumActive && business.website_c && <Button variant="outline" asChild><a href={business.website_c} target="_blank" rel="noreferrer"><ApperIcon name="Globe" size={16} /> Visit Website</a></Button>}
              {business.map_url_c && <Button variant="outline" asChild><a href={business.map_url_c} target="_blank" rel="noreferrer"><ApperIcon name="Navigation" size={16} /> Get Directions</a></Button>}
              <Button variant="outline" asChild><a href={`https://wa.me/?text=${encodeURIComponent(`${business.Name} - ${window.location.href}`)}`} target="_blank" rel="noreferrer"><ApperIcon name="Share2" size={16} /> Share on WhatsApp</a></Button>
            </div>

            <div className="mt-8 grid gap-7 md:grid-cols-[1.4fr_0.8fr]">
              <div>
                <h2 className="text-lg font-bold">Business के बारे में</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{business.description_c}</p>
                <div className="mt-7"><h2 className="text-lg font-bold">Business Hours</h2><p className="mt-2 whitespace-pre-line rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">{business.hours_c || 'समय की जानकारी उपलब्ध नहीं है।'}</p>{business.holiday_info_c && <p className="mt-2 text-xs text-muted-foreground">Holiday information: {business.holiday_info_c}</p>}</div>
                {premiumActive && (business.facebook_c || business.instagram_c || business.youtube_c || business.linkedin_c || business.x_c || business.telegram_c || business.email_c) && <div className="mt-7"><h2 className="text-lg font-bold">Online Presence</h2><div className="mt-3 flex flex-wrap gap-3 text-sm">{business.facebook_c && <a className="text-primary underline" href={business.facebook_c} target="_blank" rel="noreferrer">Facebook</a>}{business.instagram_c && <a className="text-primary underline" href={business.instagram_c} target="_blank" rel="noreferrer">Instagram</a>}{business.youtube_c && <a className="text-primary underline" href={business.youtube_c} target="_blank" rel="noreferrer">YouTube</a>}{business.linkedin_c && <a className="text-primary underline" href={business.linkedin_c} target="_blank" rel="noreferrer">LinkedIn</a>}{business.x_c && <a className="text-primary underline" href={business.x_c} target="_blank" rel="noreferrer">X</a>}{business.telegram_c && <a className="text-primary underline" href={business.telegram_c} target="_blank" rel="noreferrer">Telegram</a>}{business.email_c && <a className="text-primary underline" href={'mailto:' + business.email_c}>Email Business</a>}</div></div>}
              </div>
              <aside className="rounded-2xl border border-border p-5">
                <h2 className="font-bold">Contact & Location</h2>
                <div className="mt-4 flex gap-3"><ApperIcon name="MapPin" size={18} className="mt-0.5 text-primary" /><div><p className="text-sm font-medium">{business.area_c}, {business.city_c}</p><p className="mt-1 text-xs text-muted-foreground">{business.district_c}, Bihar {business.pincode_c}</p></div></div>
                <div className="mt-4 flex gap-3"><ApperIcon name="Clock" size={18} className="mt-0.5 text-primary" /><p className="text-sm text-muted-foreground">Weekly schedule and holiday information</p></div>
                <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">Mobile और WhatsApp नंबर privacy के लिए सार्वजनिक रूप से नहीं दिखाए जाते।</p>
              </aside>
            </div>
          </div>
        </section>

        <BusinessExtras businessId={id} premiumActive={premiumActive} />
        {premiumActive && (business.photos_c ?? []).length > 0 && <section className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-7"><h2 className="text-lg font-bold">Photo Gallery</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{business.photos_c.map((photo, index) => { const url = photo.url ?? photo.Url; return url ? <img key={photo.Id ?? index} src={url} alt={business.Name + " photo " + (index + 1)} loading="lazy" className="aspect-square w-full rounded-xl object-cover" /> : null; })}</div></section>}

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <form onSubmit={submitEnquiry} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Send an Enquiry</h2>
            <p className="mt-1 text-xs text-muted-foreground">Business owner को आपका संदेश भेजें।</p>
            <div className="mt-4 space-y-3">
              <Input required placeholder="Your name" value={enquiry.customer_name_c} onChange={(event) => setEnquiry((current) => ({ ...current, customer_name_c: event.target.value }))} />
              <Input required placeholder="Mobile number" value={enquiry.mobile_c} onChange={(event) => setEnquiry((current) => ({ ...current, mobile_c: event.target.value }))} />
              {(enquiryBranches ?? []).length > 0 && <select value={enquiry.branch_c} onChange={(event) => setEnquiry((current) => ({ ...current, branch_c: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Send to main business</option>{enquiryBranches.map((branch) => <option key={branch.Id} value={branch.Id}>{branch.Name}</option>)}</select>}
              <Textarea required rows={3} placeholder="What would you like to know?" value={enquiry.message_c} onChange={(event) => setEnquiry((current) => ({ ...current, message_c: event.target.value }))} />
              <Button type="submit" disabled={saving === 'enquiry'}>{saving === 'enquiry' ? 'Sending…' : 'Send Enquiry'}</Button>
            </div>
          </form>

          <form onSubmit={submitReview} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Write a Review</h2>
            <p className="mt-1 text-xs text-muted-foreground">Review Admin approval के बाद प्रकाशित होगा।</p>
            <div className="mt-4 space-y-3">
              <Input required placeholder="Your name" value={review.customer_name_c} onChange={(event) => setReview((current) => ({ ...current, customer_name_c: event.target.value }))} />
              <Input required placeholder="Mobile number (OTP verification not connected in demo)" value={review.mobile_c} onChange={(event) => setReview((current) => ({ ...current, mobile_c: event.target.value }))} />
              <select value={review.rating_c} onChange={(event) => setReview((current) => ({ ...current, rating_c: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option></select>
              <Input placeholder="Review title" value={review.title_c} onChange={(event) => setReview((current) => ({ ...current, title_c: event.target.value }))} />
              <Textarea required rows={3} placeholder="Share your experience..." value={review.review_c} onChange={(event) => setReview((current) => ({ ...current, review_c: event.target.value }))} />
              <Button type="submit" disabled={saving === 'review'}>{saving === 'review' ? 'Submitting…' : 'Submit Review'}</Button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-7">
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Customer Reviews</h2><p className="mt-1 text-sm text-muted-foreground">Approved reviews are shown publicly.</p></div><Badge variant="outline">{reviews?.length ?? 0} reviews</Badge></div>
          {reviewsLoading && <p className="mt-5 text-sm text-muted-foreground">Loading reviews…</p>}
          {!reviewsLoading && (reviews ?? []).length === 0 && <p className="mt-5 text-sm text-muted-foreground">अभी कोई approved review नहीं है।</p>}
          <div className="mt-5 space-y-4">{(reviews ?? []).map((item) => <article key={item.Id} className="border-t border-border pt-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{item.customer_name_c}</p><p className="text-xs text-muted-foreground">{item.title_c || item.Name}</p></div><Badge>{item.rating_c} / 5</Badge></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.review_c}</p>{item.owner_reply_c && <p className="mt-3 rounded-lg bg-muted p-3 text-sm"><strong>Business reply:</strong> {item.owner_reply_c}</p>}</article>)}</div>
        </section>

        <details className="mt-6 rounded-2xl border border-border bg-card p-5">
          <summary className="cursor-pointer font-semibold">Report this business listing</summary>
          <form onSubmit={submitReport} className="mt-4 space-y-3">
            <select value={report.reason_c} onChange={(event) => setReport((current) => ({ ...current, reason_c: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Incorrect Info</option><option>Spam</option><option>Closed</option><option>Other</option></select>
            <Textarea required rows={3} placeholder="Describe the issue..." value={report.description_c} onChange={(event) => setReport((current) => ({ ...current, description_c: event.target.value }))} />
            <Button type="submit" variant="outline" disabled={saving === 'report'}>{saving === 'report' ? 'Submitting…' : 'Submit Report'}</Button>
          </form>
        </details>
      </main>
    </div>
  );
}
