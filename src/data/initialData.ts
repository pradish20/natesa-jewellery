import { Branch, Category, FeaturedSlide, Product, RateSettings, StoreContactSettings } from '../types';

export const INITIAL_RATES: RateSettings = {
  gold_22k_rate: 6720,
  gold_24k_rate: 7330,
  silver_925_rate: 94,
  updated_at: new Date().toISOString()
};

export const INITIAL_STORE_CONTACT: StoreContactSettings = {
  phone_primary: '+91 94432 53072',
  phone_secondary: '+91 99444 00666',
  phone_whatsapp: '+91 94432 53072',
  email: 'natesajewellery@gmail.com',
  main_branch_address: 'Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001',
  second_branch_address: 'Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701',
  opening_hours: 'Daily: 9:30 AM – 9:00 PM',
  announcement_text: 'Main Branch: Krishnagiri • Live Gold & Silver Rates Updated Daily • 100% BIS 916 Hallmarked'
};

export const INITIAL_FEATURED_SLIDES: FeaturedSlide[] = [
  {
    id: 'slide-1',
    title: 'Royal Kasu & Mango Haram',
    subtitle: 'Signature bridal masterpiece with custom weight options and zero hidden charges.',
    badge: 'Signature Bridal Masterpiece',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    category_slug: 'gold-necklaces-malas',
    cta_text: 'View Gold Necklaces & Malas',
    display_order: 1,
    is_active: true
  },
  {
    id: 'slide-2',
    title: 'Goddess Lakshmi Divine Temple Kada',
    subtitle: 'Heavy handcrafted 22K gold temple kada with 3D Lakshmi motif and sacred elephants.',
    badge: 'Heritage Temple Gold',
    image_url: 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=1200&q=80',
    category_slug: 'temple-kadas-bangles',
    cta_text: 'Explore Temple Kadas',
    display_order: 2,
    is_active: true
  },
  {
    id: 'slide-3',
    title: 'Guttapusalu Antique Ruby Jhumkas',
    subtitle: 'Royal South Indian antique finish jhumkas adorned with natural pearls and ruby drops.',
    badge: 'Handcrafted Antique Jewellery',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80',
    category_slug: 'antique-jhumkas-studs',
    cta_text: 'View Antique Earrings',
    display_order: 3,
    is_active: true
  },
  {
    id: 'slide-4',
    title: 'Pure 92.5 Sterling Silver Kolusu',
    subtitle: 'Traditional bridal anklets, pooja silver lamps, and exquisite silver waist chains.',
    badge: 'Certified 92.5 Fine Silver',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
    category_slug: 'silver-kolusu-anklets',
    cta_text: 'Explore Silver Collection',
    display_order: 4,
    is_active: true
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'krishnagiri-main',
    name: 'Main Branch — Krishnagiri',
    tagline: 'Main Bazaar Showroom & Heritage Vault',
    address: 'Near Old Bus Stand, Gandhi Road, Main Bazaar, Krishnagiri, Tamil Nadu — 635001',
    phones: ['+91 94432 53072', '+91 99444 00666'],
    hours: 'Mon – Sun: 9:30 AM – 9:00 PM',
    gmaps_embed: 'https://maps.google.com/maps?q=Krishnagiri+Main+Bazaar&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    id: 'dharmapuri-branch',
    name: 'Second Branch — Dharmapuri',
    tagline: 'Town Hall Showroom',
    address: 'Bazaar Street, Opposite Town Hall, Near Gandhi Statue, Dharmapuri, Tamil Nadu — 636701',
    phones: ['+91 78680 82878'],
    hours: 'Mon – Sun: 9:30 AM – 8:30 PM',
    gmaps_embed: 'https://maps.google.com/maps?q=Dharmapuri+Town+Hall&t=&z=15&ie=UTF8&iwloc=&output=embed'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Gold Necklaces & Malas',
    slug: 'gold-necklaces-malas',
    description: 'Exquisite 22K gold bridal harams, kasu malas, mango malas, and grand choker necklaces.',
    banner_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    display_order: 1
  },
  {
    id: 'cat-2',
    name: 'Antique Jhumkas & Studs',
    slug: 'antique-jhumkas-studs',
    description: 'Royal temple antique gold jhumka earrings with ruby, emerald, and freshwater pearl drops.',
    banner_image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80',
    display_order: 2
  },
  {
    id: 'cat-3',
    name: 'Temple Kadas & Bangles',
    slug: 'temple-kadas-bangles',
    description: 'Intricately embossed Lakshmi & peacock motif gold kadas, valaiyal sets, and adjustable bangles.',
    banner_image_url: 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=1200&q=80',
    display_order: 3
  },
  {
    id: 'cat-4',
    name: 'Gold Cocktail & Navratna Rings',
    slug: 'gold-cocktail-navratna-rings',
    description: 'Statement cocktail rings featuring Navratna gemstones, Kundan filigree, and hallmarked 22K gold.',
    banner_image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
    display_order: 4
  },
  {
    id: 'cat-5',
    name: '92.5 Sterling Silver Kolusu',
    slug: 'silver-kolusu-anklets',
    description: 'Handcrafted 92.5 sterling silver anklets (Kolusu), silver pooja items, and silver waist chains.',
    banner_image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
    display_order: 5
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Royal Heritage Kasu Haram Necklace',
    slug: 'royal-heritage-kasu-haram-necklace',
    category_slug: 'gold-necklaces-malas',
    description: 'Generations-favorite South Indian Kasu Mala embossed with Goddess Lakshmi coins, crowned with Burmese rubies and emerald drops.',
    metal_type: '22k_gold',
    net_weight: 48.5,
    wastage_percent: 9.5,
    making_charges: 2800,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    in_stock: true
  },
  {
    id: 'prod-2',
    name: 'Guttapusalu Antique Ruby Jhumkas',
    slug: 'guttapusalu-antique-ruby-jhumkas',
    category_slug: 'antique-jhumkas-studs',
    description: 'Traditional temple finish antique gold jhumkas adorned with rice pearls, uncut rubies, and floral filigree ear studs.',
    metal_type: '22k_gold',
    net_weight: 18.2,
    wastage_percent: 8.0,
    making_charges: 1500,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    in_stock: true
  },
  {
    id: 'prod-3',
    name: 'Goddess Lakshmi Divine Temple Kada',
    slug: 'goddess-lakshmi-divine-temple-kada',
    category_slug: 'temple-kadas-bangles',
    description: 'Heavy handcrafted 22K gold temple kada with 3D Goddess Lakshmi motif flanked by sacred elephants and kemp stone border.',
    metal_type: '22k_gold',
    net_weight: 32.0,
    wastage_percent: 10.0,
    making_charges: 2200,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    in_stock: true
  },
  {
    id: 'prod-4',
    name: 'Imperial Navratna Gold Cocktail Ring',
    slug: 'imperial-navratna-gold-cocktail-ring',
    category_slug: 'gold-cocktail-navratna-rings',
    description: 'A masterpiece 9-gemstone Navratna ring set in 22K hallmarked gold with intricate micro-granulation work.',
    metal_type: '22k_gold',
    net_weight: 9.8,
    wastage_percent: 7.5,
    making_charges: 950,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    in_stock: true
  },
  {
    id: 'prod-5',
    name: '92.5 Pure Silver Traditional Bridal Kolusu',
    slug: '925-pure-silver-traditional-bridal-kolusu',
    category_slug: 'silver-kolusu-anklets',
    description: 'Authentic 92.5 Sterling Silver handcrafted anklet pair (Kolusu) with rhythmic silver gungroo bells and floral clasp.',
    metal_type: '925_silver',
    net_weight: 120.0,
    wastage_percent: 5.0,
    making_charges: 850,
    purity_hallmark: '92.5 Sterling Silver Certified',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    in_stock: true
  },
  {
    id: 'prod-6',
    name: 'Manga Mala Antique Gold Choker',
    slug: 'manga-mala-antique-gold-choker',
    category_slug: 'gold-necklaces-malas',
    description: 'Classic Kerala Mango Mala choker set with vibrant kemp stones, crafted in rich antique gold finish.',
    metal_type: '22k_gold',
    net_weight: 36.4,
    wastage_percent: 9.0,
    making_charges: 2100,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    in_stock: true
  },
  {
    id: 'prod-7',
    name: 'Peacock Motif Antique Studs with Drop Pearl',
    slug: 'peacock-motif-antique-studs-with-drop-pearl',
    category_slug: 'antique-jhumkas-studs',
    description: 'Hand-carved dancing peacock gold ear studs featuring natural South Sea pearls and emerald eyes.',
    metal_type: '22k_gold',
    net_weight: 12.5,
    wastage_percent: 8.5,
    making_charges: 1100,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    in_stock: true
  },
  {
    id: 'prod-8',
    name: 'Antique Gold Valaiyal Bangle Set (Pair of 4)',
    slug: 'antique-gold-valaiyal-bangle-set',
    category_slug: 'temple-kadas-bangles',
    description: 'Set of 4 traditional Tamil Valaiyal bangles with textured floral borders in 22K yellow gold.',
    metal_type: '22k_gold',
    net_weight: 52.0,
    wastage_percent: 8.5,
    making_charges: 3200,
    purity_hallmark: 'BIS 916 22K Hallmarked',
    image_url: 'https://images.unsplash.com/photo-1611591475197-e81816e88514?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    in_stock: true
  },
  {
    id: 'prod-9',
    name: '92.5 Silver Pooja Kamatchi Amman Lamp Set',
    slug: '925-silver-pooja-kamatchi-amman-lamp-set',
    category_slug: 'silver-kolusu-anklets',
    description: 'Exquisite 92.5 pure silver traditional Kamatchi Amman deepam lamp pair for sacred home rituals.',
    metal_type: '925_silver',
    net_weight: 250.0,
    wastage_percent: 4.0,
    making_charges: 1400,
    purity_hallmark: '92.5 Sterling Silver Certified',
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    is_featured: false,
    in_stock: true
  }
];
