"use client";

import { useState } from "react";
import CategoryHeader from "./CategoryHeader";
import ServicesGrid from "./ServicesGrid";

export default function CategoryPageContent({
  category,
  categoryId,
  services,
}) {
  const [language, setLanguage] = useState("en");

  return (
    <>
      <CategoryHeader
        category={category}
        language={language}
        onLanguageChange={setLanguage}
      />
      <ServicesGrid
        categoryId={categoryId}
        initialServices={services}
        categoryName={category?.name}
        category={category}
        language={language}
        onLanguageChange={setLanguage}
      />
    </>
  );
}
