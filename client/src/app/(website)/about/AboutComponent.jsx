"use client";
import AboutHero from "./components/AboutHero";
import AboutStory from "./components/AboutStory";
import AboutValues from "./components/AboutValues";
import AboutTeam from "./components/AboutTeam";
import AboutCTA from "./components/AboutCTA";

export default function AboutComponent({ data }) {
  const sections = data?.sections || [];

  const findSectionContent = (keys) => {
    const lookups = Array.isArray(keys) ? keys : [keys];
    const match = sections.find((section) => {
      const name = section?.name?.toLowerCase() || "";
      const slug = section?.slug?.toLowerCase() || "";
      return lookups.some((key) => {
        const k = key?.toLowerCase();
        return k && (name.includes(k) || slug.includes(k));
      });
    });
    return match?.content || {};
  };

  const heroData = findSectionContent(["hero", "about-hero"]);
  const storyData = findSectionContent(["story", "story"]);
  const valuesData = findSectionContent(["values", "values"]);
  const teamData = findSectionContent(["team", "team"]);
  const ctaData = findSectionContent(["cta", "call-to-action", "about-cta"]);
// console.log("AboutComponent data:", data);
// console.log("Hero Data:", heroData);
// console.log("Story Data:", storyData);
// console.log("Values Data:", valuesData);
// console.log("Team Data:", teamData);
// console.log("CTA Data:", ctaData);
  return (
    <div className="w-full overflow-hidden">
      <AboutHero data={heroData} />
      <AboutStory data={storyData} />
      <AboutValues data={valuesData} />
      <AboutTeam data={teamData} />
      <AboutCTA data={ctaData} />
    </div>
  );
}
