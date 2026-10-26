import { NetworkStatus } from "../components/network-status";
import { UsernamePreview } from "../components/username-preview";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Stablecoin Pay home">
          <span className="brand-mark">SP</span>
          <span>Stablecoin Pay</span>
        </a>
        <span className="network-pill">Solana devnet</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Project 01 · Flagship payment system</p>
          <h1>Send USDC.<br /><span>Prove it settled.</span></h1>
          <p className="hero-description">
            Self-custodial stablecoin payments with explicit state, integer accounting, and chain-verified receipts.
            The foundation is running; embedded wallets and payment execution come next.
          </p>
          <div className="hero-tags" aria-label="Core design constraints">
            <span>Self-custody</span>
            <span>SPL USDC</span>
            <span>PostgreSQL</span>
          </div>
        </div>
        <NetworkStatus />
      </section>

      <section className="foundation-section" id="foundation">
        <div className="section-heading">
          <p className="eyebrow">Built in the first slice</p>
          <h2>Correctness starts before checkout.</h2>
        </div>
        <div className="foundation-grid">
          <UsernamePreview />
          <div className="tool-card">
            <div className="tool-card__heading">
              <span className="tool-number">02</span>
              <div>
                <h3>Explicit payment states</h3>
                <p>Finality cannot regress; unusual activity enters review.</p>
              </div>
            </div>
            <ol className="state-flow">
              <li>Created</li>
              <li>Awaiting signature</li>
              <li>Submitted</li>
              <li>Confirmed</li>
              <li>Finalized</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="principles-grid" aria-label="Implementation principles">
        <article>
          <span className="principle-index">01 / Asset</span>
          <h3>Real SPL transfers</h3>
          <p>USDC <code>transferChecked</code>, associated token accounts, exact decimals, and read-only payment references.</p>
        </article>
        <article>
          <span className="principle-index">02 / Database</span>
          <h3>Idempotency by constraint</h3>
          <p>Unique actor, scope, and key records share the transactional foundation for duplicate-safe payment creation.</p>
        </article>
        <article>
          <span className="principle-index">03 / Accounting</span>
          <h3>Balanced, immutable entries</h3>
          <p>Deferred database checks reject unbalanced journals, while triggers prevent updates and deletion.</p>
        </article>
      </section>

      <footer className="site-footer">
        <span>Stablecoin Pay · Initial implementation</span>
        <span>Devnet only · No user keys on the backend</span>
      </footer>
    </main>
  );
}
