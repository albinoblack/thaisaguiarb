const { doctor, contact, images } = window.SITE_CONFIG;
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const siteHeader = document.querySelector(".site-header");

function updateHeader() {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 16);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

function bookingUrl() {
  const digits = contact.whatsappNumber.replace(/\D/g, "");
  if (!digits) return contact.bookingFallbackUrl;
  const message = encodeURIComponent(`Olá, gostaria de agendar uma consulta com a ${doctor.name}.`);
  return `https://wa.me/${digits}?text=${message}`;
}

document.querySelectorAll(".js-booking").forEach((link) => { link.href = bookingUrl(); });
document.querySelectorAll(".js-instagram").forEach((link) => { link.href = contact.instagramUrl; });
document.querySelectorAll(".js-logo").forEach((image) => {
  if (images.logo && image.getAttribute("src") !== images.logo) image.src = images.logo;
});
document.querySelectorAll(".js-registration").forEach((node) => {
  node.textContent = doctor.crmRqe;
  node.hidden = !doctor.crmRqe.trim();
});
document.querySelectorAll(".js-address").forEach((node) => {
  node.textContent = contact.address;
  node.hidden = !contact.address.trim();
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
primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

const carousel = document.querySelector(".hero-carousel");
const track = carousel.querySelector(".hero-track");
const slides = [...carousel.querySelectorAll(".hero-slide")];
const controls = carousel.querySelector(".carousel-controls");
const dots = [...carousel.querySelectorAll(".carousel-dot")];
const count = carousel.querySelector(".carousel-count");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
slides.forEach((slide, index) => {
  const source = images.heroSlides?.[index];
  if (source && slide.getAttribute("src") !== source) slide.src = source;
});
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);
[firstClone, lastClone].forEach((clone) => {
  clone.classList.remove("is-active");
  clone.classList.add("hero-clone");
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  clone.removeAttribute("fetchpriority");
});
track.prepend(lastClone);
track.append(firstClone);
track.style.transform = "translate3d(-100%, 0, 0)";
void track.offsetWidth;
track.classList.add("is-animated");
let activeSlide = 0;
let trackPosition = 1;
let isMoving = false;
let carouselTimer;
let touchStartX = null;
let carouselVisible = true;

function snapToActiveSlide() {
  isMoving = false;
  track.classList.remove("is-animated");
  trackPosition = activeSlide + 1;
  track.style.transform = `translate3d(-${trackPosition * 100}%, 0, 0)`;
  void track.offsetWidth;
  track.classList.add("is-animated");
}

function showSlide(index) {
  if (isMoving) return;
  const nextSlide = (index + slides.length) % slides.length;
  if (nextSlide === activeSlide) return;
  activeSlide = nextSlide;
  trackPosition = index === -1 ? 0 : index === slides.length ? slides.length + 1 : nextSlide + 1;
  if (reducedMotion.matches) snapToActiveSlide();
  else {
    isMoving = true;
    track.style.transform = `translate3d(-${trackPosition * 100}%, 0, 0)`;
  }
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === activeSlide;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
    dots[slideIndex].classList.toggle("is-active", active);
    dots[slideIndex].setAttribute("aria-pressed", String(active));
  });
  count.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
}

track.addEventListener("transitionend", (event) => {
  if (event.target !== track || event.propertyName !== "transform" || !isMoving) return;
  if (trackPosition === 0 || trackPosition === slides.length + 1) snapToActiveSlide();
  else isMoving = false;
});
track.addEventListener("transitioncancel", () => { if (isMoving) snapToActiveSlide(); });

function stopCarousel() {
  window.clearInterval(carouselTimer);
  carouselTimer = undefined;
}

function startCarousel() {
  stopCarousel();
  if (reducedMotion.matches || document.hidden || !carouselVisible || controls.matches(":hover") || carousel.contains(document.activeElement)) return;
  carouselTimer = window.setInterval(() => showSlide(activeSlide + 1), 6000);
}

carousel.classList.add("carousel-ready");
carousel.querySelector(".carousel-prev").addEventListener("click", () => { showSlide(activeSlide - 1); startCarousel(); });
carousel.querySelector(".carousel-next").addEventListener("click", () => { showSlide(activeSlide + 1); startCarousel(); });
dots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); startCarousel(); }));
controls.addEventListener("mouseenter", stopCarousel);
controls.addEventListener("mouseleave", startCarousel);
carousel.addEventListener("focusin", stopCarousel);
carousel.addEventListener("focusout", (event) => { if (!carousel.contains(event.relatedTarget)) startCarousel(); });
carousel.addEventListener("pointerdown", (event) => { if (event.pointerType === "touch") touchStartX = event.clientX; });
carousel.addEventListener("pointerup", (event) => {
  if (touchStartX === null) return;
  const distance = event.clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) > 45) { showSlide(activeSlide + (distance < 0 ? 1 : -1)); startCarousel(); }
});
carousel.addEventListener("pointercancel", () => { touchStartX = null; });
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isMoving) snapToActiveSlide();
  startCarousel();
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches && isMoving) snapToActiveSlide();
  startCarousel();
});
if ("IntersectionObserver" in window) {
  const carouselObserver = new IntersectionObserver(([entry]) => {
    carouselVisible = entry.isIntersecting;
    if (!carouselVisible && isMoving) snapToActiveSlide();
    startCarousel();
  }, { threshold: 0.1 });
  carouselObserver.observe(carousel);
}
startCarousel();

const surgeryGallery = document.querySelector(".surgery-gallery");
const surgeryTrack = surgeryGallery.querySelector(".surgery-track");
const surgerySlides = [...surgeryGallery.querySelectorAll(".surgery-slide")];
const surgeryControls = surgeryGallery.querySelector(".surgery-controls");
const surgeryCount = surgeryGallery.querySelector(".surgery-count");
let surgeryIndex = 0;
let surgeryPosition = 1;
let surgeryMoving = false;
let surgeryTimer;
let surgeryTouchX = null;
let surgeryVisible = !("IntersectionObserver" in window);

surgerySlides.forEach((slide, index) => {
  const source = images.surgeryGallery?.[index];
  if (source && slide.getAttribute("src") !== source) slide.src = source;
});
const surgeryFirstClone = surgerySlides[0].cloneNode(true);
const surgeryLastClone = surgerySlides[surgerySlides.length - 1].cloneNode(true);
[surgeryFirstClone, surgeryLastClone].forEach((clone) => {
  clone.classList.remove("is-active");
  clone.classList.add("surgery-clone");
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
});
surgeryTrack.prepend(surgeryLastClone);
surgeryTrack.append(surgeryFirstClone);
surgeryTrack.style.transform = "translate3d(-100%, 0, 0)";
void surgeryTrack.offsetWidth;
surgeryTrack.classList.add("is-animated");

function snapSurgerySlide() {
  surgeryMoving = false;
  surgeryTrack.classList.remove("is-animated");
  surgeryPosition = surgeryIndex + 1;
  surgeryTrack.style.transform = `translate3d(-${surgeryPosition * 100}%, 0, 0)`;
  void surgeryTrack.offsetWidth;
  surgeryTrack.classList.add("is-animated");
}

function showSurgerySlide(index) {
  if (surgeryMoving) return;
  surgeryIndex = (index + surgerySlides.length) % surgerySlides.length;
  surgeryPosition = index === -1 ? 0 : index === surgerySlides.length ? surgerySlides.length + 1 : surgeryIndex + 1;
  if (reducedMotion.matches) snapSurgerySlide();
  else {
    surgeryMoving = true;
    surgeryTrack.style.transform = `translate3d(-${surgeryPosition * 100}%, 0, 0)`;
  }
  surgerySlides.forEach((slide, slideIndex) => {
    const active = slideIndex === surgeryIndex;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });
  surgeryCount.textContent = `${String(surgeryIndex + 1).padStart(2, "0")} / ${String(surgerySlides.length).padStart(2, "0")}`;
}

surgeryTrack.addEventListener("transitionend", (event) => {
  if (event.target !== surgeryTrack || event.propertyName !== "transform" || !surgeryMoving) return;
  if (surgeryPosition === 0 || surgeryPosition === surgerySlides.length + 1) snapSurgerySlide();
  else surgeryMoving = false;
});
surgeryTrack.addEventListener("transitioncancel", () => { if (surgeryMoving) snapSurgerySlide(); });

function stopSurgeryCarousel() {
  window.clearInterval(surgeryTimer);
  surgeryTimer = undefined;
}
function startSurgeryCarousel() {
  stopSurgeryCarousel();
  if (reducedMotion.matches || document.hidden || !surgeryVisible || surgeryControls.matches(":hover") || surgeryGallery.contains(document.activeElement)) return;
  surgeryTimer = window.setInterval(() => showSurgerySlide(surgeryIndex + 1), 5500);
}

surgeryGallery.classList.add("carousel-ready");
surgeryGallery.querySelector(".surgery-prev").addEventListener("click", () => { showSurgerySlide(surgeryIndex - 1); startSurgeryCarousel(); });
surgeryGallery.querySelector(".surgery-next").addEventListener("click", () => { showSurgerySlide(surgeryIndex + 1); startSurgeryCarousel(); });
surgeryControls.addEventListener("mouseenter", stopSurgeryCarousel);
surgeryControls.addEventListener("mouseleave", startSurgeryCarousel);
surgeryGallery.addEventListener("focusin", stopSurgeryCarousel);
surgeryGallery.addEventListener("focusout", (event) => { if (!surgeryGallery.contains(event.relatedTarget)) startSurgeryCarousel(); });
surgeryGallery.addEventListener("pointerdown", (event) => { if (event.pointerType === "touch") surgeryTouchX = event.clientX; });
surgeryGallery.addEventListener("pointerup", (event) => {
  if (surgeryTouchX === null) return;
  const distance = event.clientX - surgeryTouchX;
  surgeryTouchX = null;
  if (Math.abs(distance) > 45) { showSurgerySlide(surgeryIndex + (distance < 0 ? 1 : -1)); startSurgeryCarousel(); }
});
surgeryGallery.addEventListener("pointercancel", () => { surgeryTouchX = null; });
document.addEventListener("visibilitychange", () => {
  if (document.hidden && surgeryMoving) snapSurgerySlide();
  startSurgeryCarousel();
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches && surgeryMoving) snapSurgerySlide();
  startSurgeryCarousel();
});
if ("IntersectionObserver" in window) {
  const surgeryObserver = new IntersectionObserver(([entry]) => {
    surgeryVisible = entry.isIntersecting;
    if (!surgeryVisible && surgeryMoving) snapSurgerySlide();
    startSurgeryCarousel();
  }, { threshold: 0.1 });
  surgeryObserver.observe(surgeryGallery);
}
startSurgeryCarousel();

const ambientSections = document.querySelectorAll(".hero-copy, .section, .location-section, .contact-section");
if ("IntersectionObserver" in window) {
  const ambientObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("ambient-active", entry.isIntersecting));
  }, { rootMargin: "100px 0px" });
  ambientSections.forEach((section) => ambientObserver.observe(section));
} else {
  ambientSections.forEach((section) => section.classList.add("ambient-active"));
}

if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
} else {
  document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: doctor.name,
  url: "https://thaisaguiarb.vercel.app/",
  image: new URL(images.heroSlides?.[0] || images.heroPrimary, document.baseURI).href,
  medicalSpecialty: doctor.specialties,
  sameAs: [contact.instagramUrl]
};
if (contact.whatsappNumber.trim()) structuredData.telephone = `+${contact.whatsappNumber.replace(/\D/g, "")}`;
if (contact.address.trim()) structuredData.address = contact.address;
const schema = document.createElement("script");
schema.type = "application/ld+json";
schema.textContent = JSON.stringify(structuredData);
document.head.appendChild(schema);
