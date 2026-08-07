import { Card, CardHeader, CardTitle, CardContent } from "../../primitives/card";

/* ==========================================
   DASHBOARD - ACTIVITY FEED
   Composes: Card + token-driven list
   ========================================== */

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
}

export interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-[var(--space-component-lg)]">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-[var(--space-component-md)] items-start">
              <div className="w-[var(--activity-dot-size)] h-[var(--activity-dot-size)] rounded-[var(--radius-full)] bg-[rgb(var(--color-primary))] mt-[var(--space-component-xs)]" />
              <div className="flex-1">
                <p className="text-[var(--font-size-3)] font-medium text-[rgb(var(--text-primary))]">
                  {activity.title}
                </p>
                <p className="text-[var(--font-size-2)] text-[rgb(var(--text-secondary))]">
                  {activity.description}
                </p>
                <p className="text-[var(--font-size-1)] text-[rgb(var(--text-muted))] mt-[var(--space-component-xs)]">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
