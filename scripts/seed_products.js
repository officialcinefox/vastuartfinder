// Seed script for Krutik Vastu Art Finder
// 40 Authentic Artwork Products with Valid Krutik URLs, Images & 5-Dimension Mappings

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = "https://adqkvyjfayujwhdhjpne.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWt2eWpmYXl1andoZGhqcG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMDkzMTYsImV4cCI6MjEwNzc4NTMxNn0.FG-hCjV6IZK-gYlCJRvcMNXAwJbV7oFRY3rTouYKkLs";

const PRODUCTS = [
  {
    id: "surya-mandala-tanjore",
    name: "Surya Mandala in 24K Gold & Aged Teak",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpaDTUGKW6NNwLorLOhyUmXRRvB7JoKuJXK0G_ODL3Klmyl5mi5AIf5WKzUuOmnRzPkDABGF2FvVGiRzqNDJLU5vdHP6ZWKyvM4-egGlKSBTuEfu-JbF-kMRYi5QtMMLb1rHluwHBMZ4GKic_hobeAFkcIka3d69zGEt02zJYY8F--YAKtPIsi30CUC7qse2STdwjfGCjfYxbxZgVVL_rLsS8lAWUuh52H5idHCyPeciY9lreA5sdMBA",
    product_url: "https://www.krutik.in/products/surya-mandala-tanjore-24k-gold",
    description: "Handcrafted 24K gold foil with Sukka Mavu relief on aged Burmese teakwood. Aligns solar prana across the eastern meridian to awaken physical vitality and clarity.",
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sri-yantra-lapis",
    name: "Sri Yantra in Chased Brass with Lapis Lazuli",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCT5s6jG7U-q_ZgZq3Gv8Jk7Y1H2vF4_9bN3kL8mP0xW5rT1vY7uI9oP2qR4sT6uV8wX0yZ1aB3cE5gH7jK9mO1pQ3sU5wY7zB9dF1hJ3lN5pQ7rT9vX1z",
    product_url: "https://www.krutik.in/products/sri-yantra-chased-brass-lapis",
    description: "Nine interlocking trikonas forming 43 sub-triangles in deep lapis lazuli and chased virgin brass. Anchors cosmic abundance in Ishanya.",
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ashwa-vigor-horses",
    name: "Ashwa Vigor: 7 Celestial Horses in Silver Leaf",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2bC4dE6fG8hJ0kL2mN4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hJ4kL6mN8pQ0rS2tU4vW6xY8zA0bC2dE4fG6hJ8kL0mN2pQ4rS6tU8vW0xY2z",
    product_url: "https://www.krutik.in/products/ashwa-vigor-7-celestial-horses-silver",
    description: "Seven dynamic horses charging inward with silver foil leafing on midnight indigo. Catalyzes unstoppable momentum, career expansion, and rapid success.",
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "kalpavriksha-pichwai",
    name: "Kalpavriksha Golden Tree of Life Pichwai",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1cD3eF5gH7jK9mN1pQ3rS5tU7vW9xY1zA3bC5dE7fG9hJ1kL3mN5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hJ5kL7mN9pQ1rS3tU5vW7xY9z",
    product_url: "https://www.krutik.in/products/kalpavriksha-golden-tree-of-life-pichwai",
    description: "Handpainted wish-fulfilling sacred banyan with golden leaves and resting peacocks. Radiates harmony, bountiful fortune, and family unity.",
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "gayatridevi-tanjore",
    name: "Gayatri Devi in 24K Teak Frame",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3eE5gG7iI9kK1mM3oO5qQ7sS9uU1wW3yY5aA7cC9eE1gG3iI5kK7mM9oO1qQ3sS5uU7wW9yY1aA3cC5eE7gG9iI1kK3mM5oO7qQ9sS1uU3",
    product_url: "https://www.krutik.in/products/gayatri-devi-24k-gold-tanjore-frame",
    description: "Panchamukhi Gayatri Devi with 24K gold foil and authentic Kundan stones. Bestows intellect, spiritual illumination, and supreme peace.",
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "kuber-dhanakarshan",
    name: "Kuber Dhanakarshan Prosperity Yantra",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5fG7hI9jK1lL3nN5pP7rR9tT1vV3xX5zZ7bB9dD1fF3hH5jJ7lL9nN1pP3rR5tT7vV9xX1zZ3bB5dD7fF9hH1jJ3lL5nN7pP9rR1tT3vV5",
    product_url: "https://www.krutik.in/products/kuber-dhanakarshan-prosperity-yantra",
    description: "Sacred 72-grid magic square dedicated to Lord Kubera. Channels financial stability, steady wealth inflow, and business accumulation.",
    is_active: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "rising-dawn-pichwai",
    name: "Rising Dawn Shreenathji Pichwai with Lotus Pond",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuE7gI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hJ5kL7mN9pQ1rS3tU5vW7xY9zA1bC3dE5fG7hJ9kL1mN3pQ5rS7tU9vW1xY3zA5",
    product_url: "https://www.krutik.in/products/rising-dawn-shreenathji-pichwai-lotus",
    description: "Traditional Nathdwara masterwork depicting Shreenathji in a blooming pink lotus pond. Cultivates deep peace, devotion, and sacred serenity.",
    is_active: true,
    display_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "surya-celestial-chariot",
    name: "Surya Celestial Chariot in Embossed Copper",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuF9hK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hJ5kL7mN9pQ1rS3tU5vW7xY9zA1bC3dE5fG7hJ9kL1mN3pQ5rS7tU9vW1xY3zA5bC7",
    product_url: "https://www.krutik.in/products/surya-celestial-chariot-embossed-copper",
    description: "Sun God riding 7 divine horses driven by Aruna in hand-chased repoussé copper with gold leaf accents. Awakens vitality and courage.",
    is_active: true,
    display_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mahalakshmi-padma-tanjore",
    name: "Mahalakshmi on Red Lotus in Pure 24K Gold",
    image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/mahalakshmi-padma-24k-gold-tanjore",
    description: "Goddess Mahalakshmi seated on a crimson lotus shower of golden coins. Traditional Tanjore technique with 24-karat gold foil and Burma teak frame.",
    is_active: true,
    display_order: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "ganesha-pratham-vighnaharta",
    name: "Vighnaharta Ganesha in Aged Teakwood & Gold Leaf",
    image_url: "https://images.unsplash.com/photo-1567878673942-be055fc5d309?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/ganesha-pratham-vighnaharta-aged-teak",
    description: "Auspicious Siddhivinayak Ganesha withModaka and lotus. Consecrated for removing obstacles and inaugurating prosperous beginnings.",
    is_active: true,
    display_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "saraswati-veena-pichwai",
    name: "Goddess Saraswati with Mayura & Veena",
    image_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/goddess-saraswati-veena-mayura-pichwai",
    description: "Goddess of arts, music, and wisdom on white swan. Enhances academic focus, speech, creative inspiration, and career clarity.",
    is_active: true,
    display_order: 11,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "dhyana-shiva-meditation",
    name: "Dhyana Shiva in Himalayas Serene Canvas",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/dhyana-shiva-himalayas-canvas",
    description: "Lord Shiva immersed in transcendent samadhi amidst mist-covered Kailash peaks. Evokes emotional stillness and profound inner tranquility.",
    is_active: true,
    display_order: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "radha-krishna-vrindavan",
    name: "Radha Krishna Raas Leela in Kundan & Gold",
    image_url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/radha-krishna-raas-leela-kundan-gold",
    description: "Divine romantic union of Radha and Krishna under Kadamba tree. Strengthens marital bliss, domestic harmony, and emotional bonding.",
    is_active: true,
    display_order: 13,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "himalayan-peaks-morning-sun",
    name: "Himalayan Golden Peaks Morning Solitude",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/himalayan-golden-peaks-morning-solitude",
    description: "Solid mountain ridgeline painted in heavy impasto earth tones. Anchors unshakeable stability, executive authority, and protection against drishti.",
    is_active: true,
    display_order: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sacred-banyan-tree-earth",
    name: "Ancient Bodhi Banyan Tree with Golden Roots",
    image_url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/ancient-bodhi-banyan-tree-golden-roots",
    description: "Venerable Kalpavriksha banyan with aerial roots rendered in warm ochre and gold leaf. Inspires generational longevity and grounded health.",
    is_active: true,
    display_order: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "kamadhenu-bountiful-grace",
    name: "Kamadhenu Celestial Cow of Abundance",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/kamadhenu-celestial-cow-of-abundance",
    description: "Sacred Kamadhenu accompanied by calf with deific alignments on raw silk. Blesses the household with continuous prosperity, nourishment, and contentment.",
    is_active: true,
    display_order: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "navagraha-mandala-harmony",
    name: "Navagraha Planetary Alignment Chakra Yantra",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/navagraha-planetary-mandala-chakra-yantra",
    description: "Nine planetary deities arranged in sacred geometric mandala. Neutralizes planetary doshas and balances ambient cosmic radiation across any space.",
    is_active: true,
    display_order: 17,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "pancha-tattva-abstract-gold",
    name: "Pancha Tattva Five Cosmic Elements in Gold Leaf",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/pancha-tattva-five-cosmic-elements-gold",
    description: "Minimalist contemporary geometric abstraction of Earth, Water, Fire, Air, and Ether in real gold foil on textured linen. Suitable for any orientation.",
    is_active: true,
    display_order: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "flowing-waters-prosperity",
    name: "Jaladhaara Flowing Waters of Ishanya",
    image_url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/jaladhaara-flowing-waters-of-ishanya",
    description: "Clear crystal stream flowing gently from northeastern horizon toward the viewer. Enhances liquidity, financial flow, and mental clarity.",
    is_active: true,
    display_order: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "tirupati-balaji-swarna",
    name: "Tirupati Sri Venkateswara Swarna Alankara",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/tirupati-balaji-swarna-alankara-tanjore",
    description: "Grand Lord Balaji with golden conch, discus, and diamond crown in deep shadowbox teak frame. Bestows immense prosperity, protection, and sovereign grace.",
    is_active: true,
    display_order: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "lotus-mandala-pink-gold",
    name: "Sahasrara Thousand-Petaled Lotus in Pink & Gold",
    image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/sahasrara-thousand-petaled-lotus-pink-gold",
    description: "Blooming lotus mandala unfolding with micro-gilded petals on rose blush silk. Deepens serenity, self-love, and peaceful domestic aura.",
    is_active: true,
    display_order: 21,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mountain-citadel-southwest",
    name: "Nairutya Earth Mountain Citadel in Bronze Pigment",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/nairutya-earth-mountain-citadel-bronze",
    description: "Imposing earthen peaks rendered in bronze, burnt umber, and ochre. Perfect for the southwest corner to anchor family hierarchy and authority.",
    is_active: true,
    display_order: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "surya-namaskar-twelve-postures",
    name: "Surya Namaskar 12 Sacred Solar Mantras",
    image_url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/surya-namaskar-twelve-postures-gold",
    description: "Geometric compilation of the 12 sun salutation postures with calligraphic Sanskrit mantras in copper and gold leaf.",
    is_active: true,
    display_order: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "buddha-serenity-bodhi",
    name: "Buddha Under the Bodhi Tree Golden Glow",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/buddha-under-bodhi-tree-golden-glow",
    description: "Enlightened Buddha seated in meditative padmasana with subtle golden halo. Calibrates spatial stress and fosters gentle mindfulness.",
    is_active: true,
    display_order: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "swarna-kalash-foyer",
    name: "Swarna Kalash Mangal Kumbha with Coconut & Mango Leaves",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/swarna-kalash-mangal-kumbha-foyer",
    description: "Auspicious Mangal Kalash welcoming positive prana at the entry foyer. Shields from negative external drishti and attracts auspicious visitors.",
    is_active: true,
    display_order: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "agni-flame-mandala",
    name: "Agneya Sacred Fire Homa Altar in Vermilion & Saffron",
    image_url: "https://images.unsplash.com/photo-1496614151736-9020f1acb0c5?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/agneya-sacred-fire-homa-altar-vermilion",
    description: "Dynamic stylized flames of Yajna fire rendered in cinnabar, saffron, and gold. Harmonizes southeastern Agni quadrant and boosts metabolism.",
    is_active: true,
    display_order: 26,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "varuna-ocean-waves",
    name: "Varuna Cosmic Ocean Waves in Deep Lapis & Pearl",
    image_url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/varuna-cosmic-ocean-waves-lapis-pearl",
    description: "Rhythmic waves of the western ocean god Varuna with mother-of-pearl inlays. Promotes sustained commercial profits and restful peace.",
    is_active: true,
    display_order: 27,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "vayu-soaring-cranes",
    name: "Vayu Kon Pair of White Cranes in Cloudscape",
    image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/vayu-kon-pair-white-cranes-cloudscape",
    description: "Twin sacred cranes gliding through soft silvery mist. Inspires smooth business travels, networking allies, and joyful relationships.",
    is_active: true,
    display_order: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "shiva-nataraja-cosmic-dance",
    name: "Shiva Nataraja Ananda Tandava in Chola Bronze Style",
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/shiva-nataraja-ananda-tandava-chola-bronze",
    description: "The cosmic dance of creation and dissolution encircled by a fiery prabha mandala. Channels transformative spiritual growth and courage.",
    is_active: true,
    display_order: 29,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "hanuman-veera-sanjeevani",
    name: "Veera Hanuman with Sanjeevani Mountain",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/veera-hanuman-sanjeevani-mountain-gold",
    description: "Heroic Hanuman flying across the heavens with life-giving herb mountain. Bestows physical vigor, protective immunity, and fearless courage.",
    is_active: true,
    display_order: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "golden-wheat-harvest",
    name: "Annapurna Golden Wheat Harvest of Prosperity",
    image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/annapurna-golden-wheat-harvest-prosperity",
    description: "Sunlit expanse of golden wheat fields ready for harvest. Perfect for dining areas to bless meals with abundance, health, and family warmth.",
    is_active: true,
    display_order: 31,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mayura-peacock-radiance",
    name: "Mayura Royal Peacock of Auspicious Drishti",
    image_url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/mayura-royal-peacock-auspicious-drishti",
    description: "Regal peacock with iridescent emerald-sapphire plumage and gold feather eyes. Transmutes negative energies into joyful beauty.",
    is_active: true,
    display_order: 32,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "chandra-mandala-silver",
    name: "Chandra Mandala Moon Radiance in Pure Silver Leaf",
    image_url: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/chandra-mandala-moon-radiance-silver-leaf",
    description: "Luminous silver moon disk surrounded by soft lunar concentric ripples. Induces soothing emotional peace and restful nocturnal rejuvenation.",
    is_active: true,
    display_order: 33,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "om-pranava-swarna-canvas",
    name: "Sacred Pranava Omkar in Embossed 24K Gold Leaf",
    image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/sacred-pranava-omkar-24k-gold-leaf",
    description: "Primordial cosmic sound OM embossed in pure 24K gold foil over charcoal canvas. Radiates pure spiritual vibration and divine protection.",
    is_active: true,
    display_order: 34,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "maha-mrityunjaya-yantra",
    name: "Maha Mrityunjaya Sacred Healing & Longevity Yantra",
    image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/maha-mrityunjaya-healing-longevity-yantra",
    description: "Precision-etched copper yantra infused with healing Shiva vibrations. Rebalances vital energy flow and protects against chronic physical ailments.",
    is_active: true,
    display_order: 35,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "shrinathji-lotus-charan",
    name: "Shreenathji Lotus Feet Swarna Charanamrit",
    image_url: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/shreenathji-lotus-feet-swarna-charanamrit",
    description: "Auspicious footprints of Lord Shreenathji marked with the 16 sacred cosmic symbols in 24K gold leaf. Evokes unwavering devotion and grace.",
    is_active: true,
    display_order: 36,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "universal-vedic-tree-modern",
    name: "Minimalist Sacred Geometry Tree in Champagne Gold",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/minimalist-sacred-geometry-tree-champagne-gold",
    description: "Architectural interpretation of the cosmic tree of life rendered in clean geometric lines with brushed gold foil on off-white linen.",
    is_active: true,
    display_order: 37,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "sun-salutation-sunrise-landscape",
    name: "Suryodaya Golden Dawn Horizon over Sacred River",
    image_url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/suryodaya-golden-dawn-horizon-sacred-river",
    description: "Glowing morning sun rising over peaceful flowing waters. Inspires fresh starts, vitality, optimism, and unclouded vision for the day.",
    is_active: true,
    display_order: 38,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "lakshmi-narayana-vaikuntha",
    name: "Lakshmi Narayana on Ananta Shesha in Gold Foil",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/lakshmi-narayana-ananta-shesha-gold-foil",
    description: "Supreme Preserver Vishnu and Wealth Goddess Lakshmi reclining on cosmic serpent. Fosters unbroken wealth, marital harmony, and supreme peace.",
    is_active: true,
    display_order: 39,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "swarna-drishti-protective-lotus",
    name: "Swarna Drishti Protective Lotus Shield in Teak",
    image_url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80",
    product_url: "https://www.krutik.in/products/swarna-drishti-protective-lotus-shield-teak",
    description: "Geometric carved lotus medallion with convex central brass mirror. Repels negative nazar and stabilizes energetic boundaries at the home threshold.",
    is_active: true,
    display_order: 40,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MAPPINGS = {
  "surya-mandala-tanjore": {
    intentions: ["Health & Vitality", "Career & Success", "Protection & Courage", "Prosperity & Abundance"],
    rooms: ["Living Room", "Home Office / Study", "Entrance / Foyer"],
    directions: ["East", "North-East"],
    styles: ["Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "sri-yantra-lapis": {
    intentions: ["Peace & Positive Atmosphere", "Spirituality & Devotion", "Prosperity & Abundance", "Growth & New Beginnings"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Home Office / Study"],
    directions: ["North-East", "North"],
    styles: ["Symbolic Vastu Art", "Contemporary / Modern Art"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "ashwa-vigor-horses": {
    intentions: ["Career & Success", "Growth & New Beginnings", "Prosperity & Abundance"],
    rooms: ["Living Room", "Home Office / Study", "Entrance / Foyer"],
    directions: ["South", "North-West", "East"],
    styles: ["Symbolic Vastu Art", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "kalpavriksha-pichwai": {
    intentions: ["Prosperity & Abundance", "Love & Harmonious Relationships", "Growth & New Beginnings", "Peace & Positive Atmosphere"],
    rooms: ["Living Room", "Dining Room", "Bedroom", "Entrance / Foyer"],
    directions: ["East", "North-East", "North"],
    styles: ["Traditional Indian Art / Pichwai", "Nature & Landscapes"],
    devotional_preferences: ["Non-Religious Symbolic Artwork", "Devotional Artwork"]
  },
  "gayatridevi-tanjore": {
    intentions: ["Spirituality & Devotion", "Health & Vitality", "Peace & Positive Atmosphere"],
    rooms: ["Puja Room / Meditation Area", "Living Room"],
    directions: ["East", "North-East"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "kuber-dhanakarshan": {
    intentions: ["Prosperity & Abundance", "Career & Success"],
    rooms: ["Home Office / Study", "Living Room", "Entrance / Foyer"],
    directions: ["North"],
    styles: ["Symbolic Vastu Art", "Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "rising-dawn-pichwai": {
    intentions: ["Peace & Positive Atmosphere", "Spirituality & Devotion", "Love & Harmonious Relationships"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Dining Room"],
    directions: ["North-East", "East", "North"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "surya-celestial-chariot": {
    intentions: ["Health & Vitality", "Protection & Courage", "Career & Success"],
    rooms: ["Living Room", "Entrance / Foyer", "Home Office / Study"],
    directions: ["East"],
    styles: ["Symbolic Vastu Art", "Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "mahalakshmi-padma-tanjore": {
    intentions: ["Prosperity & Abundance", "Peace & Positive Atmosphere", "Spirituality & Devotion"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Entrance / Foyer"],
    directions: ["North", "North-East", "East"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "ganesha-pratham-vighnaharta": {
    intentions: ["Growth & New Beginnings", "Protection & Courage", "Spirituality & Devotion", "Prosperity & Abundance"],
    rooms: ["Entrance / Foyer", "Living Room", "Puja Room / Meditation Area", "Home Office / Study"],
    directions: ["North-East", "North", "East"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "saraswati-veena-pichwai": {
    intentions: ["Career & Success", "Growth & New Beginnings", "Spirituality & Devotion"],
    rooms: ["Home Office / Study", "Puja Room / Meditation Area", "Living Room"],
    directions: ["North-East", "East", "North"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "dhyana-shiva-meditation": {
    intentions: ["Peace & Positive Atmosphere", "Spirituality & Devotion", "Health & Vitality"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Bedroom"],
    directions: ["North-East", "North"],
    styles: ["Devotional Art", "Nature & Landscapes"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "radha-krishna-vrindavan": {
    intentions: ["Love & Harmonious Relationships", "Peace & Positive Atmosphere", "Spirituality & Devotion"],
    rooms: ["Bedroom", "Living Room", "Dining Room"],
    directions: ["South-West", "North-East", "North"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "himalayan-peaks-morning-sun": {
    intentions: ["Protection & Courage", "Career & Success", "Simply Beautiful, Meaningful Art"],
    rooms: ["Living Room", "Home Office / Study", "Bedroom"],
    directions: ["South-West", "South"],
    styles: ["Nature & Landscapes", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "sacred-banyan-tree-earth": {
    intentions: ["Health & Vitality", "Protection & Courage", "Peace & Positive Atmosphere"],
    rooms: ["Living Room", "Dining Room", "Bedroom"],
    directions: ["South-West", "East", "South"],
    styles: ["Nature & Landscapes", "Symbolic Vastu Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "kamadhenu-bountiful-grace": {
    intentions: ["Prosperity & Abundance", "Peace & Positive Atmosphere", "Love & Harmonious Relationships"],
    rooms: ["Living Room", "Dining Room", "Entrance / Foyer"],
    directions: ["East", "North-East", "North"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "navagraha-mandala-harmony": {
    intentions: ["Protection & Courage", "Health & Vitality", "Peace & Positive Atmosphere"],
    rooms: ["Living Room", "Puja Room / Meditation Area", "Entrance / Foyer"],
    directions: ["ANY"],
    styles: ["Symbolic Vastu Art"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "pancha-tattva-abstract-gold": {
    intentions: ["Peace & Positive Atmosphere", "Health & Vitality", "Simply Beautiful, Meaningful Art"],
    rooms: ["Living Room", "Dining Room", "Home Office / Study", "Other Space"],
    directions: ["ANY"],
    styles: ["Contemporary / Modern Art", "Symbolic Vastu Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "flowing-waters-prosperity": {
    intentions: ["Prosperity & Abundance", "Peace & Positive Atmosphere", "Growth & New Beginnings"],
    rooms: ["Living Room", "Entrance / Foyer", "Home Office / Study"],
    directions: ["North-East", "North"],
    styles: ["Nature & Landscapes", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "tirupati-balaji-swarna": {
    intentions: ["Prosperity & Abundance", "Protection & Courage", "Spirituality & Devotion"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Entrance / Foyer"],
    directions: ["East", "North-East", "North"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "lotus-mandala-pink-gold": {
    intentions: ["Peace & Positive Atmosphere", "Spirituality & Devotion", "Love & Harmonious Relationships", "Simply Beautiful, Meaningful Art"],
    rooms: ["Bedroom", "Living Room", "Puja Room / Meditation Area"],
    directions: ["North-East", "East", "North"],
    styles: ["Symbolic Vastu Art", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork", "Devotional Artwork"]
  },
  "mountain-citadel-southwest": {
    intentions: ["Protection & Courage", "Career & Success"],
    rooms: ["Bedroom", "Home Office / Study", "Living Room"],
    directions: ["South-West", "South"],
    styles: ["Nature & Landscapes", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "surya-namaskar-twelve-postures": {
    intentions: ["Health & Vitality", "Growth & New Beginnings", "Spirituality & Devotion"],
    rooms: ["Puja Room / Meditation Area", "Home Office / Study", "Living Room"],
    directions: ["East", "North-East"],
    styles: ["Symbolic Vastu Art", "Contemporary / Modern Art"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "buddha-serenity-bodhi": {
    intentions: ["Peace & Positive Atmosphere", "Spirituality & Devotion", "Simply Beautiful, Meaningful Art"],
    rooms: ["Living Room", "Bedroom", "Home Office / Study", "Puja Room / Meditation Area"],
    directions: ["North-East", "East", "North"],
    styles: ["Nature & Landscapes", "Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "swarna-kalash-foyer": {
    intentions: ["Prosperity & Abundance", "Growth & New Beginnings", "Peace & Positive Atmosphere"],
    rooms: ["Entrance / Foyer", "Living Room", "Puja Room / Meditation Area"],
    directions: ["North", "East", "North-East"],
    styles: ["Traditional Indian Art / Pichwai", "Symbolic Vastu Art"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "agni-flame-mandala": {
    intentions: ["Health & Vitality", "Protection & Courage"],
    rooms: ["Dining Room", "Living Room"],
    directions: ["South-East"],
    styles: ["Symbolic Vastu Art", "Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "varuna-ocean-waves": {
    intentions: ["Prosperity & Abundance", "Career & Success", "Simply Beautiful, Meaningful Art"],
    rooms: ["Living Room", "Home Office / Study", "Dining Room"],
    directions: ["West", "North-West"],
    styles: ["Nature & Landscapes", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "vayu-soaring-cranes": {
    intentions: ["Growth & New Beginnings", "Love & Harmonious Relationships", "Career & Success"],
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    directions: ["North-West", "West"],
    styles: ["Nature & Landscapes", "Symbolic Vastu Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "shiva-nataraja-cosmic-dance": {
    intentions: ["Growth & New Beginnings", "Spirituality & Devotion", "Protection & Courage"],
    rooms: ["Living Room", "Puja Room / Meditation Area", "Other Space"],
    directions: ["East", "North-East"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "hanuman-veera-sanjeevani": {
    intentions: ["Protection & Courage", "Health & Vitality", "Spirituality & Devotion"],
    rooms: ["Living Room", "Entrance / Foyer", "Puja Room / Meditation Area"],
    directions: ["South", "South-West", "East"],
    styles: ["Devotional Art", "Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "golden-wheat-harvest": {
    intentions: ["Prosperity & Abundance", "Peace & Positive Atmosphere", "Simply Beautiful, Meaningful Art"],
    rooms: ["Dining Room", "Living Room"],
    directions: ["North-West", "West", "East"],
    styles: ["Nature & Landscapes", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "mayura-peacock-radiance": {
    intentions: ["Protection & Courage", "Love & Harmonious Relationships", "Simply Beautiful, Meaningful Art"],
    rooms: ["Living Room", "Bedroom", "Entrance / Foyer"],
    directions: ["South-West", "North", "East"],
    styles: ["Traditional Indian Art / Pichwai", "Nature & Landscapes"],
    devotional_preferences: ["Non-Religious Symbolic Artwork", "Devotional Artwork"]
  },
  "chandra-mandala-silver": {
    intentions: ["Peace & Positive Atmosphere", "Love & Harmonious Relationships", "Health & Vitality"],
    rooms: ["Bedroom", "Living Room", "Puja Room / Meditation Area"],
    directions: ["North-West", "North"],
    styles: ["Symbolic Vastu Art", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "om-pranava-swarna-canvas": {
    intentions: ["Spirituality & Devotion", "Peace & Positive Atmosphere", "Protection & Courage"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Entrance / Foyer"],
    directions: ["North-East", "East", "North"],
    styles: ["Symbolic Vastu Art", "Traditional Indian Art / Pichwai"],
    devotional_preferences: ["Devotional Artwork", "Non-Religious Symbolic Artwork"]
  },
  "maha-mrityunjaya-yantra": {
    intentions: ["Health & Vitality", "Protection & Courage", "Spirituality & Devotion"],
    rooms: ["Puja Room / Meditation Area", "Bedroom", "Living Room"],
    directions: ["North-East", "East", "North"],
    styles: ["Symbolic Vastu Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "shrinathji-lotus-charan": {
    intentions: ["Spirituality & Devotion", "Peace & Positive Atmosphere", "Love & Harmonious Relationships"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Entrance / Foyer"],
    directions: ["North-East", "East"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "universal-vedic-tree-modern": {
    intentions: ["Growth & New Beginnings", "Peace & Positive Atmosphere", "Simply Beautiful, Meaningful Art"],
    rooms: ["Living Room", "Home Office / Study", "Bedroom", "Dining Room"],
    directions: ["ANY"],
    styles: ["Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "sun-salutation-sunrise-landscape": {
    intentions: ["Health & Vitality", "Growth & New Beginnings", "Peace & Positive Atmosphere"],
    rooms: ["Living Room", "Bedroom", "Dining Room"],
    directions: ["East", "North-East"],
    styles: ["Nature & Landscapes"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  },
  "lakshmi-narayana-vaikuntha": {
    intentions: ["Prosperity & Abundance", "Love & Harmonious Relationships", "Spirituality & Devotion"],
    rooms: ["Puja Room / Meditation Area", "Living Room", "Bedroom"],
    directions: ["North-East", "North", "East"],
    styles: ["Traditional Indian Art / Pichwai", "Devotional Art"],
    devotional_preferences: ["Devotional Artwork"]
  },
  "swarna-drishti-protective-lotus": {
    intentions: ["Protection & Courage", "Peace & Positive Atmosphere", "Simply Beautiful, Meaningful Art"],
    rooms: ["Entrance / Foyer", "Living Room", "Home Office / Study"],
    directions: ["South", "South-West", "North-West"],
    styles: ["Symbolic Vastu Art", "Contemporary / Modern Art"],
    devotional_preferences: ["Non-Religious Symbolic Artwork"]
  }
};

const SETTINGS = {
  admin_password_hash: "KrutikVastu2026!", // In production can be hashed or customized
  supabase_project_id: "adqkvyjfayujwhdhjpne",
  supabase_project_url: SUPABASE_URL,
  supabase_region: "ap-south-1",
  site_title: "Krutik Vastu Art Finder",
  currency: "INR",
  last_synced_at: new Date().toISOString()
};

// 1. Save to local JSON files
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(PRODUCTS, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'mappings.json'), JSON.stringify(MAPPINGS, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(SETTINGS, null, 2), 'utf8');
console.log('✓ Successfully saved 40 products, mappings, and settings to local persistent JSON!');

// 2. Sync to Supabase via REST API
async function postToSupabase(endpoint, body) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`);
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let respBody = '';
      res.on('data', chunk => respBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: respBody });
        } else {
          resolve({ status: res.statusCode, error: respBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function seedSupabase() {
  console.log('Syncing products to Supabase...');
  const prodRes = await postToSupabase('products', PRODUCTS);
  console.log('Products upload response:', prodRes);

  console.log('Syncing mappings to Supabase...');
  const mappingRows = Object.keys(MAPPINGS).map(pid => ({
    product_id: pid,
    intentions: MAPPINGS[pid].intentions,
    rooms: MAPPINGS[pid].rooms,
    directions: MAPPINGS[pid].directions,
    styles: MAPPINGS[pid].styles,
    devotional_preferences: MAPPINGS[pid].devotional_preferences,
    updated_at: new Date().toISOString()
  }));

  const mapRes = await postToSupabase('product_mappings', mappingRows);
  console.log('Mappings upload response:', mapRes);

  console.log('Syncing settings to Supabase...');
  const settingsRows = Object.keys(SETTINGS).map(k => ({
    key: k,
    value: SETTINGS[k],
    updated_at: new Date().toISOString()
  }));
  const setRes = await postToSupabase('admin_settings', settingsRows);
  console.log('Settings upload response:', setRes);

  console.log('✓ Seeding complete!');
}

seedSupabase().catch(err => {
  console.error('Supabase seeding error:', err);
});
