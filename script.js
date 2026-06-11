const SITE_CONFIG = {
  whatsappNumber: "5500000000000",
  whatsappMessage: "Olá, Dra. Thaís Aguiar. Gostaria de agendar uma consulta.",
  instagramUrl: "https://www.instagram.com/",
  heroPhotoUrl: "assets/img/dra-thais-consultorio.jpg",
  logoUrl: "",
  crmRqe: ""
};

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".menu");
const whatsappLinks = document.querySelectorAll(".js-whatsapp");
const instagramLinks = document.querySelectorAll(".js-instagram");
const heroPhoto = document.querySelector(".js-hero-photo");
const credentialNodes = document.querySelectorAll(".js-credentials");

function buildWhatsappUrl() {
  const phone = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  const message = encodeURIComponent(SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${phone}?text=${message}`;
}

function applyConfig() {
  whatsappLinks.forEach((link) => {
    link.href = buildWhatsappUrl();
  });

  instagramLinks.forEach((link) => {
    link.href = SITE_CONFIG.instagramUrl;
  });

  if (heroPhoto && SITE_CONFIG.heroPhotoUrl) {
    heroPhoto.addEventListener("error", () => {
      heroPhoto.removeAttribute("src");
    });
    heroPhoto.src = SITE_CONFIG.heroPhotoUrl;
  }

  credentialNodes.forEach((node) => {
    node.textContent = SITE_CONFIG.crmRqe;
    node.hidden = !SITE_CONFIG.crmRqe.trim();
  });
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeader, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

applyConfig();
updateHeader();
