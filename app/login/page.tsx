import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-secondary/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-foreground rounded-2xl shadow-2xl shadow-primary/20 mb-4 animate-bounce-slow">
            <span className="font-black text-white text-3xl">G</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center justify-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Grains
            </span>
            <span className="font-light italic text-muted-foreground">AI</span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Intelligent Knowledge Harvest
          </p>
        </div>

        <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden border">
          <CardHeader className="p-8 pb-0 text-center">
            <CardTitle className="text-2xl font-black tracking-tight uppercase">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm font-medium pt-2">
              Sign in to manage your harvested wisdom
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      className="h-12 pl-12 rounded-2xl bg-secondary/20 border-none focus-visible:ring-2 focus-visible:ring-primary/40 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    title="Password must be at least 6 characters"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Secret Key
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="h-12 pl-12 rounded-2xl bg-secondary/20 border-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 pt-2">
                <Button
                  formAction={login}
                  className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all bg-primary text-primary-foreground"
                >
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                    <span className="bg-background/0 px-3 text-muted-foreground">
                      Or start fresh
                    </span>
                  </div>
                </div>

                <Button
                  formAction={signup}
                  variant="outline"
                  className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest border-border/50 hover:bg-secondary/50 hover:border-primary/50 transition-all"
                >
                  <UserPlus size={18} className="mr-2" />
                  Create Harvest Account
                </Button>
              </div>
            </form>
          </CardContent>
          <div className="bg-secondary/10 p-4 text-center border-t border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles size={12} className="text-primary" />
              Powered by advanced Grains AI
            </p>
          </div>
        </Card>

        <footer className="mt-8 text-center">
          <p className="text-[11px] font-medium text-muted-foreground/60">
            &copy; 2026 Grains AI
          </p>
        </footer>
      </div>
    </div>
  );
}
