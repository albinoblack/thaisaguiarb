const SITE_CONFIG = {
  whatsappNumber: "5500000000000",
  whatsappMessage: "Olá, Dra. Thaís Aguiar. Gostaria de agendar uma consulta.",
  instagramUrl: "https://www.instagram.com/",
  doctorPhotoUrl: "assets/img/dra-thais-consultorio.jpg",
  logoUrl: "",
  crmRqe: ""
};

const whatsappLink = document.querySelector(".js-whatsapp");
const instagramLink = document.querySelector(".js-instagram");
const doctorPhoto = document.querySelector(".js-doctor-photo");
const logo = document.querySelector(".js-logo");
const logoSlot = document.querySelector(".logo-slot");
const logoLink = document.querySelector(".js-logo-link");
const credentials = document.querySelector(".js-credentials");

function buildWhatsappUrl() {
  const phone = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  const message = encodeURIComponent(SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${phone}?text=${message}`;
}

function setImageWithFallback(image, url, onLoad) {
  if (!image || !url) return;

  image.addEventListener("load", () => {
    if (typeof onLoad === "function") onLoad();
  });

  image.addEventListener("error", () => {
    image.removeAttribute("src");
  });

  image.src = url;
}

function applyConfig() {
  if (whatsappLink) {
    whatsappLink.href = buildWhatsappUrl();
  }

  if (instagramLink) {
    instagramLink.href = SITE_CONFIG.instagramUrl;
  }

  if (logoLink) {
    logoLink.href = SITE_CONFIG.instagramUrl;
  }

  if (credentials && SITE_CONFIG.crmRqe.trim()) {
    credentials.textContent = SITE_CONFIG.crmRqe;
    credentials.hidden = false;
  }

  setImageWithFallback(doctorPhoto, SITE_CONFIG.doctorPhotoUrl);

  setImageWithFallback(logo, SITE_CONFIG.logoUrl, () => {
    logo.hidden = false;
    logoSlot.classList.add("has-logo");
  });
}

applyConfig();
