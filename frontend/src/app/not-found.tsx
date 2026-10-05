import LiveRouteGate from "@/components/LiveRouteGate";
import NotFoundView from "@/components/ui/NotFoundView";
import LiveServiceFallback from "@/components/services/LiveServiceFallback";
import LiveIndustryFallback from "@/components/industries/LiveIndustryFallback";
import LiveBlogFallback from "@/components/blog/LiveBlogFallback";
import LiveStaffFallback from "@/components/team/LiveStaffFallback";

export default function NotFound() {
  return (
    <LiveServiceFallback>
    <LiveIndustryFallback>
    <LiveBlogFallback>
    <LiveStaffFallback>
    <LiveRouteGate>
      <NotFoundView />
    </LiveRouteGate>
    </LiveStaffFallback>
    </LiveBlogFallback>
    </LiveIndustryFallback>
    </LiveServiceFallback>
  );
}
