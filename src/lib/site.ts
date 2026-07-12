export const site = {
  name: "Grooming Souls",
  tagline: "Mental Health & Welfare Foundation",
  phone: "+91 93898 72523",
  phoneRaw: "919389872523",
  email: "hello@groomingsouls.org",
  address: "India",
  whatsapp: "https://wa.me/919389872523",
  socials: {
    instagram: "https://www.instagram.com/grooming_souls",
    linkedin: "https://www.linkedin.com/company/grooming-souls/",
    youtube: "https://youtube.com/@groomingsouls",
  },
  nav: [
    { label: "Therapy", href: "/therapy" },
    { label: "Academy", href: "/academy" },
    { label: "Diploma", href: "/diploma" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const offers = [
  {
    title: "Therapy & Counselling",
    blurb:
      "Confidential 1-on-1 sessions with verified psychologists. Zero-cost first reach-out.",
    href: "/therapy",
    cta: "Book a free session",
    tone: "clinical" as const,
  },
  {
    title: "Psychometric Tests",
    blurb:
      "Standardized screenings — Big Five, Stress, EI, Aptitude, Sentence Completion. Free.",
    href: "/therapy#tests",
    cta: "Take a test",
    tone: "sage" as const,
  },
  {
    title: "Psych Academy",
    blurb:
      "Premium video lectures for 11th–12th, CUET-UG, CUET-PG and NET-JRF psychology.",
    href: "/academy",
    cta: "Browse courses",
    tone: "coral" as const,
  },
  {
    title: "Certified Diplomas",
    blurb:
      "Specialised masterclasses with manually couriered, physical certificates.",
    href: "/diploma",
    cta: "Explore diplomas",
    tone: "sun" as const,
  },
];

export const coreTeam = [
  {
    name: "Arhama Malik",
    role: "Founder & Director",
    image: "/team/founder.jpeg",
  },
  {
    name: "To be onboarded",
    role: "Managing Director",
    image: "",
  },
  {
    name: "To be onboarded",
    role: "Head of Therapy",
    image: "",
  },
];

export const advisory = [
  { name: "Dr. To be onboarded", role: "Clinical Psychologist · PhD" },
  { name: "Dr. To be onboarded", role: "Psychiatrist · MD" },
  { name: "Dr. To be onboarded", role: "Neuropsychologist · MPhil" },
  { name: "Dr. To be onboarded", role: "Counselling Psychologist · MA" },
  { name: "Dr. To be onboarded", role: "Child & Adolescent · PhD" },
  { name: "Dr. To be onboarded", role: "Organisational · PhD" },
];

export const trustBadges = [
  {
    title: "Section 8 NGO",
    sub: "Govt. of India · MCA",
  },
  {
    title: "12A & 80G",
    sub: "Tax-exempt compliance",
  },
  {
    title: "IP-Protected",
    sub: "Encrypted streaming",
  },
  {
    title: "Confidential Care",
    sub: "Clinically supervised",
  },
];

export const stats = [
  { value: "10k+", label: "Lives touched" },
  { value: "500+", label: "Students enrolled" },
  { value: "40+", label: "Verified therapists" },
  { value: "28", label: "States reached" },
];
