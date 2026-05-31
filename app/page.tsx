import { WaitlistForm } from "@/components/waitlist-form";
import {
  CommandCenterIllustration,
  ControlLoopIllustration,
  HealthMeshIllustration,
  TerminalOrbitIllustration,
} from "@/components/illustrations";

const launchSignals = [
  {
    label: "PLAN",
    title: "Decide what you actually need to launch.",
    body:
      "Know whether the product should stay on C-Chain or move to a dedicated L1 before you commit the team to weeks of setup work.",
  },
  {
    label: "VERIFY",
    title: "Check launch readiness in one place.",
    body:
      "Run the checks that matter before testnet demos and launch week: RPC health, validator sync, relayers, deployments, faucets, and interchain flows.",
  },
  {
    label: "RECOVER",
    title: "See what broke and what to do next.",
    body:
      "When something fails, the team gets the affected system, likely cause, and next recovery step instead of another long debugging thread.",
  },
];

const modules = [
  {
    name: "PlanEngine",
    tagline: "From launch brief to chain plan.",
    title: "Start with the product, not the infrastructure diagram.",
    body:
      "Describe the application, the users, the trust model, and the systems it needs to connect to. LaunchOps maps that into the right Avalanche path, the launch sequence, and the infra decisions the team needs to make.",
    visual: <TerminalOrbitIllustration />,
  },
  {
    name: "VerifyGrid",
    tagline: "Readiness checks with live state.",
    title: "Turn launch checklists into real verification.",
    body:
      "Instead of chasing status across docs, nodes, explorers, and chat, the team gets one place to verify the environment before a grant review, partner demo, or public release.",
    visual: <HealthMeshIllustration />,
  },
  {
    name: "RecoverLoop",
    tagline: "One operator surface for launch week.",
    title: "Keep operations tight when the chain is live.",
    body:
      "Watch the systems that usually fail during rollout, understand the issue quickly, and move to the fix without bouncing between consoles and partial runbooks.",
    visual: <ControlLoopIllustration />,
  },
];

const valuePoints = [
  "Built for Avalanche L1 teams, not generic multi-chain ops.",
  "Connects planning, validation, monitoring, and launch proof in one workflow.",
  "Uses AI where it helps, then hands execution to explicit checks and clear state.",
];

const faqs = [
  {
    question: "Why not just use AvaCloud or Builder Console?",
    answer:
      "Those tools provision important pieces. They do not own the cross-tool operating workflow, the launch-readiness narrative, or the verification loop a small team needs from concept to testnet.",
  },
  {
    question: "Is this a generic AI ops agent?",
    answer:
      "No. The product is opinionated around Avalanche L1 launches, validator operations, ICM and ICTT wiring, readiness checks, and launch packaging for teams that need control, not generic chat automation.",
  },
  {
    question: "Who should join first?",
    answer:
      "Appchain founders, Avalanche grant teams, infra agencies, and operator-lean teams preparing an L1 or deciding whether they should launch one at all.",
  },
];

export default function Home() {
  return (
    <main className="winter-shell">
      <div className="winter-noise" aria-hidden="true" />
      <div className="winter-columns" aria-hidden="true" />
      <div className="winter-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">AVALANCHE LAUNCHOPS</span>
        </div>
        <nav className="topnav" aria-label="Primary">
          <a href="#workflow">Workflow</a>
          <a href="#modules">Modules</a>
          <a href="#faq">Faq</a>
        </nav>
        <a href="#waitlist" className="nav-cta">
          Join waitlist
        </a>
      </header>

      <section className="hero-stage">
        <div className="hero-copy">
          <div className="eyebrow">Powered by AI + Avalanche L1 ops</div>
          <h1>
            Launch Avalanche L1s
            <span> with a plan your team</span>
            <span> can actually execute.</span>
          </h1>
          <p className="hero-lede">
            LaunchOps helps teams decide whether they need an Avalanche L1,
            turns that decision into a rollout plan, and checks the environment
            before launch week starts applying pressure.
          </p>
          <div className="hero-actions">
            <a href="#waitlist" className="hero-cta">
              Join the waitlist
            </a>
            <div className="hero-caption">
              For appchain founders, grant teams, and infra partners preparing
              real launches.
            </div>
          </div>
        </div>

        <div className="hero-terminal-shell">
          <div className="terminal-shell">
            <div className="terminal-top">
              <div className="terminal-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="terminal-label">launchops.avalanche</div>
              <div className="terminal-status">ready</div>
            </div>
            <div className="terminal-body">
              <div className="prompt-line">
                <span className="prompt-mark">&gt;</span>
                <span className="prompt-text">
                  need an avalanche l1 for a permissioned trade finance network
                  with icm settlement and controlled validators
                </span>
              </div>
              <div className="command-pills">
                <span>plan</span>
                <span>validate</span>
                <span>monitor</span>
              </div>
              <div className="terminal-visual">
                <CommandCenterIllustration />
              </div>
            </div>
            <div className="terminal-footer">
              <span>Generate</span>
              <span>Verify</span>
              <span>Operate</span>
            </div>
          </div>
        </div>
      </section>

      <section className="statement-band">
        <p>Launching an L1 should not turn your product team into an infrastructure team.</p>
      </section>

      <section className="interlude-section" id="workflow">
        <div className="interlude-copy">
          <div className="section-kicker">The missing layer</div>
          <h2>The layer between “we should launch” and “we are ready.”</h2>
          <p>
            Avalanche already has strong infrastructure. What teams still lack
            is the operating workflow that connects architecture decisions,
            launch readiness, and day-one operations.
          </p>
        </div>

        <div className="signal-rail">
          {launchSignals.map((signal) => (
            <article className="signal-item" key={signal.label}>
              <div className="signal-label">{signal.label}</div>
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-stage" id="modules">
        {modules.map((module, index) => (
          <div
            className={`feature-row ${index % 2 === 1 ? "reverse" : ""}`}
            key={module.name}
          >
            <div className="feature-visual">{module.visual}</div>
            <div className="feature-copy">
              <div className="feature-name">{module.name}</div>
              <p className="feature-tagline">{module.tagline}</p>
              <h3>{module.title}</h3>
              <p>{module.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="value-panel">
        <div className="value-copy">
          <div className="section-kicker">Why this wins</div>
          <h2>Built for the teams that still do launch week by hand.</h2>
          <p>
            Existing tools give teams pieces of the stack. LaunchOps owns the
            sequence between them, so a small team can move from idea to
            launch-ready environment without building its own internal ops layer.
          </p>
        </div>
        <div className="value-list">
          {valuePoints.map((point) => (
            <div className="value-item" key={point}>
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="light-section" id="waitlist">
        <div className="light-grid">
          <div className="light-copy">
            <div className="pixel-kicker">Waitlist</div>
            <h2>Get early access to the first LaunchOps build.</h2>
            <p>
              Join the waitlist for private access, rollout previews, and early
              product notes for teams preparing an Avalanche launch.
            </p>
          </div>
          <WaitlistForm />
        </div>

        <div className="faq-stage" id="faq">
          <div className="faq-heading">
            <div className="pixel-title">FAQs</div>
            <p>Questions teams ask before they trust a launch tool.</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <article className="faq-block" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mega-footer">
        <div className="footer-copy">
          <h2>Launch Avalanche L1s without building your own ops layer first.</h2>
          <a href="#waitlist" className="footer-cta">
            Join the waitlist
          </a>
        </div>
        <div className="footer-columns">
          <div>
            <h3>Product</h3>
            <span>PlanEngine</span>
            <span>VerifyGrid</span>
            <span>RecoverLoop</span>
          </div>
          <div>
            <h3>Audience</h3>
            <span>Grant teams</span>
            <span>Appchain founders</span>
            <span>Infra agencies</span>
          </div>
          <div>
            <h3>Status</h3>
            <span>Private waitlist</span>
            <span>Avalanche-first</span>
            <span>Operator tooling</span>
          </div>
        </div>
        <div className="footer-mark">AVALANCHE LAUNCHOPS</div>
      </footer>
    </main>
  );
}
