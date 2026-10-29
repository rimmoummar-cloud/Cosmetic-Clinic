export function getLocalizedDescription(item, language = "en") {
  if (!item || typeof item !== "object") {
    return "";
  }

  const selectedLanguage = language === "fr" ? "fr" : "en";
  if (selectedLanguage === "fr") {
    const frenchDescription = typeof item.description_fr === "string" ? item.description_fr.trim() : "";
    if (frenchDescription) return frenchDescription;
    const englishDescription = typeof item.description === "string" ? item.description.trim() : "";
    return englishDescription;
  }

  const englishDescription = typeof item.description === "string" ? item.description.trim() : "";
  if (englishDescription) return englishDescription;

  const frenchDescription = typeof item.description_fr === "string" ? item.description_fr.trim() : "";
  return frenchDescription;
}

export function DescriptionLanguageToggle({ language, onChange, className = "" }) {
  const isFrench = language === "fr";
  const selectLanguage = (event, selectedLanguage) => {
    event.stopPropagation();
    event.preventDefault();
    onChange(selectedLanguage);
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-[#D4AF7A]/30 bg-white/80 p-1 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={(event) => selectLanguage(event, "en")}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${!isFrench ? "bg-[#D4AF7A] text-white" : "text-[#5E5247] hover:bg-[#f9f4ee]"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={(event) => selectLanguage(event, "fr")}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${isFrench ? "bg-[#D4AF7A] text-white" : "text-[#5E5247] hover:bg-[#f9f4ee]"}`}
      >
        FR
      </button>
    </div>
  );
}
