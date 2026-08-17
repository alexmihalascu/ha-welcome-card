const VERSION = "1.0.0";

const CONDITII = {
  "clear-night": "Senin", cloudy: "Înnorat", fog: "Ceață", hail: "Grindină",
  lightning: "Descărcări", "lightning-rainy": "Furtună", partlycloudy: "Parțial înnorat",
  pouring: "Ploaie torențială", rainy: "Ploaie", snowy: "Ninsoare", "snowy-rainy": "Lapoviță",
  sunny: "Însorit", windy: "Vânt", "windy-variant": "Vânt", exceptional: "Excepțional",
};
const ICONS = {
  "clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", fog: "mdi:weather-fog",
  hail: "mdi:weather-hail", lightning: "mdi:weather-lightning", "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy", pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy",
  snowy: "mdi:weather-snowy", "snowy-rainy": "mdi:weather-snowy-rainy", sunny: "mdi:weather-sunny",
  windy: "mdi:weather-windy", "windy-variant": "mdi:weather-windy-variant", exceptional: "mdi:alert-circle-outline",
};
const ZILE = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
const LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

// Gradient static dupa ora zilei - fara canvas, fara particule, doar culoare de fundal.
function skyGradient(hour) {
  if (hour < 6) return ["#12162a", "#232a4a"];
  if (hour < 9) return ["#3a3e6e", "#f0a868"];
  if (hour < 18) return ["#4a90d9", "#a8d0f0"];
  if (hour < 21) return ["#48305f", "#f07a50"];
  return ["#12162a", "#232a4a"];
}

class WelcomeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._built = false;
  }

  setConfig(config) {
    this._config = { name: null, weather: null, entities: [], ...config };
    this._built = false;
  }

  getCardSize() { return 3; }

  connectedCallback() {
    this._tick = setInterval(() => this._paint(), 1000);
  }
  disconnectedCallback() {
    if (this._tick) clearInterval(this._tick);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    this._paint();
  }

  _salut() {
    const h = new Date().getHours();
    if (h < 5) return "Noapte bună";
    if (h < 12) return "Bună dimineața";
    if (h < 18) return "Zi bună";
    return "Bună seara";
  }

  _build() {
    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      ha-card{padding:20px;border-radius:22px;position:relative;overflow:hidden}
      .row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .salut{font-size:.95rem;font-weight:500;opacity:.92}
      .clock{font-size:2.6rem;font-weight:200;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;margin-top:2px}
      .data{font-size:.82rem;opacity:.7;margin-top:4px}
      .vreme{text-align:right;flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px}
      .vreme ha-icon{--mdc-icon-size:28px}
      .temp{font-size:1.6rem;font-weight:300;line-height:1}
      .cond{font-size:.76rem;opacity:.72}
      .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
      .chip{display:flex;align-items:center;gap:5px;padding:4px 10px 4px 7px;border-radius:999px;background:color-mix(in srgb,var(--secondary-text-color) 10%,transparent);font-size:.74rem;border:0;color:inherit;cursor:pointer;font-variant-numeric:tabular-nums}
      .chip:hover{background:color-mix(in srgb,var(--secondary-text-color) 18%,transparent)}
      .chip ha-icon{--mdc-icon-size:15px;opacity:.85}
      .hide{display:none!important}
    </style>
    <ha-card>
      <div class="row">
        <div>
          <div class="salut"></div>
          <div class="clock"></div>
          <div class="data"></div>
        </div>
        <div class="vreme">
          <ha-icon></ha-icon>
          <div class="temp"></div>
          <div class="cond"></div>
        </div>
      </div>
      <div class="chips"></div>
    </ha-card>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this._el = {
      card: $("ha-card"), salut: $(".salut"), clock: $(".clock"), data: $(".data"),
      icon: $(".vreme ha-icon"), temp: $(".temp"), cond: $(".cond"), chips: $(".chips"),
    };
    this._built = true;
  }

  _paint() {
    if (!this._el || !this._hass) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    this._el.clock.textContent = `${hh}:${mm}`;
    const nume = this._config.name || this._hass.user?.name || "";
    this._el.salut.innerHTML = this._salut() + (nume ? `, <strong>${nume}</strong>` : "");
    this._el.data.textContent = `${ZILE[d.getDay()]}, ${d.getDate()} ${LUNI[d.getMonth()]} ${d.getFullYear()}`;

    const [top, bot] = skyGradient(d.getHours() + d.getMinutes() / 60);
    const dark = d.getHours() < 7 || d.getHours() >= 20;
    this._el.card.style.background = `linear-gradient(155deg, ${top}, ${bot})`;
    this._el.card.style.color = dark ? "#eef1fa" : "#0f2438";

    const w = this._config.weather ? this._hass.states[this._config.weather] : null;
    if (w) {
      this._el.icon.setAttribute("icon", ICONS[w.state] || "mdi:weather-cloudy");
      const t = w.attributes.temperature;
      this._el.temp.textContent = t == null ? "" : `${Math.round(t)}°`;
      this._el.cond.textContent = CONDITII[w.state] || w.state;
      this._el.icon.classList.remove("hide");
    } else {
      this._el.icon.classList.add("hide");
      this._el.temp.textContent = "";
      this._el.cond.textContent = "";
    }

    const wrap = this._el.chips;
    wrap.innerHTML = "";
    for (const raw of this._config.entities || []) {
      const item = typeof raw === "string" ? { entity: raw } : raw;
      const s = this._hass.states[item.entity];
      if (!s) continue;
      const nume2 = item.name || s.attributes.friendly_name || item.entity;
      let valoare;
      try { valoare = this._hass.formatEntityState ? this._hass.formatEntityState(s) : null; } catch (e) { valoare = null; }
      if (!valoare) valoare = s.state + (s.attributes.unit_of_measurement || "");
      const b = document.createElement("button");
      b.className = "chip";
      b.innerHTML = `<ha-icon icon="${item.icon || s.attributes.icon || "mdi:information-outline"}"></ha-icon><span>${nume2} ${valoare}</span>`;
      b.addEventListener("click", () => this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: item.entity }, bubbles: true, composed: true })));
      wrap.appendChild(b);
    }
    wrap.classList.toggle("hide", !wrap.children.length);
  }
}

customElements.define("welcome-card", WelcomeCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "welcome-card", name: "Welcome Card", description: "Card simplu de întâmpinare: ceas, salut și vremea zilei, fără animații", preview: true });
console.info(`%c WELCOME-CARD %c v${VERSION} `, "color:#fff;background:#4a90d9;font-weight:700", "color:#4a90d9;background:#eaf2fb");
