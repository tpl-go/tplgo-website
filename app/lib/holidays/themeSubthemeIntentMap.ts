export type SubthemeIntent = {
  keywords: string[];
  themes?: string[];
  tags?: string[];
};

export type ThemeSubthemeIntentMap = Record<
  string,
  Record<string, SubthemeIntent>
>;

function normalize(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value?: string) {
  return normalize(value).replace(/\s+/g, "");
}

export const THEME_SUBTHEME_INTENT_MAP: ThemeSubthemeIntentMap = {
  cultural: {
    "heritagehistoricalmonuments": {
      keywords: [
        "heritage",
        "historical",
        "monuments",
        "history",
        "old city",
        "old cities",
        "culture",
        "cultural",
      ],
      themes: ["CULTURAL TOURISM"],
      tags: ["heritage", "history", "monuments"],
    },
    "fortspalacesroyaltrails": {
      keywords: [
        "fort",
        "forts",
        "palace",
        "palaces",
        "royal",
        "kingdom",
        "rajasthan",
        "royal trail",
      ],
      themes: ["CULTURAL TOURISM", "INDIA STATE TOUR"],
      tags: ["fort", "palace", "royal"],
    },
    "unescoworldheritagesites": {
      keywords: ["unesco", "world heritage", "heritage site", "heritage"],
      themes: ["CULTURAL TOURISM"],
      tags: ["unesco", "heritage"],
    },
    "architectureoldcities": {
      keywords: [
        "architecture",
        "old city",
        "old cities",
        "historic city",
        "historic cities",
        "city heritage",
      ],
      themes: ["CULTURAL TOURISM", "CITY TOURISM"],
      tags: ["architecture", "old city"],
    },
    "festivalsfairstraditions": {
      keywords: [
        "festival",
        "festivals",
        "fair",
        "fairs",
        "tradition",
        "traditions",
        "cultural event",
      ],
      themes: ["CULTURAL TOURISM"],
      tags: ["festival", "tradition"],
    },
    "handicraftslocalart": {
      keywords: [
        "handicraft",
        "handicrafts",
        "craft",
        "crafts",
        "art",
        "local art",
        "handloom",
      ],
      themes: ["CULTURAL TOURISM", "RURAL TOURISM"],
      tags: ["craft", "art", "handloom"],
    },
    "culturalperformancesevents": {
      keywords: [
        "performance",
        "performances",
        "dance",
        "music",
        "folk",
        "event",
        "events",
        "cultural show",
      ],
      themes: ["CULTURAL TOURISM"],
      tags: ["music", "dance", "folk", "event"],
    },
  },

  spiritual: {
    "pilgrimagetours": {
      keywords: ["pilgrimage", "yatra", "religious", "sacred", "darshan"],
      themes: ["SPIRITUAL TOURISM"],
      tags: ["pilgrimage", "yatra"],
    },
    "templecircuits": {
      keywords: ["temple", "temples", "mandir", "circuit", "spiritual"],
      themes: ["SPIRITUAL TOURISM"],
      tags: ["temple", "mandir"],
    },
    "jyotirlingacircuits": {
      keywords: ["jyotirlinga", "shiv", "mahadev", "shiva"],
      themes: ["SPIRITUAL TOURISM"],
      tags: ["jyotirlinga", "shiv"],
    },
    "chardhamsacredroutes": {
      keywords: [
        "char dham",
        "chardham",
        "kedarnath",
        "badrinath",
        "gangotri",
        "yamunotri",
        "sacred route",
      ],
      themes: ["SPIRITUAL TOURISM"],
      tags: ["char dham", "kedarnath", "badrinath"],
    },
    "buddhistjaincircuits": {
      keywords: ["buddhist", "buddha", "jain", "monastery", "vihara"],
      themes: ["SPIRITUAL TOURISM"],
      tags: ["buddhist", "jain"],
    },
    "sikhsuficircuits": {
      keywords: ["sikh", "gurudwara", "sufi", "dargah", "shrine", "shrines"],
      themes: ["SPIRITUAL TOURISM"],
      tags: ["sikh", "sufi", "dargah"],
    },
    "spiritualretreats": {
      keywords: [
        "spiritual retreat",
        "retreat",
        "ashram",
        "meditation",
        "inner journey",
      ],
      themes: ["SPIRITUAL TOURISM", "WELLNESS TOURISM"],
      tags: ["retreat", "spiritual"],
    },
  },

  rural: {
    "villagestayexperiences": {
      keywords: ["village stay", "village", "rural stay", "homestay", "local life"],
      themes: ["RURAL TOURISM"],
      tags: ["village", "stay"],
    },
    "farmstayagritourism": {
      keywords: ["farm stay", "farm", "agri", "agri tourism", "organic life"],
      themes: ["RURAL TOURISM"],
      tags: ["farm", "agri"],
    },
    "tribaltourism": {
      keywords: ["tribal", "tribe", "indigenous", "ethnic village"],
      themes: ["RURAL TOURISM", "CULTURAL TOURISM"],
      tags: ["tribal"],
    },
    "localoccupationexperiences": {
      keywords: [
        "local occupation",
        "fishing",
        "farming",
        "artisan",
        "artisan life",
        "craft livelihood",
      ],
      themes: ["RURAL TOURISM"],
      tags: ["artisan", "local livelihood"],
    },
    "ruralcraftsskills": {
      keywords: ["rural craft", "craft", "skills", "handmade", "village craft"],
      themes: ["RURAL TOURISM", "CULTURAL TOURISM"],
      tags: ["craft", "skills"],
    },
    "ruralfoodlifestyle": {
      keywords: ["rural food", "local cuisine", "village food", "lifestyle", "slow travel"],
      themes: ["RURAL TOURISM", "LEISURE TOURISM"],
      tags: ["food", "lifestyle"],
    },
  },

  "wellness-medical": {
    "ayurvedaretreats": {
      keywords: ["ayurveda", "ayurvedic", "retreat", "healing", "wellness retreat"],
      themes: ["WELLNESS TOURISM"],
      tags: ["ayurveda", "retreat"],
    },
    "yogameditation": {
      keywords: ["yoga", "meditation", "wellness", "retreat", "mindfulness"],
      themes: ["WELLNESS TOURISM"],
      tags: ["yoga", "meditation"],
    },
    "naturehealingretreats": {
      keywords: ["nature healing", "healing", "retreat", "wellness", "detox"],
      themes: ["WELLNESS TOURISM"],
      tags: ["healing", "retreat"],
    },
    "detoxrejuvenationprograms": {
      keywords: ["detox", "rejuvenation", "wellness", "refresh", "healing"],
      themes: ["WELLNESS TOURISM"],
      tags: ["detox", "rejuvenation"],
    },
    "medicalcheckuptours": {
      keywords: ["medical checkup", "checkup", "health package", "diagnostic"],
      themes: ["MEDICAL TOURISM"],
      tags: ["checkup", "medical"],
    },
    "surgerytreatmentpackages": {
      keywords: ["surgery", "treatment", "medical", "recovery", "healthcare"],
      themes: ["MEDICAL TOURISM"],
      tags: ["surgery", "treatment"],
    },
  },

  "adventure-nature": {
    "himalayanadventure": {
      keywords: ["himalaya", "himalayan", "mountains", "altitude", "adventure"],
      themes: ["ADVENTURE TOURISM", "NATURE TOURISM"],
      tags: ["himalaya", "adventure"],
    },
    "trekkinghiking": {
      keywords: ["trekking", "trek", "hiking", "trail", "mountain walk"],
      themes: ["ADVENTURE TOURISM"],
      tags: ["trekking", "hiking"],
    },
    "mountaineering": {
      keywords: ["mountaineering", "summit", "climbing", "peak", "expedition"],
      themes: ["ADVENTURE TOURISM"],
      tags: ["mountaineering", "expedition"],
    },
    "desertsafari": {
      keywords: ["desert", "safari", "dunes", "camel", "sand"],
      themes: ["ADVENTURE TOURISM", "INDIA STATE TOUR"],
      tags: ["desert", "safari"],
    },
    "forestnaturetrails": {
      keywords: ["forest", "nature trail", "nature", "trail", "jungle walk"],
      themes: ["ADVENTURE TOURISM", "NATURE TOURISM"],
      tags: ["forest", "trail"],
    },
    "riverrafting": {
      keywords: ["river rafting", "rafting", "white water", "river adventure"],
      themes: ["ADVENTURE TOURISM"],
      tags: ["rafting"],
    },
    "paraglidingskysports": {
      keywords: ["paragliding", "sky sport", "air adventure", "gliding"],
      themes: ["ADVENTURE TOURISM"],
      tags: ["paragliding", "sky"],
    },
    "scubawatersports": {
      keywords: ["scuba", "water sport", "watersports", "snorkeling", "diving"],
      themes: ["ADVENTURE TOURISM", "LEISURE TOURISM"],
      tags: ["scuba", "diving"],
    },
    "cyclingroadtrips": {
      keywords: ["cycling", "road trip", "roadtrip", "bike journey", "ride"],
      themes: ["ADVENTURE TOURISM"],
      tags: ["cycling", "roadtrip"],
    },
  },

  "wildlife-eco": {
    "nationalparkssanctuaries": {
      keywords: ["national park", "sanctuary", "wildlife park", "reserve"],
      themes: ["WILDLIFE TOURISM"],
      tags: ["national park", "sanctuary"],
    },
    "junglesafari": {
      keywords: ["jungle safari", "safari", "wildlife", "tiger", "jeep safari"],
      themes: ["WILDLIFE TOURISM"],
      tags: ["safari", "wildlife"],
    },
    "birdwatching": {
      keywords: ["bird watching", "birding", "birds", "avian"],
      themes: ["WILDLIFE TOURISM", "NATURE TOURISM"],
      tags: ["bird", "birding"],
    },
    "ecovillages": {
      keywords: ["eco village", "eco", "sustainable stay", "green village"],
      themes: ["WILDLIFE TOURISM", "RURAL TOURISM"],
      tags: ["eco", "sustainable"],
    },
    "sustainabletravelprograms": {
      keywords: ["sustainable", "eco travel", "responsible travel", "green tourism"],
      themes: ["WILDLIFE TOURISM", "RURAL TOURISM"],
      tags: ["sustainable", "eco"],
    },
  },

  "romance-celebration": {
    "honeymoonpackages": {
      keywords: ["honeymoon", "romantic", "couple", "honeymoon package"],
      themes: ["HONEYMOON TOURISM", "LEISURE TOURISM"],
      tags: ["honeymoon", "romantic"],
    },
    "romanticgetaways": {
      keywords: ["romantic getaway", "romantic", "couple trip", "celebration"],
      themes: ["HONEYMOON TOURISM", "LEISURE TOURISM"],
      tags: ["romantic", "couple"],
    },
    "islandhoneymoon": {
      keywords: ["island honeymoon", "island", "beach romance", "honeymoon"],
      themes: ["HONEYMOON TOURISM", "LEISURE TOURISM", "PREMIUM TOUR"],
      tags: ["island", "honeymoon"],
    },
    "destinationweddings": {
      keywords: ["destination wedding", "wedding", "celebration", "couple event"],
      themes: ["HONEYMOON TOURISM", "PREMIUM TOUR"],
      tags: ["wedding", "celebration"],
    },
    "anniversarycelebrationtours": {
      keywords: ["anniversary", "celebration", "special occasion", "romantic"],
      themes: ["HONEYMOON TOURISM", "LEISURE TOURISM"],
      tags: ["anniversary", "celebration"],
    },
  },

  "educational-special-interest": {
    "schoolcollegetours": {
      keywords: ["school tour", "college tour", "student group", "education trip"],
      themes: ["EDUCATIONAL TOURISM"],
      tags: ["school", "college", "student"],
    },
    "studytours": {
      keywords: ["study tour", "academic", "educational", "learning journey"],
      themes: ["EDUCATIONAL TOURISM"],
      tags: ["study", "academic"],
    },
    "industrialvisits": {
      keywords: ["industrial visit", "factory visit", "industry", "educational"],
      themes: ["EDUCATIONAL TOURISM"],
      tags: ["industrial", "factory"],
    },
    "photographytours": {
      keywords: ["photography", "photo tour", "camera trip", "landscape shoot"],
      themes: ["EDUCATIONAL TOURISM", "CULTURAL TOURISM"],
      tags: ["photography"],
    },
    "culinarylearningtours": {
      keywords: ["culinary", "cooking", "food learning", "food experience"],
      themes: ["EDUCATIONAL TOURISM", "CULTURAL TOURISM"],
      tags: ["culinary", "food"],
    },
    "artcraftworkshops": {
      keywords: ["art workshop", "craft workshop", "creative learning", "art"],
      themes: ["EDUCATIONAL TOURISM", "CULTURAL TOURISM"],
      tags: ["art", "workshop"],
    },
    "scienceandspacetourism": {
      keywords: ["science", "space", "observatory", "innovation", "research"],
      themes: ["EDUCATIONAL TOURISM"],
      tags: ["science", "space"],
    },
  },

  "short-weekend": {
    "shortbreakholidays": {
      keywords: ["short break", "weekend", "quick getaway", "short holiday"],
      themes: ["LEISURE TOURISM", "CITY TOURISM", "INDIA STATE TOUR"],
      tags: ["weekend", "short trip"],
    },
    "citybreaktours": {
      keywords: ["city break", "city", "urban trip", "quick city escape"],
      themes: ["CITY TOURISM", "LEISURE TOURISM"],
      tags: ["city break", "urban"],
    },
    "weekendgetaways": {
      keywords: ["weekend getaway", "weekend", "quick escape", "short trip"],
      themes: ["LEISURE TOURISM", "NATURE TOURISM", "INDIA STATE TOUR"],
      tags: ["weekend", "getaway"],
    },
  },

  "media-production": {
    "filmshootinglocations": {
      keywords: ["film shooting", "shooting location", "cinematic", "film location"],
      themes: ["MEDIA PRODUCTION TOURISM", "PREMIUM TOUR"],
      tags: ["film", "shoot"],
    },
    "ottwebseriesshoots": {
      keywords: ["ott", "web series", "series shoot", "production"],
      themes: ["MEDIA PRODUCTION TOURISM"],
      tags: ["ott", "web series"],
    },
    "adcommercialshoots": {
      keywords: ["ad shoot", "commercial shoot", "brand shoot", "production"],
      themes: ["MEDIA PRODUCTION TOURISM"],
      tags: ["ad shoot", "commercial"],
    },
    "musicvideoshoots": {
      keywords: ["music video", "song shoot", "video production", "shoot"],
      themes: ["MEDIA PRODUCTION TOURISM"],
      tags: ["music video", "shoot"],
    },
    "preweddingfashionshoots": {
      keywords: ["pre wedding", "prewedding", "fashion shoot", "couple shoot"],
      themes: ["MEDIA PRODUCTION TOURISM", "PREMIUM TOUR"],
      tags: ["pre wedding", "fashion shoot"],
    },
  },
};

export function getSubthemeIntent(
  themeId?: string,
  subthemeLabel?: string
): SubthemeIntent | null {
  const themeKey = compact(themeId);
  const subthemeKey = compact(subthemeLabel);

  if (!themeKey || !subthemeKey) return null;

  const themeMap = THEME_SUBTHEME_INTENT_MAP[themeKey];
  if (!themeMap) return null;

  if (themeMap[subthemeKey]) {
    return themeMap[subthemeKey];
  }

  const matchedKey = Object.keys(themeMap).find((key) => {
    return (
      key === subthemeKey ||
      key.includes(subthemeKey) ||
      subthemeKey.includes(key)
    );
  });

  return matchedKey ? themeMap[matchedKey] : null;
}