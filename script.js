const { doctor, contact, images } = window.SITE_CONFIG;
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const siteHeader = document.querySelector(".site-header");

function bookingUrl() {
  const digits = contact.whatsappNumber.replace(/\D/g, "");
  if (!digits) return contact.bookingFallbackUrl;
  const message = encodeURIComponent(
    `Olá, gostaria de agendar uma consulta com a ${doctor.name}.`,
  );
  return `https://wa.me/${digits}?text=${message}`;
}

document.querySelectorAll(".js-booking").forEach((link) => {
  link.href = bookingUrl();
});
document.querySelectorAll(".js-instagram").forEach((link) => {
  link.href = contact.instagramUrl;
});
document.querySelectorAll(".js-logo").forEach((image) => {
  if (images.logo && image.getAttribute("src") !== images.logo)
    image.src = images.logo;
});

function closeMenu() {
  primaryNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}
menuToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});
primaryNav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target))
    closeMenu();
});
window.addEventListener(
  "scroll",
  () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 16);
  },
  { passive: true },
);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  document.body.classList.add("motion-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((node) => observer.observe(node));
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: doctor.name,
  url: "https://thaisaguiarb.vercel.app/",
  image: new URL(images.heroPrimary, document.baseURI).href,
  medicalSpecialty: doctor.specialties,
  sameAs: [contact.instagramUrl],
};
if (contact.whatsappNumber.trim())
  structuredData.telephone = `+${contact.whatsappNumber.replace(/\D/g, "")}`;
if (contact.address.trim()) structuredData.address = contact.address;
const schema = document.createElement("script");
schema.type = "application/ld+json";
schema.textContent = JSON.stringify(structuredData);
document.head.appendChild(schema);
