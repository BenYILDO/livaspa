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
