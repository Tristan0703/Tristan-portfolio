import MacroHero from "@/components/MacroHero";
import FabricMotion from "@/components/FabricMotion";
import FabricVault from "@/components/FabricVault";
import TactileHeader from "@/components/TactileHeader";

export default function Home() {
  return (
    <main>
      <TactileHeader />
      <MacroHero />
      <FabricMotion />
      <FabricVault />
    </main>
  );
}