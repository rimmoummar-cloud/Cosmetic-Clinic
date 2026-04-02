"use client";
import AboutHero from "./components/AboutHero";
import AboutStory from "./components/AboutStory";
import AboutValues from "./components/AboutValues";
import AboutTeam from "./components/AboutTeam";
import AboutCTA from "./components/AboutCTA";

export default function AboutComponent() {
  return (
    <div className="w-full overflow-hidden">
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutTeam />
      <AboutCTA />
    </div>
  );
}
