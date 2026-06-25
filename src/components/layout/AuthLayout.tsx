

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{
          background: "var(--brand-blue)",
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.06] text-white" aria-hidden="true">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>


        {/* Logo */}
        <div className="relative z-10 space-y-8 flex flex-col items-start">
          <div>
            <img 
              src="/assets/images/logo_lockup_blue.png" 
              alt="HealthyME | Life@ Montefiore" 
              className="h-12 w-auto object-contain -ml-4 -mt-3" 
            />
          </div>

          <h2 
            className="text-white font-display font-bold text-3xl leading-tight mb-4"
            style={{ marginTop: "100px" }}
          >
            Tuition Reimbursement
            <br />
            Agent Platform
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            AI-powered tuition reimbursement management for Montefiore Health
            System employees. NYSNA Article 35 compliant.
          </p>
        </div>

        <div className="relative z-10">
          {/* Features section removed */}
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Montefiore Health System. Powered
            by HealthyME.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Brand Logo */}
          <div className="mb-8">
            <img 
              src="/assets/images/logo_lockup.jpg" 
              alt="HealthyME" 
              className="h-12 w-auto object-contain -ml-4" 
            />
          </div>

          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-2xl font-bold font-display text-foreground mb-1">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Montefiore Health System. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
