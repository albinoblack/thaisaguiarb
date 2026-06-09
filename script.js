const SITE_CONFIG = {
  whatsappNumber: "5500000000000",
  whatsappMessage:
    "Olá, Dra. Thaís Aguiar. Gostaria de agendar uma consulta.",
  instagramUrl: "https://www.instagram.com/",
  address: "Endereço a definir",
  photoUrl: "assets/img/dra-thais-hero.jpg"
};

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const whatsappLinks = document.querySelectorAll(".js-whatsapp");
const instagramLink = document.querySelector(".js-instagram");
const addressNode = document.querySelector(".js-address");
const doctorPhoto = document.querySelector(".doctor-photo");
const mosaicPhotos = document.querySelectorAll(".mosaic-item img");

function buildWhatsappUrl() {
  const phone = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  const message = encodeURIComponent(SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${phone}?text=${message}`;
}

function applySiteConfig() {
  const whatsappUrl = buildWhatsappUrl();

  whatsappLinks.forEach((link) => {
    link.href = whatsappUrl;
  });

  if (instagramLink) {
    instagramLink.href = SITE_CONFIG.instagramUrl;
  }

  if (addressNode) {
    addressNode.textContent = SITE_CONFIG.address;
  }

  if (doctorPhoto && SITE_CONFIG.photoUrl) {
    doctorPhoto.addEventListener("load", () => {
      doctorPhoto.classList.add("has-photo");
    });

    doctorPhoto.addEventListener("error", () => {
      doctorPhoto.removeAttribute("src");
      doctorPhoto.classList.remove("has-photo");
    });

    doctorPhoto.src = SITE_CONFIG.photoUrl;
  }
}

function updateHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  navMenu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeaderState, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

mosaicPhotos.forEach((photo) => {
  photo.addEventListener("error", () => {
    photo.removeAttribute("src");
  });
});

applySiteConfig();
updateHeaderState();
