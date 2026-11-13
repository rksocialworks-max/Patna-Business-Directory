import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sdk } from '@/services/sdk';
import PublicHeader from '@/components/PublicHeader';
import HomepageBannerSlider from '@/components/HomepageBannerSlider';
import HomepageSections from '@/components/HomepageSections';
import { CATEGORIES, BIHAR_DISTRICTS } from '@/data/directoryOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ApperIcon from '@/components/ApperIcon';

export const route = { path: '/', layout: 'public', access: 'public' };

export default function Home() {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const navigate = useNavigate();

  const { data: categoryData } = useFetch(async () => {
    const result = await sdk.table('categories_c').select(['Id', 'Name', 'sort_order_c']).orderBy('sort_order_c').fetch();
    if (!result.success) throw new Error(result.message);
    return result.data;
  }, []);

  const categoryCards = (categoryData ?? []).map((category) => ({
    ...category,
    ...CATEGORIES.find((item) => item.name === category.Name),
    name: category.Name,
  }));

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (district) params.set('district', district);
    navigate(`/businesses?${params.toString()}`);
  }

  return (
    <div className="min-h-svh bg-background">
      <PublicHeader />
      <HomepageBannerSlider />
      <main>
        <section className="relative mt-4 overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute -right-24 -top-28 size-96 rounded-full border-[48px] border-white/5" />
          <div className="absolute -bottom-36 left-[38%] size-80 rounded-full bg-white/5 blur-2xl" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"><ApperIcon name="MapPin" size={14} /> बिहार के सभी 38 जिलों के लिए</div>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">बिहार का हर बिज़नेस, <span className="text-highlight">अब आपकी पहुँच में।</span></h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 md:text-lg">अपने शहर के भरोसेमंद दुकानदार, सर्विस प्रोवाइडर और प्रोफेशनल खोजें। Discover local businesses across Bihar.</p>
              <form onSubmit={submitSearch} className="mt-8 flex flex-col gap-2 rounded-2xl bg-background p-2 shadow-xl sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2"><ApperIcon name="Search" size={19} className="shrink-0 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="बिज़नेस, सर्विस या कैटेगरी खोजें..." className="border-0 bg-transparent shadow-none focus-visible:ring-0" /></div>
                <select value={district} onChange={(event) => setDistrict(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground sm:w-44"><option value="">सभी जिले</option>{BIHAR_DISTRICTS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
                <Button type="submit" size="lg" className="sm:px-7">खोजें <ApperIcon name="ArrowRight" size={16} /></Button>
              </form>
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-primary-foreground/70"><span className="inline-flex items-center gap-1.5"><ApperIcon name="BadgeCheck" size={15} /> Verified Businesses</span><span className="inline-flex items-center gap-1.5"><ApperIcon name="Crown" size={15} /> Premium Listings</span><span className="inline-flex items-center gap-1.5"><ApperIcon name="Map" size={15} /> All Bihar Districts</span></div>
            </div>
            <div className="hidden md:block">
              <div className="relative mx-auto max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between"><div><p className="text-sm font-bold">Explore Bihar</p><p className="mt-1 text-xs text-primary-foreground/65">Local discovery made simple</p></div><span className="rounded-xl bg-highlight p-3 text-highlight-foreground"><ApperIcon name="Compass" size={24} /></span></div>
                <div className="mt-5 grid grid-cols-2 gap-3">{['Patna', 'Nalanda', 'Gaya', 'Muzaffarpur'].map((place, index) => <Link key={place} to={`/businesses?district=${place}`} className="rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/20"><span className="text-2xl">{['🏙️', '🏛️', '🛕', '🌿'][index]}</span><span className="mt-3 block text-sm font-bold">{place}</span><span className="mt-1 block text-[11px] text-primary-foreground/60">Explore businesses</span></Link>)}</div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-background p-3 text-foreground"><span className="flex size-10 items-center justify-center rounded-lg bg-success-muted text-success"><ApperIcon name="ShieldCheck" size={20} /></span><span><span className="block text-xs font-bold">Local. Trusted. Connected.</span><span className="block text-[11px] text-muted-foreground">A growing business network for Bihar</span></span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Browse by category</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">लोकप्रिय कैटेगरी</h2><p className="mt-2 text-sm text-muted-foreground">अपनी जरूरत की सेवा सही कैटेगरी में खोजें।</p></div><Button variant="outline" asChild className="hidden sm:inline-flex"><Link to="/categories">सभी कैटेगरी <ApperIcon name="ArrowRight" size={15} /></Link></Button></div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categoryCards.slice(0, 12).map((category) => <Link key={category.Id} to={`/businesses?category=${encodeURIComponent(category.name)}`} className="group rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"><span className={`flex size-11 items-center justify-center rounded-xl ${category.color || 'bg-primary/10 text-primary'}`}><ApperIcon name={category.icon || 'Grid3X3'} size={21} /></span><span className="mt-4 block text-sm font-bold">{category.hindi || category.name}</span><span className="mt-1 block text-[11px] text-muted-foreground">{category.name}</span></Link>)}
          </div>
        </section>

        <HomepageSections />

        <section className="bg-primary py-12 text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between md:px-8"><div><p className="text-2xl font-extrabold">अपना Business जोड़ें — बिल्कुल Free</p><p className="mt-2 text-sm text-primary-foreground/70">बिहार के ग्राहकों तक पहुँचें और अपना बिज़नेस ऑनलाइन दिखाएँ।</p></div><Button size="lg" variant="secondary" asChild><Link to="/owner/signup">Register Now <ApperIcon name="ArrowRight" size={16} /></Link></Button></div></section>
      </main>
      <footer className="border-t border-border bg-card py-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground md:px-8"><div className="flex flex-wrap gap-4"><Link to="/contact" className="hover:text-primary">Contact</Link><Link to="/pages/about-us" className="hover:text-primary">About Us</Link><Link to="/pages/privacy-policy" className="hover:text-primary">Privacy</Link><Link to="/pages/terms-and-conditions" className="hover:text-primary">Terms</Link><Link to="/pages/refund-cancellation" className="hover:text-primary">Refunds</Link><Link to="/pages/faq" className="hover:text-primary">FAQ</Link><Link to="/pages/help-support" className="hover:text-primary">Help</Link><Link to="/pages/disclaimer" className="hover:text-primary">Disclaimer</Link><Link to="/owner/login" className="hover:text-primary">Owner Login</Link><Link to="/admin/login" className="hover:text-primary">Admin</Link></div><span>© 2026 Patna Business Directory • Bihar, India</span></div></footer>
    </div>
  );
}
