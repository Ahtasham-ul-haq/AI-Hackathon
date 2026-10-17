// Options supported by GNews (country / lang codes). "" region = worldwide.
export const REGIONS: [string, string][] = [
  ["", "Worldwide"], ["pk", "Pakistan"], ["in", "India"], ["us", "United States"], ["gb", "United Kingdom"],
  ["ca", "Canada"], ["au", "Australia"], ["ae", "United Arab Emirates"], ["sa", "Saudi Arabia"], ["de", "Germany"],
  ["fr", "France"], ["cn", "China"], ["jp", "Japan"], ["sg", "Singapore"], ["za", "South Africa"],
];

export const LANGUAGES: [string, string][] = [
  ["en", "English"], ["ar", "Arabic"], ["hi", "Hindi"], ["fr", "French"], ["de", "German"], ["es", "Spanish"],
  ["pt", "Portuguese"], ["zh", "Chinese"], ["ja", "Japanese"], ["ru", "Russian"], ["it", "Italian"], ["nl", "Dutch"],
];

export const LANGUAGE_NAME = Object.fromEntries(LANGUAGES) as Record<string, string>;
