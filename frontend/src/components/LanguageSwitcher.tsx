import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage as SupportedLanguage;

  return (
    <div className="lang-switch" role="group" aria-label="Language / 语言">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          className={current === lng ? "is-active" : ""}
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
        >
          {t(`language.${lng}`)}
        </button>
      ))}
    </div>
  );
}
