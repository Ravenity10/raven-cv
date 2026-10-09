import { YEARS_EXPERIENCE } from './profile.js';

// From John_Raven_Delos_Reyes_Resume.pdf (public/cv/). Keep in sync when the CV changes.
// Rendered as a deployment history (Experience.jsx): one release per role, newest first.
// The first entry is the current role (HEAD). `start` / `end` are "YYYY-MM"; `end: null`
// means present. The release label and duration are worked out from these dates.
export const experienceCopy = {
  heading: 'git log',
  title: 'Deployment history.',
  intro: `${YEARS_EXPERIENCE} years of WordPress, from junior developer to team lead.`,
  head: 'HEAD',
  now: 'now',
  present: 'present',
  techLabel: 'Technologies',
  educationHeading: 'Education',
  cvLabel: 'Download full CV',
};

export const experience = [
  {
    company: 'TechZ Digital',
    role: 'Senior WordPress Developer',
    start: '2024-11',
    end: null,
    points: [
      'Lead the web development team: task allocation, code review and delivery.',
      'Custom themes and plugins with ACF and custom post types, to WordPress Coding Standards.',
      'WooCommerce, Gravity Forms and SMTP setups, Plesk server fixes and malware recovery.',
    ],
    tech: ['ACF Pro', 'Custom post types', 'WooCommerce', 'Gravity Forms', 'Plesk', 'Brevo SMTP'],
  },
  {
    company: 'TechZ Digital',
    role: 'Mid Web Developer',
    start: '2022-05',
    end: '2024-11',
    points: [
      'Custom WordPress themes with ACF and custom post types for a wide range of clients.',
      'Divi, Elementor and Cornerstone where they fit, cutting turnaround by about 20%.',
      'Responsive builds from design mockups in HTML, CSS, JavaScript, jQuery and AJAX.',
    ],
    tech: ['ACF', 'Divi', 'Elementor', 'Cornerstone', 'jQuery', 'AJAX'],
  },
  {
    company: 'IFormatLogic',
    role: 'Junior WordPress Developer',
    location: 'Iba, Zambales',
    start: '2020-10',
    end: '2022-05',
    points: [
      'Custom themes built from the ground up with Advanced Custom Fields.',
      'Mockups turned into working sites with AJAX and JavaScript interactions.',
      'Responsive HTML, CSS, JavaScript and jQuery builds and maintenance.',
    ],
    tech: ['ACF', 'Elementor', 'HTML & CSS', 'JavaScript', 'jQuery'],
  },
];

export const education = [
  {
    school: 'Polytechnic College of Botolan',
    degree: 'Bachelor of Science in Information Technology',
    period: '2016 - 2020',
  },
];
