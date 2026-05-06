import { startTransition, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/I18nProvider";
import { Button } from "../ui/Button";

const loginHighlights = [
  {
    label: "Production control",
    value: "Plan, release, track",
    hint: "Monitor work orders, job cards, and shop-floor readiness from one workspace."
  },
  {
    label: "Inventory confidence",
    value: "Warehouse-aware",
    hint: "Keep branch, warehouse, bin, and material context aligned for daily decisions."
  },
  {
    label: "Quality and dispatch",
    value: "Exception-led",
    hint: "Surface approvals, quality holds, and dispatch priorities before they block execution."
  }
];

export function LoginPage() {
  const { login, restoreError, status } = useAuth();
  const { t } = useI18n();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("1");
  const [branchId, setBranchId] = useState("11");
  const [deviceLabel, setDeviceLabel] = useState("Workstation");
  const [registerDevice, setRegisterDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="login-layout login-layout--enterprise">
      <section aria-labelledby="login-hero-title" className="login-hero">
        <div className="login-hero__headline">
          <div className="login-hero__brand">
            <span aria-hidden="true" className="login-hero__mark">
              STS
            </span>
            <div>
              <span className="login-eyebrow">Manufacturing ERP</span>
              <h1 id="login-hero-title">STS Manufacturing ERP</h1>
            </div>
          </div>
          <p>
            Control production, inventory, quality, dispatch, and shop-floor execution from one secure system.
          </p>
        </div>
        <div className="login-hero__panel">
          <span>Operations cockpit</span>
          <strong>Plan to dispatch control</strong>
          <p>Role-based access keeps plant, warehouse, quality, and commercial work aligned.</p>
        </div>
        <div className="login-hero__grid">
          {loginHighlights.map((highlight) => (
            <article className="login-hero__metric" key={highlight.label}>
              <span>{highlight.label}</span>
              <strong>{highlight.value}</strong>
              <p>{highlight.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <main aria-label="Sign-in panel" className="login-shell">
        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            startTransition(() => setSubmitError(null));

            try {
              await login({
                userName,
                password,
                companyId: Number(companyId),
                branchId: Number(branchId)
              });
            } catch (error) {
              setSubmitError(error instanceof Error ? error.message : "Sign-in failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="login-form__header">
            <span className="login-eyebrow">Secure sign-in</span>
            <h2>{t("auth.loginTitle")}</h2>
            <p>
              Use your assigned company, branch, and role access to continue.
            </p>
          </div>

          {submitError || restoreError ? (
            <div className="login-form__error">{submitError ?? restoreError}</div>
          ) : null}

          <div className="login-form__grid">
            <label>
              <span>User name</span>
              <input
                autoComplete="username"
                onChange={(event) => setUserName(event.target.value)}
                value={userName}
              />
            </label>
            <label>
              <span>Password</span>
              <span className="login-form__password-field">
                <input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>
            <label>
              <span>Company</span>
              <select onChange={(event) => setCompanyId(event.target.value)} value={companyId}>
                <option value="1">Acme Manufacturing</option>
              </select>
            </label>
            <label>
              <span>Branch</span>
              <select onChange={(event) => setBranchId(event.target.value)} value={branchId}>
                <option value="11">Acme North Plant</option>
                <option value="12">Acme South Plant</option>
              </select>
            </label>
            <label>
              <span>Device label</span>
              <input onChange={(event) => setDeviceLabel(event.target.value)} value={deviceLabel} />
            </label>
            <label className="login-form__toggle">
              <span>Register this device</span>
              <input
                checked={registerDevice}
                onChange={(event) => setRegisterDevice(event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>

          <p className="muted">
            {registerDevice
              ? `${t("auth.deviceRegistration")} Device label: ${deviceLabel}.`
              : "Device registration is off for this sign-in."}
          </p>

          <div className="login-form__actions">
            <Button disabled={isSubmitting} fullWidth variant="primary" type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          <div className="login-form__assist">
            <Link className="login-form__link" to="/forgot-password">
              {t("auth.forgotPassword")}
            </Link>
            <span className="muted">Access follows your approved company, branch, and role scope.</span>
          </div>
        </form>
      </main>
    </div>
  );
}
