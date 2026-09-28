import { useTranslation } from "react-i18next";
import "./Footer.css";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <div>
          <h4>Okie Pet</h4>
          <p>{t("footer.brand_desc")}</p>
        </div>
        <div>
          <h4>{t("footer.delivery_title")}</h4>
          <p>
            {t("footer.shipping_free")}
            <br />
            {t("footer.same_day")}
          </p>
        </div>
        <div>
          <h4>{t("footer.contact_title")}</h4>
          <p>
            {t("footer.email_label")}hello@okiepet.com.au
            <br />
            {t("footer.hours_label")}
          </p>
        </div>
      </div>
    </footer>
  );
}
