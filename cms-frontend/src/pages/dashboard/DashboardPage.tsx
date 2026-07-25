import { Activity, BookOpen, BriefcaseBusiness, Mail, PhoneCall } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/feedback/Skeleton";
import { useAuditLogs, useDashboardSummary } from "@/features/shared/hooks";
import { formatDate } from "@/lib/utils/formatDate";

export default function DashboardPage() {
  const summary = useDashboardSummary();
  const logs = useAuditLogs();
  const cards = [
    { label: "Projects", value: summary.data?.projects, icon: BriefcaseBusiness },
    { label: "Articles", value: summary.data?.articles, icon: BookOpen },
    { label: "Unread Messages", value: summary.data?.unreadMessages, icon: Mail },
    { label: "Pending Meetings", value: summary.data?.pendingMeetingRequests, icon: PhoneCall },
  ];
  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{card.label}</p>
                {summary.isLoading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className="text-3xl font-semibold">{card.value ?? 0}</p>}
              </div>
              <card.icon className="text-accent" size={28} />
            </CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardContent>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Activity size={18} /> Recent Activity</h2>
          <div className="grid gap-3">
            {(logs.data ?? []).slice(0, 6).map((log) => (
              <div key={log._id} className="rounded-md border border-border-subtle p-3 text-sm">
                <span className="font-medium">{log.action}</span> <span className="text-secondary">{log.collection}</span>
                <span className="float-right text-muted">{formatDate(log.createdAt)}</span>
              </div>
            ))}
            {!logs.isLoading && !logs.data?.length ? <p className="text-sm text-muted">No activity yet.</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
