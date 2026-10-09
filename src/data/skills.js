// The Stack section (Skills.jsx) renders these groups as a stack.json file, one line per
// group, with a detail card for each. `items` are the JSON values (kebab-case, like package
// names); `summary` and `points` are the hover details. WordPress is the primary group.
export const stackGroups = [
  {
    id: 'wordpress',
    title: 'WordPress',
    primary: true,
    summary: 'Hand-built themes, content models and plugins that survive updates.',
    items: ['custom-themes', 'acf-pro', 'custom-post-types', 'taxonomies', 'plugins', 'woocommerce', 'gravity-forms', 'wp-rest-api', 'wp-cli'],
    points: [
      'ACF Pro flexible content, field groups and options pages',
      'Custom post types, taxonomies and AJAX-filtered archives',
      'OOP plugins to WordPress Coding Standards, WooCommerce flows',
    ],
  },
  {
    id: 'frontend',
    title: 'Front end',
    summary: 'Responsive, accessible interfaces from a Figma file to the browser.',
    items: ['react', 'tailwind', 'javascript', 'jquery', 'html-css', 'bootstrap', 'figma'],
    points: [
      'React front ends styled with Tailwind CSS',
      'Vanilla JavaScript and jQuery interactions, AJAX',
      'Designs from Figma or Adobe XD to pixel-matched templates',
    ],
  },
  {
    id: 'backend',
    title: 'Back end',
    summary: 'The PHP, REST and database work behind every custom feature.',
    items: ['php', 'rest-apis', 'mysql', 'webhooks', 'stripe', 'square', 'smtp'],
    points: [
      'PHP and custom REST endpoints, signed and idempotent webhooks',
      'MySQL queries tuned for content-heavy sites',
      'Payments with Stripe, Square and PayPal; SMTP delivery via Brevo',
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    summary: 'Shipping, hosting and checking the work.',
    items: ['git', 'plesk', 'playwright', 'cloudflare', 'vite', 'elementor', 'divi'],
    points: [
      'Git workflows and staged deployments',
      'Plesk servers: PHP config, caching, migrations, malware recovery',
      'Playwright screenshots and checks; Cloudflare caching',
    ],
  },
];
