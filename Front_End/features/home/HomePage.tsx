import HeroSection from "./sections/HeroSection";
import CategoryBar from "./sections/CategoryBar";
import JourneySection from "./sections/JourneySection";
import PatientDetailsSection from "./sections/PatientDetailsSection";
import FeaturesSection from "./sections/FeaturesSection";
import PatientSearchSection from "./sections/PatientSearchSection";
import SecuritySection from "./sections/SecuritySection";
import CallToActionSection from "./sections/CallToActionSection";

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#0a1220] text-[#eaf0fa]">
      <HeroSection />
      <CategoryBar />
      <JourneySection />
      <PatientDetailsSection />
      <FeaturesSection />
      <PatientSearchSection />
      <SecuritySection />
      <CallToActionSection />
    </div>
  );
}
