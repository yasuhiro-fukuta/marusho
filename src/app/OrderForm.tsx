"use client";

import { useMemo, useState } from "react";
import styles from "./marusho.module.css";

/** マルショーのWhatsApp番号(+81 80-8913-5569) */
const MARUSHO_WA = "818089135569";

type Category = "dinner" | "drinks";

type Item = {
  id: string;
  category: Category;
  en: string;
  ja: string;
  note?: string;
  price: number;
};

/** メニュー(2026-09 のマルショー配達メニュー画像より) */
const ITEMS: Item[] = [
  { id: "katsudon", category: "dinner", en: "Katsudon rice bowl", ja: "カツ丼", note: "Rice topped with crispy pork cutlet, egg and onion", price: 2000 },
  { id: "katsucurry", category: "dinner", en: "Katsu curry", ja: "カレーカツ", note: "Pork cutlet curry", price: 2000 },
  { id: "karaage", category: "dinner", en: "Fried chicken (karaage)", ja: "唐揚げ", price: 2000 },
  { id: "misokatsu", category: "dinner", en: "Miso katsu (pork)", ja: "味噌カツ", note: "Pork cutlet with rich miso sauce", price: 2000 },
  { id: "sushi", category: "dinner", en: "Hand-rolled sushi set", ja: "手巻き寿司", note: "Sashimi, rice & seaweed — made by a fish shop", price: 3500 },
  { id: "somen", category: "dinner", en: "Somen & tempura", ja: "ソーメン、てんぷら", note: "Vegetarian / vegan option", price: 2500 },
  { id: "udon", category: "dinner", en: "Udon & tempura", ja: "うどん、てんぷら", note: "Vegetarian / vegan option", price: 2500 },
  { id: "soba", category: "dinner", en: "Soba & tempura", ja: "そば、てんぷら", note: "Vegetarian / vegan option", price: 2500 },
  { id: "kids", category: "dinner", en: "Children's set", ja: "お子様セット", price: 1500 },
  { id: "drinkset", category: "dinner", en: "Drink set", ja: "飲みセット", note: "Fried chicken, Kirin beer x2 & potato fries", price: 2000 },
  { id: "beer", category: "drinks", en: "Kirin beer", ja: "キリンビール", price: 350 },
  { id: "orange", category: "drinks", en: "Orange juice", ja: "オレンジジュース", price: 350 },
  { id: "cola", category: "drinks", en: "Coca-Cola", ja: "コカ・コーラ", price: 350 },
  { id: "ginger", category: "drinks", en: "Ginger ale", ja: "ジンジャーエール", price: 350 },
  { id: "winered", category: "drinks", en: "Wine, red (bottle)", ja: "赤ワイン", price: 3000 },
  { id: "winewhite", category: "drinks", en: "Wine, white (bottle)", ja: "白ワイン", price: 3000 },
];

const SECTIONS: { key: Category; en: string; ja: string }[] = [
  { key: "dinner", en: "Dinner", ja: "夕食" },
  { key: "drinks", en: "Drinks", ja: "飲み物" },
];

/** 配達先(宿) */
const PLACES: { ja?: string; en: string }[] = [
  { ja: "柏屋1F", en: "Kashiwaya Inn ground floor" },
  { ja: "柏屋2F", en: "Kashiwaya Inn upstairs" },
  { ja: "柏屋一棟貸し", en: "Kashiwaya Inn whole house" },
  { ja: "マウンテン", en: "MOUNTAinn Nagiso" },
  { ja: "灯", en: "Akari" },
  { ja: "雨中山道", en: "Ame Nakasendo" },
  { en: "Mugi house - Mountain escape" },
  { en: "Yama Inn upstairs - Bridge view" },
  { en: "Yama Inn ground floor - multi bedroom" },
  { ja: "お宿 勝", en: "Oyado Katsu" },
  { en: "DARUMA Premium inn" },
  { en: "Tsumugi Tei" },
];

const DINNER_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

const yen = (n: number) => "¥" + n.toLocaleString("en-US");

/** "2026-10-03" → { en: "Sat 3 Oct 2026", ja: "10月3日(土)" } */
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const month = dt.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
  const wd = dt.getUTCDay();
  return {
    en: `${WEEKDAY_EN[wd]} ${dt.getUTCDate()} ${month} ${dt.getUTCFullYear()}`,
    ja: `${dt.getUTCMonth() + 1}月${dt.getUTCDate()}日(${WEEKDAY_JA[wd]})`,
  };
}

/** 日本時間の今日(YYYY-MM-DD) */
function todayJst() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export default function OrderForm() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmedUrl, setConfirmedUrl] = useState<string | null>(null);
  const [confirmedText, setConfirmedText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const chosen = ITEMS.filter((it) => (qty[it.id] ?? 0) > 0);
  const total = chosen.reduce((s, it) => s + it.price * qty[it.id], 0);
  const minDate = useMemo(todayJst, []);

  // 内容を変えたら確定をやり直してもらう(古いリンクで送られないように)
  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setConfirmedUrl(null);
  };

  const setItemQty = edit((next: { id: string; n: number }) =>
    setQty((q) => ({ ...q, [next.id]: Math.max(0, Math.min(20, next.n)) })),
  );

  function buildMessage() {
    const d = formatDate(date);
    const lines = [
      "Hello Marusho! / マルショー様",
      "Delivery order / 配達注文です。",
      "",
      `Place / 配達先: ${place}`,
      `Name / 名前: ${name.trim()}`,
      `Date / 日付: ${d.en} / ${d.ja}`,
      `Delivery time / 配達時間: ${time}`,
    ];

    for (const sec of SECTIONS) {
      const items = chosen.filter((it) => it.category === sec.key);
      if (!items.length) continue;
      lines.push("", `[${sec.en} / ${sec.ja}]`);
      for (const it of items) {
        lines.push(`- ${it.en} / ${it.ja} x ${qty[it.id]}`);
      }
    }

    lines.push("", `Total / 合計: ${yen(total)}`);
    if (notes.trim()) lines.push("", `Notes / 備考: ${notes.trim()}`);
    lines.push("", "Thank you! / よろしくお願いします。");
    return lines.join("\n");
  }

  function confirm() {
    const errs: string[] = [];
    if (!chosen.length) errs.push("Please choose at least one item.");
    if (!place) errs.push("Please choose where you are staying.");
    if (!date) errs.push("Please choose the date.");
    else if (date < minDate) errs.push("The date is in the past.");
    if (!time) errs.push("Please choose the delivery time.");
    if (!name.trim()) errs.push("Please enter your name.");
    setErrors(errs);
    if (errs.length) {
      setConfirmedUrl(null);
      return;
    }
    const text = buildMessage();
    setConfirmedText(text);
    setConfirmedUrl(`https://wa.me/${MARUSHO_WA}?text=${encodeURIComponent(text)}`);
    requestAnimationFrame(() =>
      document.getElementById("marusho-confirm")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <div className={styles.form}>
      {SECTIONS.map((sec) => (
        <section key={sec.key} className={styles.section}>
          <h2>
            {sec.en} <span>{sec.ja}</span>
          </h2>
          <ul className={styles.items}>
            {ITEMS.filter((it) => it.category === sec.key).map((it) => {
              const n = qty[it.id] ?? 0;
              return (
                <li key={it.id} className={n > 0 ? styles.itemOn : styles.item}>
                  <label className={styles.itemLabel}>
                    <input
                      type="checkbox"
                      checked={n > 0}
                      onChange={(e) => setItemQty({ id: it.id, n: e.target.checked ? 1 : 0 })}
                    />
                    <span className={styles.itemText}>
                      <span className={styles.itemName}>
                        {it.en} <span className={styles.ja}>{it.ja}</span>
                      </span>
                      {it.note && <span className={styles.itemNote}>{it.note}</span>}
                    </span>
                    <span className={styles.price}>{yen(it.price)}</span>
                  </label>
                  {n > 0 && (
                    <div className={styles.stepper}>
                      <button
                        type="button"
                        aria-label={`Fewer ${it.en}`}
                        onClick={() => setItemQty({ id: it.id, n: n - 1 })}
                      >
                        −
                      </button>
                      <span aria-live="polite">{n}</span>
                      <button
                        type="button"
                        aria-label={`More ${it.en}`}
                        onClick={() => setItemQty({ id: it.id, n: n + 1 })}
                      >
                        +
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className={styles.section}>
        <h2>
          Delivery details <span>配達情報</span>
        </h2>
        <div className={styles.fields}>
          <label>
            <span>Place (where you stay) / 配達先</span>
            <select value={place} onChange={(e) => edit(setPlace)(e.target.value)}>
              <option value="">Choose…</option>
              {PLACES.map((pl) => (
                <option key={pl.en} value={pl.ja ? `${pl.ja} ${pl.en}` : pl.en}>
                  {pl.ja ? `${pl.en} / ${pl.ja}` : pl.en}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Date (night of your stay) / 日付</span>
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => edit(setDate)(e.target.value)}
            />
          </label>
          <label>
            <span>Delivery time / 配達時間</span>
            <select value={time} onChange={(e) => edit(setTime)(e.target.value)}>
              <option value="">Choose…</option>
              {DINNER_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Your name / 名前</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => edit(setName)(e.target.value)}
            />
          </label>
          <label>
            <span>Notes (optional) — e.g. &ldquo;1 soba vegan&rdquo;, allergies</span>
            <textarea rows={2} value={notes} onChange={(e) => edit(setNotes)(e.target.value)} />
          </label>
        </div>
      </section>

      <div className={styles.totalBar}>
        <span>
          {chosen.length ? `${chosen.reduce((s, it) => s + qty[it.id], 0)} items` : "No items yet"}
        </span>
        <strong>{yen(total)}</strong>
      </div>

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.confirm} onClick={confirm}>
        Confirm order / 確定
      </button>

      {confirmedUrl && (
        <div id="marusho-confirm" className={styles.result}>
          <h2>Your order message</h2>
          <pre className={styles.preview}>{confirmedText}</pre>
          <a href={confirmedUrl} target="_blank" rel="noopener noreferrer" className={styles.waButton}>
            Open WhatsApp to send
          </a>
          <p className={styles.resultNote}>
            WhatsApp opens with this message already written &mdash; just
            press <strong>Send</strong>. Payment is made locally to Marusho
            (credit card accepted, 5% card fee). Please order in advance if
            possible.
          </p>
        </div>
      )}
    </div>
  );
}
