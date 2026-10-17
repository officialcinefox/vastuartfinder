// Populate tags for all 40 Krutik Vastu artworks
const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

const tagsMap = {
  "surya-mandala": ["24K GOLD FOIL", "99% Resonance", "Aged Teakwood"],
  "sri-yantra-lapis": ["Chased Brass", "Lapis Lazuli", "Vedic Yantra"],
  "ashwa-vigor-horses": ["Silver Leaf", "Vastu Momentum", "Indigo Canvas"],
  "kalpavriksha-pichwai": ["Pichwai Heritage", "Tree of Life", "Consecrated"],
  "gayatridevi-tanjore": ["24K Gold Foil", "Tanjore Guild", "Consecrated"],
  "kuber-dhanakarshan": ["Vedic Yantra", "Prosperity Grid", "Consecrated"],
  "rising-dawn-pichwai": ["Pichwai Heritage", "Lotus Pond", "Consecrated"],
  "surya-celestial-chariot": ["Embossed Copper", "East Axis", "Solar Prana"],
  "mahalakshmi-padma-tanjore": ["24K Gold Leaf", "Red Lotus", "Consecrated"],
  "ganesha-pratham-vighnaharta": ["Aged Teakwood", "24K Gold Foil", "Vighnaharta"],
  "saraswati-veena-pichwai": ["Pichwai Heritage", "Mayura & Veena", "Consecrated"],
  "dhyana-shiva-meditation": ["Himalayan Canvas", "Dhyana Serenity", "Ishanya Axis"],
  "radha-krishna-vrindavan": ["Kundan Stone", "24K Gold Leaf", "Raas Leela"],
  "himalayan-peaks-morning-sun": ["Golden Peaks", "South-West Anchor", "Consecrated"],
  "sacred-banyan-tree-earth": ["Golden Roots", "Earth Element", "Consecrated"],
  "kamadhenu-bountiful-grace": ["Bountiful Grace", "Celestial Cow", "Consecrated"],
  "navagraha-mandala-harmony": ["Navagraha Chakra", "Planetary Alignment", "Vedic Yantra"],
  "pancha-tattva-abstract-gold": ["Pancha Tattva", "24K Gold Leaf", "Vedic Abstract"],
  "flowing-waters-prosperity": ["Flowing Waters", "Ishanya Water", "Consecrated"],
  "tirupati-balaji-swarna": ["Swarna Alankara", "24K Gold Leaf", "Consecrated"],
  "lotus-mandala-pink-gold": ["Sahasrara Lotus", "Pink & Gold", "Consecrated"],
  "mountain-citadel-southwest": ["Nairutya Citadel", "Bronze Pigment", "Earth Element"],
  "surya-namaskar-twelve-postures": ["12 Solar Mantras", "Surya Namaskar", "East Wall"],
  "buddha-serenity-bodhi": ["Bodhi Serenity", "Golden Glow", "Consecrated"],
  "swarna-kalash-foyer": ["Mangal Kumbha", "Foyer Gateway", "Consecrated"],
  "agni-flame-mandala": ["Agneya Fire", "Homa Altar", "Consecrated"],
  "varuna-ocean-waves": ["Deep Lapis", "Cosmic Ocean", "West Axis"],
  "vayu-soaring-cranes": ["Vayu Kon", "Soaring Cranes", "Consecrated"],
  "shiva-nataraja-cosmic-dance": ["Chola Bronze Style", "Ananda Tandava", "Consecrated"],
  "hanuman-veera-sanjeevani": ["Veera Hanuman", "Sanjeevani Anchor", "Protection"],
  "golden-wheat-harvest": ["Annapurna Bounty", "Golden Harvest", "Prosperity"],
  "mayura-peacock-radiance": ["Royal Peacock", "Auspicious Drishti", "Consecrated"],
  "chandra-mandala-silver": ["Silver Leaf", "North-West Axis", "Lunar Harmony"],
  "om-pranava-swarna-canvas": ["24K Gold Foil", "Pranava Omkar", "Consecrated"],
  "maha-mrityunjaya-yantra": ["Healing Grid", "Vedic Yantra", "Consecrated"],
  "shrinathji-lotus-charan": ["Swarna Charanamrit", "Lotus Feet", "Consecrated"],
  "universal-vedic-tree-modern": ["Champagne Gold", "Sacred Geometry", "Modern Vastu"],
  "sun-salutation-sunrise-landscape": ["Golden Dawn", "Sacred River", "East Horizon"],
  "lakshmi-narayana-vaikuntha": ["Ananta Shesha", "24K Gold Foil", "Consecrated"],
  "swarna-drishti-protective-lotus": ["Drishti Shield", "Aged Teakwood", "Protection"]
};

products.forEach(p => {
  p.tags = tagsMap[p.id] || ["24K GOLD FOIL", "Consecrated"];
  p.updated_at = new Date().toISOString();
});

fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf8');
console.log(`Successfully updated ${products.length} products with tags in ${productsFile}!`);
