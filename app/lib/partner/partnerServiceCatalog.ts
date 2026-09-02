export type PartnerServiceDomainId =
  | "stay-accommodation"
  | "travel-agencies-dmc-tour-operators"
  | "tours-packages-journeys"
  | "yatra-spiritual-cultural"
  | "transport-mobility"
  | "experiences-activities-adventure"
  | "medical-tourism-healthcare"
  | "wedding-events"
  | "film-shooting-ott"
  | "marketplace-local-commerce"
  | "professional-local-services"
  | "other-emerging";

export type PartnerServiceStatus = "active" | "inactive" | "archived";

export type PartnerServiceCapability =
  | "inventory"
  | "rates"
  | "availability"
  | "bookings"
  | "packages"
  | "departures"
  | "pricing"
  | "coordination"
  | "appointments"
  | "medical_service_catalogue"
  | "international_patient_workflow"
  | "portfolio"
  | "service_packages"
  | "products"
  | "orders"
  | "project_enquiries";

export type PartnerServiceCatalogueItem = {
  id: string;
  stableCode: string;
  name: string;
  shortDescription: string;
  domain: PartnerServiceDomainId;
  parentCode?: string;
  icon: string;
  displayOrder: number;
  status: PartnerServiceStatus;
  published: boolean;
  countries: string[];
  individualAllowed: boolean;
  organizationAllowed: boolean;
  applicationSelectable: boolean;
  serviceApprovalRequired: boolean;
  verificationProfileKey: string;
  capabilities: PartnerServiceCapability[];
  aliases: string[];
};

export type PartnerServiceDefinition = {
  id: string;
  label: string;
  keywords: string[];
};

export type PartnerServiceCategory = {
  id: PartnerServiceDomainId;
  title: string;
  description: string;
  services: PartnerServiceDefinition[];
};

export type RequestedPartnerServiceFoundation = {
  requestedName: string;
  description?: string;
  closestDomain?: PartnerServiceDomainId;
  closestCategoryCode?: string;
  requestingPartnerApplicationId?: string;
  status: "new" | "mapped_to_existing" | "draft_service_created" | "closed";
};

const domains: Record<PartnerServiceDomainId, { title: string; description: string; icon: string }> = {
  "stay-accommodation": { title: "Stay & Accommodation", description: "Accommodation properties and stay experiences.", icon: "bed" },
  "travel-agencies-dmc-tour-operators": { title: "Travel Agencies, DMC & Tour Operators", description: "Travel businesses, operators, consultants, and destination teams.", icon: "briefcase" },
  "tours-packages-journeys": { title: "Tours, Packages & Journeys", description: "Package-led travel, group departures, and planned journeys.", icon: "map" },
  "yatra-spiritual-cultural": { title: "Yatra, Spiritual & Cultural Travel", description: "Dedicated spiritual, pilgrimage, cultural, and heritage travel services.", icon: "landmark" },
  "transport-mobility": { title: "Transport & Mobility", description: "Local, intercity, rental, transfer, and mobility services.", icon: "car" },
  "experiences-activities-adventure": { title: "Experiences, Activities & Adventure", description: "Guided experiences, outdoor activities, and adventure operators.", icon: "sparkles" },
  "medical-tourism-healthcare": { title: "Medical Tourism & Healthcare", description: "Healthcare providers and medical travel support services.", icon: "heart-pulse" },
  "wedding-events": { title: "Wedding & Events", description: "Destination wedding and event service providers.", icon: "party-popper" },
  "film-shooting-ott": { title: "Film, Shooting & OTT", description: "Locations, permissions, and production support services.", icon: "clapperboard" },
  "marketplace-local-commerce": { title: "Marketplace & Local Commerce", description: "Local sellers, food, products, and travel essentials.", icon: "shopping-bag" },
  "professional-local-services": { title: "Professional & Local Services", description: "Professionals and local support services for travellers and events.", icon: "user-check" },
  "other-emerging": { title: "Other / Emerging", description: "Controlled requests for services not yet in the catalogue.", icon: "plus-circle" },
};

export const partnerServiceCatalogue: PartnerServiceCatalogueItem[] = [
  ...items("stay-accommodation", "accommodation_property", ["inventory", "rates", "availability", "bookings"], true, [
    ["hotel", "Hotel", "Hotel accommodation and room inventory."],
    ["resort", "Resort", "Resort accommodation and guest services."],
    ["homestay", "Homestay", "Hosted local stay accommodation."],
    ["guest-house", "Guest House", "Guest house accommodation."],
    ["hostel", "Hostel", "Budget/shared stay accommodation."],
    ["serviced-apartment", "Serviced Apartment", "Apartment-style managed stays."],
    ["villa", "Villa", "Private villa stays."],
    ["vacation-rental", "Vacation Rental", "Short-term vacation rental accommodation."],
    ["farm-stay", "Farm Stay", "Farm and rural stay experiences."],
    ["eco-stay", "Eco Stay", "Eco-conscious stay accommodation."],
    ["heritage-stay", "Heritage Stay", "Heritage property stay experience."],
    ["houseboat", "Houseboat", "Houseboat stay or overnight water accommodation."],
    ["camp-glamping", "Camp / Glamping", "Camping and glamping stays."],
    ["pilgrimage-dharamshala-style-stay", "Pilgrimage / Dharamshala-style Stay", "Pilgrimage-oriented stay where applicable."],
    ["other-accommodation", "Other Accommodation", "Accommodation service not listed above."],
  ]),
  ...items("travel-agencies-dmc-tour-operators", "travel_operator", ["packages", "departures", "pricing", "bookings"], true, [
    ["travel-agency", "Travel Agency", "Retail or B2B travel agency services."],
    ["destination-management-company", "Destination Management Company (DMC)", "Destination management and ground coordination."],
    ["inbound-tour-operator", "Inbound Tour Operator", "Inbound travel operations."],
    ["outbound-tour-operator", "Outbound Tour Operator", "Outbound travel operations."],
    ["domestic-tour-operator", "Domestic Tour Operator", "Domestic tour operations."],
    ["local-tour-operator", "Local Tour Operator", "Local tour operations."],
    ["group-tour-operator", "Group Tour Operator", "Group tour planning and execution."],
    ["corporate-mice-operator", "Corporate Travel / MICE Operator", "Corporate travel, meetings, incentives, conferences, and events."],
    ["travel-consultant", "Travel Consultant", "Travel consultation and planning services."],
    ["ground-handling-destination-services", "Ground Handling / Destination Services", "Ground support and destination coordination."],
    ["tour-coordinator", "Tour Coordinator", "Tour coordination services."],
    ["other-travel-business", "Other Travel Business", "Travel business not listed above."],
  ]),
  ...items("tours-packages-journeys", "package_operator", ["packages", "departures", "pricing", "bookings"], true, [
    ["holiday-packages", "Holiday Packages", "Holiday package products and operations."],
    ["customized-packages", "Customized Packages", "Customized travel package planning."],
    ["group-tours", "Group Tours", "Group tour products."],
    ["fixed-departure-tours", "Fixed Departure Tours", "Scheduled departures and group journeys."],
    ["honeymoon-packages", "Honeymoon Packages", "Honeymoon travel packages."],
    ["weekend-short-break-packages", "Weekend / Short Break Packages", "Short break and weekend travel packages."],
    ["family-packages", "Family Packages", "Family travel packages."],
    ["educational-tours", "Educational Tours", "Educational travel and learning tours."],
    ["student-tours", "Student Tours", "Student travel programs."],
    ["corporate-mice-packages", "Corporate / MICE Packages", "Corporate and MICE travel packages."],
    ["spiritual-pilgrimage-packages", "Spiritual / Pilgrimage Packages", "Spiritual and pilgrimage journeys."],
    ["cultural-heritage-packages", "Cultural / Heritage Packages", "Cultural and heritage travel packages."],
    ["rural-agro-tourism-packages", "Rural / Agro Tourism Packages", "Rural and agro tourism packages."],
    ["eco-nature-packages", "Eco / Nature Packages", "Eco and nature-led travel packages."],
    ["adventure-packages", "Adventure Packages", "Adventure travel packages."],
    ["medical-travel-packages", "Medical Travel Packages", "Medical travel package coordination."],
    ["wellness-packages", "Wellness Packages", "Wellness travel packages."],
    ["destination-wedding-packages", "Destination Wedding Packages", "Destination wedding package coordination."],
    ["senior-citizen-packages", "Senior Citizen Packages", "Senior-friendly travel packages."],
    ["other-packages-journeys", "Other Packages / Journeys", "Package or journey type not listed above."],
  ]),
  ...items("yatra-spiritual-cultural", "travel_yatra_operator", ["packages", "departures", "coordination", "bookings"], true, [
    ["yatra-operator-organizer", "Yatra Operator / Organizer", "Yatra planning and operation."],
    ["pilgrimage-tour-operator", "Pilgrimage Tour Operator", "Pilgrimage tour operations."],
    ["religious-tour-operator", "Religious Tour Operator", "Religious travel operations."],
    ["temple-circuit-operator", "Temple Circuit Operator", "Temple circuit planning and operation."],
    ["spiritual-retreat-operator", "Spiritual Retreat Operator", "Spiritual retreat travel services."],
    ["cultural-tour-operator", "Cultural Tour Operator", "Cultural travel operations."],
    ["heritage-circuit-operator", "Heritage Circuit Operator", "Heritage circuit services."],
    ["religious-group-travel-organizer", "Religious Group Travel Organizer", "Group religious travel organization."],
    ["community-group-yatra-organizer", "Community / Group Yatra Organizer", "Community yatra organization."],
    ["pilgrimage-facilitation", "Pilgrimage Facilitation", "Pilgrimage assistance and facilitation."],
    ["spiritual-guide-facilitator", "Spiritual Guide / Facilitator", "Spiritual guide and facilitation services."],
    ["religious-event-travel-organizer", "Religious Event Travel Organizer", "Religious event travel planning."],
    ["yatra-logistics-coordination", "Yatra Logistics / Coordination", "Yatra logistics and coordination."],
    ["other-spiritual-cultural-travel", "Other Spiritual / Cultural Travel Service", "Spiritual or cultural service not listed above."],
  ]),
  ...items("transport-mobility", "transport_operator", ["availability", "pricing", "bookings"], true, [
    ["cab-taxi-operator", "Cab / Taxi Operator", "Cab and taxi fleet/operator services."],
    ["individual-driver", "Individual Driver", "Individual driver services.", "driver_transport"],
    ["car-rental", "Car Rental", "Car rental services."],
    ["chauffeur-service", "Chauffeur Service", "Chauffeur-driven transport."],
    ["bus-operator", "Bus Operator", "Bus transport operations."],
    ["coach-operator", "Coach Operator", "Coach transport operations."],
    ["bike-scooter-rental", "Bike / Scooter Rental", "Bike or scooter rental."],
    ["self-drive-vehicle-provider", "Self-drive Vehicle Provider", "Self-drive vehicle rental."],
    ["airport-transfer", "Airport Transfer", "Airport transfer service."],
    ["intercity-transfer", "Intercity Transfer", "Intercity transport service."],
    ["local-transfer", "Local Transfer", "Local point-to-point transfer."],
    ["luxury-vehicle", "Luxury Vehicle", "Luxury vehicle service."],
    ["electric-mobility-provider", "Electric Mobility Provider", "Electric mobility service."],
    ["helicopter-service", "Helicopter Service", "Helicopter travel service."],
    ["shikara-local-water-transport", "Shikara / Local Water Transport", "Local water transport service."],
    ["boat-ferry-water-transport", "Boat / Ferry / Water Transport", "Boat, ferry, or other water transport."],
    ["tourist-vehicle-operator", "Tourist Vehicle Operator", "Tourist vehicle services."],
    ["other-transport", "Other Transport", "Transport service not listed above."],
  ]),
  ...items("experiences-activities-adventure", "activity_provider", ["availability", "pricing", "bookings"], true, [
    ["tour-guide", "Tour Guide", "Guided tour services."],
    ["local-guide", "Local Guide", "Local guide services."],
    ["tour-facilitator", "Tour Facilitator", "Tour facilitation services."],
    ["experience-host", "Experience Host", "Hosted local experiences."],
    ["activity-provider", "Activity Provider", "General activity services."],
    ["adventure-operator", "Adventure Operator", "Adventure activity operations."],
    ["adventure-instructor", "Adventure Instructor", "Adventure instruction services."],
    ["trekking", "Trekking", "Trekking experiences."],
    ["hiking", "Hiking", "Hiking experiences."],
    ["camping", "Camping", "Camping experiences."],
    ["rafting", "Rafting", "Rafting activities."],
    ["kayaking", "Kayaking", "Kayaking activities."],
    ["scuba-diving", "Scuba Diving", "Scuba diving activities."],
    ["snorkelling", "Snorkelling", "Snorkelling activities."],
    ["paragliding", "Paragliding", "Paragliding activities.", "adventure_air_individual"],
    ["hang-gliding", "Hang Gliding", "Hang gliding activities."],
    ["skiing", "Skiing", "Skiing activities."],
    ["snow-activities", "Snow Activities", "Snow-based activities."],
    ["mountaineering", "Mountaineering", "Mountaineering activities."],
    ["cycling", "Cycling", "Cycling tours or activities."],
    ["wildlife-safari", "Wildlife / Safari", "Wildlife and safari experiences."],
    ["water-sports", "Water Sports", "Water sports activities."],
    ["air-based-adventure", "Air-based Adventure", "Air-based adventure activities."],
    ["rock-climbing", "Rock Climbing", "Rock climbing activities."],
    ["zipline", "Zipline", "Zipline activities."],
    ["bungee-similar-activity", "Bungee / Similar Activity", "Bungee or similar adventure activity where applicable."],
    ["other-experience-adventure", "Other Experience / Adventure", "Experience or adventure service not listed above."],
  ]),
  ...items("medical-tourism-healthcare", "healthcare_facility", ["appointments", "availability", "medical_service_catalogue", "international_patient_workflow"], true, [
    ["hospital", "Hospital", "Hospital services."],
    ["multi-speciality-hospital", "Multi-speciality Hospital", "Multi-speciality hospital services."],
    ["clinic", "Clinic", "Clinic services."],
    ["doctor-medical-professional", "Doctor / Medical Professional", "Doctor or medical professional services.", "medical_professional"],
    ["specialist-doctor", "Specialist Doctor", "Specialist doctor services.", "medical_professional"],
    ["dental-clinic-dentist", "Dental Clinic / Dentist", "Dental clinic or dentist services.", "medical_professional"],
    ["diagnostic-centre", "Diagnostic Centre", "Diagnostic centre services.", "diagnostic_facility"],
    ["pathology-laboratory", "Pathology / Laboratory", "Pathology or laboratory services.", "diagnostic_facility"],
    ["imaging-radiology-centre", "Imaging / Radiology Centre", "Imaging or radiology centre services.", "diagnostic_facility"],
    ["pharmacy", "Pharmacy", "Pharmacy services.", "pharmacy_business"],
    ["ambulance-service", "Ambulance Service", "Ambulance services.", "medical_transport"],
    ["medical-tourism-facilitator", "Medical Tourism Facilitator", "Medical tourism facilitation."],
    ["patient-care-attendant-service", "Patient Care / Attendant Service", "Patient care and attendant services."],
    ["rehabilitation-centre", "Rehabilitation Centre", "Rehabilitation services."],
    ["physiotherapy", "Physiotherapy", "Physiotherapy services.", "medical_professional"],
    ["wellness-recovery-centre", "Wellness / Recovery Centre", "Wellness and recovery services."],
    ["ayurveda-ayush-provider", "Ayurveda / AYUSH Provider", "Ayurveda or AYUSH services where applicable."],
    ["nursing-home-care-provider", "Nursing / Home Care Provider", "Nursing and home care services."],
    ["medical-transport-coordinator", "Medical Transport Coordinator", "Medical transport coordination.", "medical_transport"],
    ["international-patient-coordinator", "International Patient Coordinator", "International patient coordination."],
    ["other-healthcare-service", "Other Healthcare Service", "Healthcare service not listed above."],
  ]),
  ...items("wedding-events", "event_service_provider", ["portfolio", "service_packages", "availability", "bookings"], true, [
    ["wedding-venue", "Wedding Venue", "Wedding venue services."],
    ["destination-wedding-venue", "Destination Wedding Venue", "Destination wedding venue services."],
    ["wedding-planner", "Wedding Planner", "Wedding planning services."],
    ["event-planner", "Event Planner", "Event planning services."],
    ["decorator", "Decorator", "Decoration services."],
    ["caterer", "Caterer", "Catering services.", "food_business"],
    ["photographer", "Photographer", "Photography services.", "creative_professional"],
    ["videographer", "Videographer", "Videography services.", "creative_professional"],
    ["makeup-artist", "Makeup Artist", "Makeup artist services.", "beauty_professional"],
    ["hair-styling", "Hair / Styling", "Hair and styling services.", "beauty_professional"],
    ["mehendi-artist", "Mehendi Artist", "Mehendi artist services.", "beauty_professional"],
    ["wedding-transport", "Wedding Transport", "Wedding transport coordination.", "transport_operator"],
    ["artist-performer", "Artist / Performer", "Artist or performer services."],
    ["dj-music", "DJ / Music", "DJ and music services."],
    ["sound-lighting", "Sound / Lighting", "Sound and lighting services."],
    ["tent-event-infrastructure", "Tent / Event Infrastructure", "Tent and event infrastructure services."],
    ["invitation-design-service", "Invitation / Design Service", "Invitation and design services.", "creative_professional"],
    ["wedding-coordination", "Wedding Coordination", "Wedding coordination services."],
    ["wedding-hospitality-guest-management", "Wedding Hospitality / Guest Management", "Guest management and hospitality coordination."],
    ["other-wedding-event-service", "Other Wedding / Event Service", "Wedding or event service not listed above."],
  ]),
  ...items("film-shooting-ott", "production_service_provider", ["project_enquiries", "availability", "service_packages"], true, [
    ["shooting-location", "Shooting Location", "Shooting location access."],
    ["location-owner", "Location Owner", "Location owner services."],
    ["location-manager", "Location Manager", "Location management services."],
    ["location-scout", "Location Scout", "Location scouting services."],
    ["permissions-facilitation", "Permissions / Facilitation", "Permissions and facilitation services."],
    ["production-support", "Production Support", "Production support services."],
    ["line-production", "Line Production", "Line production services."],
    ["production-house", "Production House", "Production house services."],
    ["casting-support", "Casting Support", "Casting support services."],
    ["equipment-rental", "Equipment Rental", "Equipment rental services."],
    ["camera-lighting-equipment", "Camera / Lighting Equipment", "Camera and lighting equipment services."],
    ["studio", "Studio", "Studio services."],
    ["sound-audio-service", "Sound / Audio Service", "Sound and audio services."],
    ["set-art-direction-support", "Set / Art Direction Support", "Set and art direction support."],
    ["accommodation-coordination", "Accommodation Coordination", "Accommodation coordination for productions."],
    ["transport-logistics", "Transport / Logistics", "Transport and logistics coordination.", "transport_operator"],
    ["catering-craft-service", "Catering / Craft Service", "Catering and craft service.", "food_business"],
    ["security-crowd-management", "Security / Crowd Management", "Security and crowd management services."],
    ["local-crew", "Local Crew", "Local crew support."],
    ["post-production-support", "Post-production Support", "Post-production support services."],
    ["drone-aerial-production-service", "Drone / Aerial Production Service", "Drone and aerial production where applicable."],
    ["other-film-ott-service", "Other Film / OTT Service", "Film or OTT service not listed above."],
  ]),
  ...items("marketplace-local-commerce", "marketplace_seller", ["products", "inventory", "orders"], true, [
    ["marketplace-seller", "Marketplace Seller", "Marketplace seller services."],
    ["local-product-seller", "Local Product Seller", "Local product seller."],
    ["artisan-handicraft-seller", "Artisan / Handicraft Seller", "Artisan or handicraft seller."],
    ["souvenir-seller", "Souvenir Seller", "Souvenir seller."],
    ["local-food-seller", "Local Food Seller", "Local food seller.", "food_business"],
    ["street-food-food-stall", "Street Food / Food Stall", "Street food or food stall.", "food_business"],
    ["restaurant", "Restaurant", "Restaurant services.", "food_business"],
    ["cafe", "Cafe", "Cafe services.", "food_business"],
    ["bakery", "Bakery", "Bakery services.", "food_business"],
    ["sweet-shop", "Sweet Shop", "Sweet shop.", "food_business"],
    ["local-specialty-store", "Local Specialty Store", "Local specialty store."],
    ["organic-farm-product-seller", "Organic / Farm Product Seller", "Organic or farm product seller."],
    ["regional-product-seller", "Regional Product Seller", "Regional product seller."],
    ["travel-essentials-seller", "Travel Essentials Seller", "Travel essentials seller."],
    ["rental-equipment-seller", "Rental Equipment Seller", "Rental equipment seller."],
    ["local-experience-product-seller", "Local Experience Product Seller", "Local experience product seller."],
    ["other-local-commerce", "Other Local Commerce", "Local commerce service not listed above."],
  ]),
  ...items("professional-local-services", "professional_service_provider", ["portfolio", "service_packages", "availability"], true, [
    ["professional-photographer", "Photographer", "Photography services.", "creative_professional", "photographer"],
    ["professional-videographer", "Videographer", "Videography services.", "creative_professional", "videographer"],
    ["interpreter-translator", "Interpreter / Translator", "Interpreter or translator services."],
    ["local-coordinator", "Local Coordinator", "Local coordination services."],
    ["travel-assistant", "Travel Assistant", "Travel assistant services."],
    ["personal-assistant-concierge", "Personal Assistant / Concierge", "Personal assistant and concierge services."],
    ["porter", "Porter", "Porter services."],
    ["tour-escort", "Tour Escort", "Tour escort services."],
    ["local-expert", "Local Expert", "Local expert services."],
    ["event-professional", "Event Professional", "Event professional services."],
    ["personal-guide", "Personal Guide", "Personal guide services."],
    ["local-facilitator", "Local Facilitator", "Local facilitator services."],
    ["other-professional-service", "Other Professional Service", "Professional service not listed above."],
  ]),
  ...items("other-emerging", "manual_review", ["project_enquiries"], true, [
    ["other-service-request", "Request another service", "Request a service not currently listed."],
  ]),
].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

export const partnerServiceCatalog: PartnerServiceCategory[] = Object.entries(domains).map(([id, domain]) => ({
  id: id as PartnerServiceDomainId,
  title: domain.title,
  description: domain.description,
  services: partnerServiceCatalogue
    .filter((serviceItem) => serviceItem.domain === id && serviceItem.applicationSelectable && serviceItem.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((serviceItem) => ({
      id: serviceItem.stableCode,
      label: serviceItem.name,
      keywords: [serviceItem.shortDescription, ...serviceItem.aliases, serviceItem.domain, serviceItem.verificationProfileKey],
    })),
})).filter((category) => category.services.length > 0);

export function getAllPartnerServices(catalog = partnerServiceCatalog): PartnerServiceDefinition[] {
  return catalog.flatMap((category) => category.services);
}

export function findPartnerService(serviceId: string): PartnerServiceDefinition | undefined {
  const fromMaster = partnerServiceCatalogue.find((serviceItem) => serviceItem.stableCode === serviceId || serviceItem.id === serviceId);
  if (fromMaster) return { id: fromMaster.stableCode, label: fromMaster.name, keywords: [fromMaster.shortDescription, ...fromMaster.aliases] };
  return getAllPartnerServices().find((serviceItem) => serviceItem.id === serviceId);
}

export function findPartnerCatalogueItem(serviceId: string): PartnerServiceCatalogueItem | undefined {
  return partnerServiceCatalogue.find((serviceItem) => serviceItem.stableCode === serviceId || serviceItem.id === serviceId);
}

export function partnerServiceEligibleForApplication(
  serviceItem: PartnerServiceCatalogueItem,
  countryCodeOrName: string,
  businessType: string
): boolean {
  const country = normalizeCountryCode(countryCodeOrName);
  const individual = isIndividualBusinessType(businessType);
  return Boolean(
    serviceItem.published &&
    serviceItem.status === "active" &&
    serviceItem.applicationSelectable &&
    serviceItem.countries.includes(country) &&
    (individual ? serviceItem.individualAllowed : serviceItem.organizationAllowed)
  );
}

export function filterEligiblePartnerServiceCatalog(
  catalog: PartnerServiceCategory[],
  countryCodeOrName: string,
  businessType: string
): PartnerServiceCategory[] {
  return catalog
    .map((category) => ({
      ...category,
      services: category.services.filter((service) => {
        const item = findPartnerCatalogueItem(service.id);
        return item ? partnerServiceEligibleForApplication(item, countryCodeOrName, businessType) : false;
      }),
    }))
    .filter((category) => category.services.length > 0);
}

export function filterPartnerServiceCatalog(query: string, catalog = partnerServiceCatalog): PartnerServiceCategory[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return catalog;

  return catalog
    .map((category) => {
      const searchableCategory = normalizeSearchText(`${category.title} ${category.description}`);
      const categoryMatches = searchableCategory.includes(normalizedQuery);
      const services = category.services.filter((serviceItem) => {
        const haystack = normalizeSearchText(`${serviceItem.label} ${serviceItem.keywords.join(" ")}`);
        return categoryMatches || haystack.includes(normalizedQuery);
      });
      return { ...category, services };
    })
    .filter((category) => category.services.length > 0);
}

export function getEligiblePartnerServiceDomainOptions(
  countryCodeOrName: string,
  businessType: string,
  options: { excludeDomainIds?: PartnerServiceDomainId[]; query?: string } = {}
): PartnerServiceCategory[] {
  const excluded = new Set(options.excludeDomainIds ?? []);
  const query = normalizeSearchText(options.query ?? "");
  return filterEligiblePartnerServiceCatalog(partnerServiceCatalog, countryCodeOrName, businessType)
    .filter((category) => !excluded.has(category.id))
    .filter((category) => {
      if (!query) return true;
      return normalizeSearchText(`${category.title} ${category.description}`).includes(query);
    });
}

export function getEligiblePartnerServicesForDomain(
  domainId: PartnerServiceDomainId,
  countryCodeOrName: string,
  businessType: string,
  query = ""
): PartnerServiceCatalogueItem[] {
  const normalizedQuery = normalizeSearchText(query);
  return partnerServiceCatalogue
    .filter((serviceItem) => serviceItem.domain === domainId)
    .filter((serviceItem) => partnerServiceEligibleForApplication(serviceItem, countryCodeOrName, businessType))
    .filter((serviceItem) => {
      if (!normalizedQuery) return true;
      return normalizeSearchText(`${serviceItem.name} ${serviceItem.shortDescription} ${serviceItem.aliases.join(" ")} ${domains[serviceItem.domain].title}`).includes(normalizedQuery);
    })
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
}

export function groupPartnerServiceCodesByDomain(serviceCodes: string[]): Array<{ domainId: PartnerServiceDomainId; title: string; services: PartnerServiceCatalogueItem[] }> {
  const groups = new Map<PartnerServiceDomainId, PartnerServiceCatalogueItem[]>();
  for (const code of [...new Set(serviceCodes)]) {
    const serviceItem = findPartnerCatalogueItem(code);
    if (!serviceItem) continue;
    groups.set(serviceItem.domain, [...(groups.get(serviceItem.domain) ?? []), serviceItem]);
  }
  return [...groups.entries()].map(([domainId, services]) => ({
    domainId,
    title: domains[domainId].title,
    services,
  }));
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function items(
  domain: PartnerServiceDomainId,
  verificationProfileKey: string,
  capabilities: PartnerServiceCapability[],
  serviceApprovalRequired: boolean,
  rows: Array<[string, string, string, string?, string?]>
): PartnerServiceCatalogueItem[] {
  const offset = Object.keys(domains).indexOf(domain) * 1000;
  return rows.map(([stableCode, name, shortDescription, verificationOverride, alias], index) => ({
    id: `svc_${stableCode}`,
    stableCode,
    name,
    shortDescription,
    domain,
    icon: domains[domain].icon,
    displayOrder: offset + index + 1,
    status: "active",
    published: true,
    countries: ["IN", "AE", "US", "CA", "GB", "AU", "SG", "TH", "NP", "BT"],
    individualAllowed: true,
    organizationAllowed: true,
    applicationSelectable: stableCode !== "other-service-request",
    serviceApprovalRequired,
    verificationProfileKey: verificationOverride ?? verificationProfileKey,
    capabilities,
    aliases: [alias, name, shortDescription, domain].filter(Boolean) as string[],
  }));
}

function normalizeCountryCode(countryCodeOrName: string): string {
  const normalized = countryCodeOrName.trim().toUpperCase();
  const aliases: Record<string, string> = {
    INDIA: "IN",
    "UNITED ARAB EMIRATES": "AE",
    UAE: "AE",
    "UNITED STATES": "US",
    USA: "US",
    CANADA: "CA",
    "UNITED KINGDOM": "GB",
    UK: "GB",
    AUSTRALIA: "AU",
    SINGAPORE: "SG",
    THAILAND: "TH",
    NEPAL: "NP",
    BHUTAN: "BT",
  };
  return aliases[normalized] ?? normalized;
}

function isIndividualBusinessType(businessType: string): boolean {
  const normalized = normalizeSearchText(businessType);
  return (
    normalized.includes("individual") ||
    normalized.includes("independent professional") ||
    normalized.includes("sole proprietorship") ||
    normalized.includes("proprietor")
  );
}
