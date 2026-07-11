import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const params = await searchParams;
  const showError = params.error === "wrong";

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel} aria-labelledby="login-title">
        <div className={styles.brandMark} aria-hidden="true">
          IS
        </div>
        <h1 id="login-title">Idea Store</h1>
        <p>Enter your private idea collection.</p>

        <form action="/api/login" method="post" className={styles.loginForm}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
          />
          {showError ? (
            <p className={styles.errorMessage} role="alert">
              Wrong password. Try again.
            </p>
          ) : null}
          <button type="submit">Enter Idea Store</button>
        </form>
      </section>
    </main>
  );
}
