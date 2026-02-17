'use client'
import LandingAuctions from "@/components/LandingAuctions";
import PageLayout from "@/components/UI/PageLayout";
import Welcome from "@/components/Welcome";
import LeaderboardSidebar from "./LeaderboardSidebar";
// import { UsernameManager } from "@/components/UI/UsernameManager";

export default function HomePage() {
  return (
    <PageLayout 
      className="min-h-screen flex flex-col items-start justify-start"
    >
      {/* <UsernameManager /> */}
      <Welcome/>
      {/* <InfoCarousel/> */}
      <div className="flex items-start w-full">
        <LandingAuctions/>
        {/* Sidebar */}
              <LeaderboardSidebar />
      </div>
      
     
    </PageLayout>
  );
}
