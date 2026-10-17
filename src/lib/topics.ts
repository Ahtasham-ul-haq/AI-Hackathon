// Source of truth for the onboarding topic list (mirrored in supabase/seed.sql).
export type Topic = {
  slug: string;
  name: string;
  subtopics: string[];
  related: string[];
  /** Search terms for GNews. */
  query: string;
};

export const TOPICS: Topic[] = [
  { slug: "world", name: "World News", subtopics: ["Middle East", "Europe", "Asia", "Africa", "Americas", "South Asia"], related: ["politics", "economy"], query: "world news" },
  { slug: "politics", name: "Politics", subtopics: ["Elections", "Policy", "Diplomacy", "Government"], related: ["world", "economy"], query: "politics" },
  { slug: "business", name: "Business", subtopics: ["Markets", "Startups", "Companies", "Banking"], related: ["economy", "technology"], query: "business" },
  { slug: "economy", name: "Economy", subtopics: ["Inflation", "Jobs", "Trade", "Central Banks"], related: ["business", "politics"], query: "economy" },
  { slug: "technology", name: "Technology", subtopics: ["Artificial Intelligence", "Smartphones", "Cybersecurity", "Social Media", "Gadgets"], related: ["science", "business"], query: "technology" },
  { slug: "science", name: "Science", subtopics: ["Space", "Physics", "Biology", "Research"], related: ["technology", "health", "environment"], query: "science" },
  { slug: "health", name: "Health", subtopics: ["Medicine", "Fitness", "Mental Health", "Public Health"], related: ["science"], query: "health" },
  { slug: "environment", name: "Climate & Environment", subtopics: ["Climate Change", "Energy", "Wildlife", "Pollution"], related: ["science", "world"], query: "climate environment" },
  { slug: "sports", name: "Sports", subtopics: ["Cricket", "Football", "Tennis", "Formula 1", "Basketball"], related: ["entertainment"], query: "sports" },
  { slug: "entertainment", name: "Entertainment", subtopics: ["Movies", "Music", "TV", "Celebrities", "Gaming"], related: ["culture", "sports"], query: "entertainment" },
  { slug: "culture", name: "Arts & Culture", subtopics: ["Books", "Art", "Food", "Travel"], related: ["entertainment"], query: "arts culture" },
  { slug: "education", name: "Education", subtopics: ["Universities", "Schools", "EdTech"], related: ["technology", "politics"], query: "education" },
];

export const TOPIC_BY_SLUG = Object.fromEntries(TOPICS.map((t) => [t.slug, t])) as Record<string, Topic>;

export const START_WEIGHT = 3.0;
