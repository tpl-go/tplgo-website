export type SubTheme = {
  key: string;   // slug
  name: string;  // display
};

export type Theme = {
  key: string;          // slug
  name: string;         // display
  description: string;  // optional (UI me use karenge)
  subThemes: SubTheme[];
};

export const THEMES: Theme[] = [
  {
    key: "cultural",
    name: "Cultural",
    description: "Heritage, art, festivals, and immersive culture experiences.",
    subThemes: [
      { key: "heritage-historical-monuments", name: "Heritage & Historical Monuments" },
      { key: "forts-palaces-royal-trails", name: "Forts, Palaces & Royal Trails" },
      { key: "unesco-world-heritage-sites", name: "UNESCO World Heritage Sites" },
      { key: "architecture-old-cities", name: "Architecture & Old Cities" },
      { key: "festivals-fairs-traditions", name: "Festivals, Fairs & Traditions" },
      { key: "folk-music-dance-performing-arts", name: "Folk Music, Dance & Performing Arts" },
      { key: "art-craft-handloom", name: "Art, Craft & Handloom" },
      { key: "museums-cultural-centers", name: "Museums & Cultural Centers" },
      { key: "culinary-heritage-food-trails", name: "Culinary Heritage & Food Trails" },
      { key: "village-tribal-culture", name: "Village & Tribal Culture" },
      { key: "cultural-walks-photography-tours", name: "Cultural Walks & Photography Tours" },
      { key: "living-culture-experiences", name: "Living Culture Experiences" },
      { key: "historical-reenactments", name: "Historical Re-enactments" },
    ],
  },

  {
    key: "spiritual",
    name: "Spiritual",
    description: "Pilgrimage circuits, sacred routes, and spiritual retreats.",
    subThemes: [
      { key: "pilgrimage-tours", name: "Pilgrimage Tours" },
      { key: "temple-circuits", name: "Temple Circuits" },
      { key: "jyotirlinga-circuits", name: "Jyotirlinga Circuits" },
      { key: "char-dham-sacred-routes", name: "Char Dham & Sacred Routes" },
      { key: "buddhist-jain-circuits", name: "Buddhist & Jain Circuits" },
      { key: "sufi-spiritual-shrines", name: "Sufi & Spiritual Shrines" },
      { key: "religious-festivals", name: "Religious Festivals" },
    ],
  },

  {
    key: "rural",
    name: "Rural",
    description: "Village stays, farm life, community tourism, and slow travel.",
    subThemes: [
      { key: "village-stay-experiences", name: "Village Stay Experiences" },
      { key: "farm-stay-agri-tourism", name: "Farm Stay & Agri Tourism" },
      { key: "tribal-tourism", name: "Tribal Tourism" },
      { key: "local-occupation-experiences", name: "Local Occupation Experiences" },
      { key: "rural-crafts-skills", name: "Rural Crafts & Skills" },
      { key: "community-based-tourism", name: "Community Based Tourism" },
      { key: "rural-festivals-weekly-haats", name: "Rural Festivals & Weekly Haats" },
      { key: "slow-travel-immersion-programs", name: "Slow Travel & Immersion Programs" },
      { key: "responsible-rural-tourism", name: "Responsible Rural Tourism" },
    ],
  },

  {
    key: "wellness-medical",
    name: "Wellness & Medical",
    description: "Ayurveda, yoga, healing retreats, and medical travel.",
    subThemes: [
      { key: "ayurveda-retreats", name: "Ayurveda Retreats" },
      { key: "yoga-meditation", name: "Yoga & Meditation" },
      { key: "nature-healing-retreats", name: "Nature Healing Retreats" },
      { key: "detox-rejuvenation-programs", name: "Detox & Rejuvenation Programs" },
      { key: "medical-checkup-tours", name: "Medical Check-up Tours" },
      { key: "surgery-recovery-packages", name: "Surgery & Recovery Packages" },
    ],
  },

  {
    key: "adventure-nature",
    name: "Adventure & Nature",
    description: "Trekking, safaris, mountains, forests, water sports & stays.",
    subThemes: [
      { key: "himalayan-adventure", name: "Himalayan Adventure" },
      { key: "trekking-hiking", name: "Trekking & Hiking" },
      { key: "mountaineering", name: "Mountaineering" },
      { key: "desert-safari", name: "Desert Safari" },
      { key: "forest-nature-trails", name: "Forest & Nature Trails" },
      { key: "water-sports-scuba", name: "Water Sports & Scuba" },
      { key: "camping-glamping", name: "Camping & Glamping" },
    ],
  },

  {
    key: "wildlife-eco",
    name: "Wildlife & Eco",
    description: "National parks, safaris, birding, eco villages & sustainability.",
    subThemes: [
      { key: "national-parks-sanctuaries", name: "National Parks & Sanctuaries" },
      { key: "jungle-safari", name: "Jungle Safari" },
      { key: "bird-watching", name: "Bird Watching" },
      { key: "eco-villages", name: "Eco Villages" },
      { key: "sustainable-travel-programs", name: "Sustainable Travel Programs" },
    ],
  },

  {
    key: "romance-celebration",
    name: "Romance & Celebration",
    description: "Honeymoon, romantic escapes, weddings and celebrations.",
    subThemes: [
      { key: "honeymoon-packages", name: "Honeymoon Packages" },
      { key: "romantic-getaways", name: "Romantic Getaways" },
      { key: "island-honeymoon", name: "Island Honeymoon" },
      { key: "destination-weddings", name: "Destination Weddings" },
      { key: "anniversary-celebration-tours", name: "Anniversary & Celebration Tours" },
    ],
  },

  {
    key: "educational-special-interest",
    name: "Educational & Special Interest",
    description: "Study tours, industrial visits and learning experiences.",
    subThemes: [
      { key: "school-college-tours", name: "School & College Tours" },
      { key: "study-tours", name: "Study Tours" },
      { key: "industrial-visits", name: "Industrial Visits" },
      { key: "photography-tours", name: "Photography Tours" },
      { key: "culinary-learning-tours", name: "Culinary Learning Tours" },
    ],
  },

  {
    key: "short-weekend",
    name: "Short & Weekend",
    description: "Quick breaks, weekend escapes and city breaks.",
    subThemes: [
      { key: "weekend-getaways", name: "Weekend Getaways" },
      { key: "short-break-holidays", name: "Short Break Holidays" },
      { key: "city-break-tours", name: "City Break Tours" },
    ],
  },

  {
    key: "media-production",
    name: "Media & Production",
    description: "Shoots, filming locations and creative production travel.",
    subThemes: [
      { key: "film-shooting-locations", name: "Film Shooting Locations" },
      { key: "ott-web-series-shoots", name: "OTT & Web Series Shoots" },
      { key: "ad-commercial-shoots", name: "Ad & Commercial Shoots" },
      { key: "music-video-shoots", name: "Music Video Shoots" },
      { key: "prewedding-fashion-shoots", name: "Pre-Wedding & Fashion Shoots" },
    ],
  },
];