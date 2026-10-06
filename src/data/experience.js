import { YEARS_EXPERIENCE } from './profile.js';

// From John_Raven_Delos_Reyes_Resume.pdf (public/cv/). Keep in sync when the CV changes.
// Roles are listed newest first; a company with several roles groups them together.
export const experienceCopy = {
  heading: 'Experience',
  title: `${YEARS_EXPERIENCE} years of WordPress, from junior developer to team lead.`,
  intro: 'Building custom themes and plugins for e-commerce, lead generation and content sites, and now leading a development and digital marketing team.',
  educationHeading: 'Education',
  cvLabel: 'Download full CV',
};

export const experience = [
  {
    company: 'TechZ Digital',
    period: 'May 2022 - Present',
    roles: [
      {
        title: 'Senior WordPress Developer',
        period: 'Nov 2024 - Present',
        points: [
          'Lead Team Raven, a web development and digital marketing team, handling task allocation, code review and delivery across concurrent client projects.',
          'Build custom WordPress themes and plugins with Advanced Custom Fields and custom post types, following WordPress Coding Standards and OOP principles for modular, maintainable code.',
          'Develop custom AJAX filtering and feed systems with optimized queries to keep content-heavy sites fast.',
          'Configure and troubleshoot WooCommerce stores, Gravity Forms workflows and SMTP email delivery (Brevo) across client sites.',
          'Diagnose and resolve server-level issues on Plesk-hosted environments, including PHP configuration, caching, deployments and migrations.',
          'Handle site security incidents: malware cleanup, recovery, hardening and migration to clean environments.',
        ],
      },
      {
        title: 'Mid Web Developer',
        period: 'May 2022 - Nov 2024',
        points: [
          'Designed and implemented custom WordPress themes with Advanced Custom Fields and custom post types to meet diverse client needs.',
          'Used page builders such as Divi, Elementor and Cornerstone to streamline development, improving project turnaround times by about 20%.',
          'Converted design mockups into fully functional websites using HTML, JavaScript and AJAX.',
          'Developed and maintained responsive websites with HTML, CSS, JavaScript and jQuery.',
        ],
      },
    ],
  },
  {
    company: 'IFormatLogic',
    location: 'Palanginan, Iba, Zambales, Philippines',
    period: 'Oct 2020 - May 2022',
    roles: [
      {
        title: 'Junior WordPress Developer',
        period: 'Oct 2020 - May 2022',
        points: [
          'Built custom WordPress themes from the ground up with Advanced Custom Fields, using builders such as Elementor where they sped up delivery.',
          'Translated mockups into working websites, adding AJAX and JavaScript interactions.',
          'Developed and maintained websites with HTML, CSS, JavaScript and jQuery, with a focus on responsive design.',
        ],
      },
    ],
  },
];

export const education = [
  {
    school: 'Polytechnic College of Botolan',
    degree: 'Bachelor of Science in Information Technology',
    period: '2016 - 2020',
  },
];
