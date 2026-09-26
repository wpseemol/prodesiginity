import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircle2Icon,
  UserRoundIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
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
      title="Staff dashboard"
      description="Your personal workspace"
    >
      {({ user }) => (
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Welcome, {user.fullName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your public team profile — photo, name, and description.
              Designation is controlled by an admin.
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
                  Team member
                </div>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
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

          <Card className="border-primary/25 bg-primary/5">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRoundIcon className="size-4 text-primary" />
                  Public team profile
                </CardTitle>
                <CardDescription>
                  Upload your photo and write your description for the website
                  roster. Designation is set by an admin.
                </CardDescription>
              </div>
              <Button render={<Link to="/employee/public-profile" />} size="sm">
                Edit profile
                <ArrowRightIcon />
              </Button>
            </CardHeader>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
