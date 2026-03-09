import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  
  try {
    // IMPORTANTE: await aqui é obrigatório para esperar o Django responder
    const success = await login(username, password); 
    
    if (success) {
      console.log("Login realizado com sucesso!");
      // O redirecionamento acontece porque o estado do 'user' mudou no AuthContext
    } else {
      setError("Usuário ou senha incorretos.");
    }
  } catch (err) {
    setError("Erro ao conectar com o servidor.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Terminal className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-mono font-bold text-foreground">HomeLab Portal</h1>
            <p className="text-sm text-muted-foreground">Secure access to your infrastructure</p>
          </div>
        </div>

        <Card className="glow-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Lock className="h-4 w-4 text-primary" />
              Authentication Required
            </CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="font-mono"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="font-mono"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
