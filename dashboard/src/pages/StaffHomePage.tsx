import { BriefcaseIcon, CheckCircle2Icon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StaffHomePage() {
  return (
    <DashboardLayout
      expectedRole="employer"
      title="Workspace"
      description="Employee dashboard"
    >
      {({ user }) => (
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Welcome, {user.fullName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Your staff workspace is ready. Tools will appear here as they are
              built.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role</CardTitle>
                <BriefcaseIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">
                  Employee
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <CheckCircle2Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tracking-tight">
                  Signed in
                </div>
                <p className="text-xs text-muted-foreground">
                  Session stored securely in cookies
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting started</CardTitle>
              <CardDescription>
                This portal will grow with staffing tools, assignments, and
                project workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              For now, confirm your sign-in works and check back as new modules
              are added for the employee role.
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
