import { flapAll } from "../lib/text-effects";

// the ID card tilts toward the pointer and a sheen slides across it
const card = document.getElementById("idcard");
if (card) {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    card.style.setProperty("--sh", `${(x * 120).toFixed(0)}%`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--sh", "-40%");
  });
}
flapAll(document);
