const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (mobileToggle && mobileNav) {
  mobileToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
    mobileToggle.querySelector(".material-symbols-outlined").textContent = isOpen ? "close" : "menu";
  });
}

const currentPage = document.body.dataset.page;
document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll("[data-faq]").forEach((item) => {
  const button = item.querySelector("button");
  if (!button) return;

  button.addEventListener("click", () => {
    const isOpen = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const section = slider.closest(".section") || document;
  const track = slider.querySelector("[data-slider-track]");
  const dotsWrap = slider.querySelector("[data-slider-dots]");
  const prev = section.querySelector("[data-slider-prev]");
  const next = section.querySelector("[data-slider-next]");
  const slides = Array.from(track ? track.children : []);

  if (!track || !dotsWrap || !slides.length) return;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `${index + 1}. terapiye git`);
    dot.addEventListener("click", () => {
      slides[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const getCurrentIndex = () => {
    const firstSlide = slides[0];
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    return Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / (slideWidth + gap))));
  };

  const updateSlider = () => {
    const current = getCurrentIndex();
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === current);
      dot.setAttribute("aria-current", index === current ? "true" : "false");
    });
  };

  const moveBy = (direction) => {
    const current = getCurrentIndex();
    const target = Math.min(slides.length - 1, Math.max(0, current + direction));
    slides[target].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  if (prev) prev.addEventListener("click", () => moveBy(-1));
  if (next) next.addEventListener("click", () => moveBy(1));

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateSlider);
  });
  window.addEventListener("resize", updateSlider);
  updateSlider();
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name") || "";
    const phone = data.get("phone") || "";
    const service = data.get("service") || "";
    const date = data.get("date") || "";
    const message = data.get("message") || "";
    const body = [
      "Merhaba Liva Spa, randevu talebi oluşturmak istiyorum.",
      "",
      `Ad Soyad: ${name}`,
      `Telefon: ${phone}`,
      `İlgilendiğim hizmet: ${service}`,
      `Tercih ettiğim tarih: ${date || "Belirtmedim"}`,
      "",
      `Not: ${message || "Belirtmedim"}`
    ].join("\n");
    const whatsappUrl = `https://wa.me/905304457316?text=${encodeURIComponent(body)}`;
    window.open(whatsappUrl, "_blank", "noopener");

    const status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = "WhatsApp randevu mesajınız hazırlandı.";
    }
  });
});
