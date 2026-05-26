// Geography fact tables. Questions get generated from these via templates,
// so adding a state or country to a list grows the question pool automatically.
//
// US_STATES must contain all 50 states — quizzes at 4th/5th grade pull from
// the full list, so a silent deletion would create an unspottable coverage
// gap. The length assertion below catches that at module load.
//
// Lower grades intentionally use subsets (SIMPLE_STATES, POPULAR_STATES in
// geographyTemplates.js) — that's by design so a 1st grader isn't drilling
// Wyoming's capital. Don't "fix" that by widening the lower-grade pools.

export const US_STATES = [
  { name: 'Alabama', capital: 'Montgomery', region: 'South' },
  { name: 'Alaska', capital: 'Juneau', region: 'West' },
  { name: 'Arizona', capital: 'Phoenix', region: 'West' },
  { name: 'Arkansas', capital: 'Little Rock', region: 'South' },
  { name: 'California', capital: 'Sacramento', region: 'West' },
  { name: 'Colorado', capital: 'Denver', region: 'West' },
  { name: 'Connecticut', capital: 'Hartford', region: 'Northeast' },
  { name: 'Delaware', capital: 'Dover', region: 'Northeast' },
  { name: 'Florida', capital: 'Tallahassee', region: 'South' },
  { name: 'Georgia', capital: 'Atlanta', region: 'South' },
  { name: 'Hawaii', capital: 'Honolulu', region: 'West' },
  { name: 'Idaho', capital: 'Boise', region: 'West' },
  { name: 'Illinois', capital: 'Springfield', region: 'Midwest' },
  { name: 'Indiana', capital: 'Indianapolis', region: 'Midwest' },
  { name: 'Iowa', capital: 'Des Moines', region: 'Midwest' },
  { name: 'Kansas', capital: 'Topeka', region: 'Midwest' },
  { name: 'Kentucky', capital: 'Frankfort', region: 'South' },
  { name: 'Louisiana', capital: 'Baton Rouge', region: 'South' },
  { name: 'Maine', capital: 'Augusta', region: 'Northeast' },
  { name: 'Maryland', capital: 'Annapolis', region: 'Northeast' },
  { name: 'Massachusetts', capital: 'Boston', region: 'Northeast' },
  { name: 'Michigan', capital: 'Lansing', region: 'Midwest' },
  { name: 'Minnesota', capital: 'Saint Paul', region: 'Midwest' },
  { name: 'Mississippi', capital: 'Jackson', region: 'South' },
  { name: 'Missouri', capital: 'Jefferson City', region: 'Midwest' },
  { name: 'Montana', capital: 'Helena', region: 'West' },
  { name: 'Nebraska', capital: 'Lincoln', region: 'Midwest' },
  { name: 'Nevada', capital: 'Carson City', region: 'West' },
  { name: 'New Hampshire', capital: 'Concord', region: 'Northeast' },
  { name: 'New Jersey', capital: 'Trenton', region: 'Northeast' },
  { name: 'New Mexico', capital: 'Santa Fe', region: 'West' },
  { name: 'New York', capital: 'Albany', region: 'Northeast' },
  { name: 'North Carolina', capital: 'Raleigh', region: 'South' },
  { name: 'North Dakota', capital: 'Bismarck', region: 'Midwest' },
  { name: 'Ohio', capital: 'Columbus', region: 'Midwest' },
  { name: 'Oklahoma', capital: 'Oklahoma City', region: 'South' },
  { name: 'Oregon', capital: 'Salem', region: 'West' },
  { name: 'Pennsylvania', capital: 'Harrisburg', region: 'Northeast' },
  { name: 'Rhode Island', capital: 'Providence', region: 'Northeast' },
  { name: 'South Carolina', capital: 'Columbia', region: 'South' },
  { name: 'South Dakota', capital: 'Pierre', region: 'Midwest' },
  { name: 'Tennessee', capital: 'Nashville', region: 'South' },
  { name: 'Texas', capital: 'Austin', region: 'South' },
  { name: 'Utah', capital: 'Salt Lake City', region: 'West' },
  { name: 'Vermont', capital: 'Montpelier', region: 'Northeast' },
  { name: 'Virginia', capital: 'Richmond', region: 'South' },
  { name: 'Washington', capital: 'Olympia', region: 'West' },
  { name: 'West Virginia', capital: 'Charleston', region: 'South' },
  { name: 'Wisconsin', capital: 'Madison', region: 'Midwest' },
  { name: 'Wyoming', capital: 'Cheyenne', region: 'West' }
]

// Build-time guard so a future edit can't silently drop a state.
if (US_STATES.length !== 50) {
  throw new Error(
    `US_STATES must contain 50 states, found ${US_STATES.length}. ` +
    `Geography quizzes at 4th/5th grade depend on full coverage.`
  )
}

export const COUNTRIES = [
  { name: 'Canada', capital: 'Ottawa', continent: 'North America' },
  { name: 'Mexico', capital: 'Mexico City', continent: 'North America' },
  { name: 'United States', capital: 'Washington, D.C.', continent: 'North America' },
  { name: 'Brazil', capital: 'Brasília', continent: 'South America' },
  { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America' },
  { name: 'Peru', capital: 'Lima', continent: 'South America' },
  { name: 'Chile', capital: 'Santiago', continent: 'South America' },
  { name: 'France', capital: 'Paris', continent: 'Europe' },
  { name: 'Germany', capital: 'Berlin', continent: 'Europe' },
  { name: 'Italy', capital: 'Rome', continent: 'Europe' },
  { name: 'Spain', capital: 'Madrid', continent: 'Europe' },
  { name: 'United Kingdom', capital: 'London', continent: 'Europe' },
  { name: 'Greece', capital: 'Athens', continent: 'Europe' },
  { name: 'Russia', capital: 'Moscow', continent: 'Europe' },
  { name: 'China', capital: 'Beijing', continent: 'Asia' },
  { name: 'Japan', capital: 'Tokyo', continent: 'Asia' },
  { name: 'India', capital: 'New Delhi', continent: 'Asia' },
  { name: 'South Korea', capital: 'Seoul', continent: 'Asia' },
  { name: 'Thailand', capital: 'Bangkok', continent: 'Asia' },
  { name: 'Vietnam', capital: 'Hanoi', continent: 'Asia' },
  { name: 'Egypt', capital: 'Cairo', continent: 'Africa' },
  { name: 'Kenya', capital: 'Nairobi', continent: 'Africa' },
  { name: 'South Africa', capital: 'Pretoria', continent: 'Africa' },
  { name: 'Nigeria', capital: 'Abuja', continent: 'Africa' },
  { name: 'Morocco', capital: 'Rabat', continent: 'Africa' },
  { name: 'Australia', capital: 'Canberra', continent: 'Australia' },
  { name: 'New Zealand', capital: 'Wellington', continent: 'Australia' }
]

export const CONTINENTS = [
  'Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America'
]

// Oceans in descending size order
export const OCEANS = ['Pacific', 'Atlantic', 'Indian', 'Southern', 'Arctic']

export const COMPASS = {
  north: { right: 'East', left: 'West', behind: 'South' },
  south: { right: 'West', left: 'East', behind: 'North' },
  east: { right: 'South', left: 'North', behind: 'West' },
  west: { right: 'North', left: 'South', behind: 'East' }
}

// Famous landmarks for upper grades
export const LANDMARKS = [
  { name: 'Eiffel Tower', country: 'France', city: 'Paris' },
  { name: 'Statue of Liberty', country: 'United States', city: 'New York' },
  { name: 'Great Wall', country: 'China', city: 'Beijing area' },
  { name: 'Pyramids of Giza', country: 'Egypt', city: 'Cairo' },
  { name: 'Big Ben', country: 'United Kingdom', city: 'London' },
  { name: 'Sydney Opera House', country: 'Australia', city: 'Sydney' },
  { name: 'Machu Picchu', country: 'Peru', city: 'Cusco region' },
  { name: 'Taj Mahal', country: 'India', city: 'Agra' },
  { name: 'Colosseum', country: 'Italy', city: 'Rome' }
]
