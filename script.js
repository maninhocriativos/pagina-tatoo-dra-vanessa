const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav a");
const menuToggle = document.querySelector(".menu-toggle");
const leadModal = document.querySelector("#lead-modal");
const leadForm = document.querySelector("#lead-form");
const leadFeedback = document.querySelector(".lead-form__feedback");
const leadCloseButtons = document.querySelectorAll("[data-lead-close]");
const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
const whatsappNumber = "5592999679178";
let lastLeadTrigger = null;
const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

revealItems.forEach((item) => {
  const delay = item.dataset.delay;
  if (delay) item.style.setProperty("--delay", `${delay}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const closeMenu = () => {
  header?.classList.remove("is-menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Abrir menu");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("is-menu-open");
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

const openLeadModal = (trigger) => {
  lastLeadTrigger = trigger;
  leadModal?.classList.add("is-open");
  leadModal?.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-modal-open");
  leadFeedback.textContent = "";
  window.setTimeout(() => leadForm?.elements.name?.focus(), 60);
};

const closeLeadModal = () => {
  leadModal?.classList.remove("is-open");
  leadModal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-modal-open");
  leadForm?.reset();
};

const saveLead = async (lead) => {
  const storedLeads = JSON.parse(localStorage.getItem("fisiolaser_leads_backup") || "[]");
  storedLeads.push({ ...lead, savedAt: new Date().toISOString() });
  localStorage.setItem("fisiolaser_leads_backup", JSON.stringify(storedLeads.slice(-30)));

  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    keepalive: true
  });

  if (!response.ok) {
    throw new Error("Lead não salvo no banco.");
  }

  return response.json();
};

const buildWhatsappUrl = ({ name, phone, procedure }) => {
  const message = [
    "Olá, Dra Vanessa.",
    `Meu nome é ${name}.`,
    `Meu telefone é ${phone}.`,
    `Quero atendimento para: ${procedure}.`,
    "Vim pela página de remoção a laser e gostaria de agendar uma avaliação."
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

whatsappLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openLeadModal(link);
  });
});

leadCloseButtons.forEach((button) => button.addEventListener("click", closeLeadModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && leadModal?.classList.contains("is-open")) {
    closeLeadModal();
  }
});

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(leadForm);
  const lead = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    procedure: String(formData.get("procedure") || "").trim(),
    source: lastLeadTrigger?.textContent?.replace(/\s+/g, " ").trim() || "WhatsApp",
    page: window.location.href
  };

  if (!lead.name || !lead.phone || !lead.procedure) {
    leadFeedback.textContent = "Preencha nome, telefone e procedimento para continuar.";
    return;
  }

  const submitButton = leadForm.querySelector('button[type="submit"]');
  const whatsappUrl = buildWhatsappUrl(lead);
  const whatsappWindow = window.open("about:blank", "_blank");

  if (submitButton) submitButton.disabled = true;
  leadFeedback.textContent = "Preparando atendimento...";

  try {
    await saveLead(lead);
  } catch (error) {
    console.warn(error);
  } finally {
    if (whatsappWindow) {
      whatsappWindow.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }

    if (submitButton) submitButton.disabled = false;
    closeLeadModal();
  }
});

const updatePageState = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;

  header?.classList.toggle("is-scrolled", window.scrollY > 18);
  if (progress) progress.style.width = `${Math.min(ratio * 100, 100)}%`;

  let activeId = "";
  sections.forEach((section) => {
    const box = section.getBoundingClientRect();
    if (box.top <= window.innerHeight * 0.42 && box.bottom > window.innerHeight * 0.42) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
};

document.addEventListener("scroll", updatePageState, { passive: true });
window.addEventListener("resize", updatePageState);
updatePageState();
