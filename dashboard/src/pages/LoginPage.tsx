import LoginForm from "@/components/LoginForm";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-muted/40 p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.92_0.02_250),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.94_0.01_80),_transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.28_0.03_250),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.22_0.02_80),_transparent_45%)]"
      />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <Card className="relative w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="pb-0">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
            PD
          </div>
          <CardTitle className="sr-only">Prodesignity staff sign in</CardTitle>
          <CardDescription className="sr-only">
            Sign in to the Prodesignity dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
