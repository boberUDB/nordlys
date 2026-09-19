export type Project = {
  slug: string;
  index: string;
  name: string;
  summary: string;
  disciplines: string[];
  stack: string[];
  year: string;
  /** CSS color used for the card's accent glow and hover treatment */
  tint: string;
};

export const projects: Project[] = [
  {
    slug: "faraday",
    index: "01",
    name: "Faraday",
    summary:
      "Identidad y sitio de producto para unos audífonos de código abierto, con un configurador 3D en tiempo real de materiales y color.",
    disciplines: ["Identidad", "3D web", "E-commerce"],
    stack: ["Next.js", "React Three Fiber", "Shopify"],
    year: "2025",
    tint: "#5eead4",
  },
  {
    slug: "anthem",
    index: "02",
    name: "Anthem",
    summary:
      "Micrositio de campaña para el lanzamiento de una zapatilla de running, con una escena de partículas que responde al ritmo de carrera del usuario.",
    disciplines: ["Campaña", "Motion", "3D web"],
    stack: ["Three.js", "GSAP", "WebGL"],
    year: "2024",
    tint: "#a78bfa",
  },
  {
    slug: "quill",
    index: "03",
    name: "Quill",
    summary:
      "Sitio para una fundidora tipográfica independiente. Cada familia tipográfica tiene su propio banco de pruebas interactivo.",
    disciplines: ["Identidad", "Frontend"],
    stack: ["Next.js", "Variable fonts"],
    year: "2024",
    tint: "#f0abfc",
  },
  {
    slug: "verdant",
    index: "04",
    name: "Verdant",
    summary:
      "Rediseño de producto para una app de cuidado de plantas. Sistema de diseño completo y una app móvil compartiendo componentes.",
    disciplines: ["Producto", "Sistema de diseño"],
    stack: ["React Native", "Figma", "Storybook"],
    year: "2023",
    tint: "#7dd3fc",
  },
  {
    slug: "meridian",
    index: "05",
    name: "Meridian",
    summary:
      "Rediseño del panel de un producto fintech usado por analistas de riesgo. Reducción real y medida del tiempo por tarea.",
    disciplines: ["Producto", "Investigación"],
    stack: ["Next.js", "D3.js"],
    year: "2023",
    tint: "#5eead4",
  },
  {
    slug: "cinder",
    index: "06",
    name: "Cinder",
    summary:
      "Marca y tienda en línea para una tostadora de café de lote pequeño. Dirección de fotografía y empaque incluidos.",
    disciplines: ["Identidad", "E-commerce", "Empaque"],
    stack: ["Shopify", "Klaviyo"],
    year: "2022",
    tint: "#a78bfa",
  },
];
