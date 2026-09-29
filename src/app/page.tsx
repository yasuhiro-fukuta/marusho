import type { Metadata } from "next";
import OrderForm from "./OrderForm";
import styles from "./marusho.module.css";

export const metadata: Metadata = {
  title: "Marusho food delivery — order form / まるしょう 配達注文",
  description:
    "Order dinner and drinks from Marusho, delivered to your accommodation in Nagiso. Tick your items, confirm, and send the ready-made WhatsApp message.",
  robots: { index: false },
};

export default function MarushoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.brand}>
          Marusho <em>/ 金沢屋</em>
        </p>
        <h1>Marusho food delivery</h1>
        <p className={styles.lead}>
          Marusho, a local shop in Nagiso, delivers dinner and drinks to
          your accommodation. Payment is made locally to Marusho.
        </p>
        <ol className={styles.steps}>
          <li>Tick the items you want and set the quantities.</li>
          <li>
            Choose your place, fill in the date, delivery time and your name, then press{" "}
            <strong>Confirm</strong>.
          </li>
          <li>
            Open WhatsApp from the green button and just press{" "}
            <strong>Send</strong> &mdash; the order message is already
            written. No need to edit it.
          </li>
        </ol>
        <a
          href="/menu.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pdfLink}
        >
          View the menu with photos (PDF)
        </a>
      </header>
      <OrderForm />
    </main>
  );
}
