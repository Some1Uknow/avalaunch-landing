import Image from "next/image";
import { getWaitlistCount } from "@/lib/waitlist-db";
import { HeroWorkflowDemo } from "@/components/hero-workflow-demo";
import { WaitlistForm } from "@/components/waitlist-form";

export const dynamic = "force-dynamic";

const metrics = [
  {
    value: "1 launch brief",
    label: "Instead of launch notes spread across docs, Slack, and private chats.",
  },
  {
    value: "1 rollout plan",
    label: "With the recommended Avalanche path, task order, and ownership.",
  },
  {
    value: "Pre-launch checks",
    label: "Validators, relayers, RPC, deployments, and interchain messaging.",
  },
  {
    value: "1 issue list",
    label: "A clear list of what still needs fixing before launch.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Paste the launch brief",
    body:
      "Describe the app, the timeline, validator rules, permissions, and interchain requirements.",
  },
  {
    number: "02",
    title: "Get the launch plan",
    body:
      "LaunchOps recommends the Avalanche path, maps the rollout sequence, and lists the setup work the team needs to complete.",
  },
  {
    number: "03",
    title: "Run pre-launch checks",
    body:
      "See what passed, what failed, and what still needs fixing before testnet, partner review, or mainnet.",
  },
];

const outputs = [
  {
    title: "Launch plan",
    body:
      "A concrete rollout plan with the recommended Avalanche setup, task order, and dependencies.",
  },
  {
    title: "Pre-launch checklist",
    body:
      "Checks for validators, relayers, RPC endpoints, deployments, and interchain messaging.",
  },
  {
    title: "Issue list",
    body:
      "One place to see what is still broken, why it matters, and what the team should do next.",
  },
];

const avalancheValue = [
  "Helps more teams launch Avalanche L1s without building their own internal ops tooling first.",
  "Standardizes launch workflows around validators, relayers, and ICM/ICTT instead of ad hoc runbooks.",
  "Improves testnet and mainnet readiness for small teams that do not have deep infra capacity.",
  "Creates reusable launch evidence for grants, ecosystem partners, and internal sign-off.",
];

const comparisonRows = [
  {
    label: "Turn a launch idea into a plan",
    manual: "Manual docs and meetings",
    tools: "Not owned end to end",
    launchops: "Built in",
  },
  {
    label: "Keep launch tasks in one place",
    manual: "Usually fragmented",
    tools: "Partial",
    launchops: "Built in",
  },
  {
    label: "Check validators and relayers before launch",
    manual: "Manual",
    tools: "Tool by tool",
    launchops: "Built in",
  },
  {
    label: "Know what is still broken",
    manual: "Hard to track",
    tools: "Not summarized",
    launchops: "Built in",
  },
  {
    label: "Share launch status with reviewers and partners",
    manual: "Ad hoc",
    tools: "Not packaged",
    launchops: "Built in",
  },
];

const faqs = [
  {
    question: "Who is this for?",
    answer:
      "Founders, launch leads, and infra teams preparing an Avalanche L1 or deciding whether they should launch one.",
  },
  {
    question: "Does this replace AvaCloud or Builder Console?",
    answer:
      "No. Those tools provision important pieces. LaunchOps connects the planning, pre-launch checks, and launch status across them.",
  },
  {
    question: "What launch workflows are included?",
    answer:
      "Launch brief intake, rollout planning, validator and relayer checks, RPC and deployment checks, and a clear issue summary before launch.",
  },
];

export default async function Home() {
  let waitlistCount = 0;

  try {
    waitlistCount = await getWaitlistCount();
  } catch (error) {
    console.error("failed to load waitlist count", error);
  }

  return (
    <main className="landing-shell">
      <div className="page-noise" aria-hidden="true" />
      <div className="page-columns" aria-hidden="true" />

      <header className="site-header">
        <div className="site-inner header-inner">
          <a className="brand-lockup" href="#top">
            <Image
              src="/avalaunch_branding_white.png"
              alt="AvaLaunch"
              width={1672}
              height={941}
              className="brand-lockup-image"
              priority
            />
          </a>

          <nav className="topnav" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#outputs">Outputs</a>
            <a href="#why-avalanche">Why Avalanche</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a href="#waitlist" className="nav-cta">
            Join waitlist
          </a>
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="site-inner hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">For teams launching Avalanche L1s</div>
            <h1>Launch an Avalanche L1 in seconds.</h1>
            <p className="hero-lede">
              Paste your launch brief. Get a rollout plan, pre-launch checks,
              and a clear list of what still needs fixing before testnet or
              mainnet.
            </p>
            <div className="hero-actions">
              <div className="hero-primary-actions">
                <a href="#waitlist" className="hero-cta">
                  Join waitlist
                </a>
                <span className="hero-waitlist-count" style={{ marginLeft: "5px" }}>
                  {waitlistCount.toLocaleString()}+ in waitlist
                </span>
              </div>
              <p className="hero-note">
                Built for founders, launch leads, and infra teams preparing an
                Avalanche L1.
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <HeroWorkflowDemo />
          </div>
        </div>
      </section>

      <section className="metrics-section">
        <div className="site-inner">
          <div className="metrics-grid">
            {metrics.map((metric) => (
              <article className="metric-card" key={metric.value}>
                <div className="metric-value">{metric.value}</div>
                <p>{metric.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section" id="how">
        <div className="site-inner">
          <div className="section-heading">
            <div className="section-kicker">How it works</div>
            <h2>Simple input. Clear output.</h2>
            <p>
              Give LaunchOps the launch brief, get the plan, run the checks,
              and see what still needs fixing.
            </p>
          </div>

          <div className="steps-grid">
            {workflowSteps.map((step) => (
              <article className="step-card" key={step.number}>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section alt-surface" id="outputs">
        <div className="site-inner">
          <div className="section-heading">
            <div className="section-kicker">What the team gets</div>
            <h2>The actual launch artifacts.</h2>
            <p>
              The outputs a launch team needs before it ships.
            </p>
          </div>

          <div className="outputs-grid">
            {outputs.map((output) => (
              <article className="output-card" key={output.title}>
                <h3>{output.title}</h3>
                <p>{output.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section" id="why-avalanche">
        <div className="site-inner split-grid">
          <div className="section-heading compact">
            <div className="section-kicker">Why this matters for Avalanche</div>
            <h2>More launch discipline. Less manual launch risk.</h2>
            <p>
              This is not generic ops software. It is shaped around the failure
              points and setup work that show up in Avalanche L1 launches.
            </p>
          </div>

          <div className="bullet-stack">
            {avalancheValue.map((item) => (
              <div className="bullet-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section comparison-surface">
        <div className="site-inner">
          <div className="section-heading">
            <div className="section-kicker">Comparison</div>
            <h2>Better than stitching launch ops together by hand.</h2>
            <p>
              Existing tooling provisions parts of the stack. The gap is the
              launch workflow between them.
            </p>
          </div>

          <div className="comparison-table" role="table" aria-label="Product comparison">
            <div className="comparison-row comparison-head" role="row">
              <div role="columnheader">Task</div>
              <div role="columnheader">Manual process</div>
              <div role="columnheader">Existing tools</div>
              <div role="columnheader">LaunchOps</div>
            </div>
            {comparisonRows.map((row) => (
              <div className="comparison-row" role="row" key={row.label}>
                <div role="cell">{row.label}</div>
                <div role="cell">{row.manual}</div>
                <div role="cell">{row.tools}</div>
                <div role="cell" className="accent-cell">
                  {row.launchops}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <div className="site-inner waitlist-grid">
          <div className="section-heading compact">
            <div className="section-kicker">Waitlist</div>
            <h2>Get early access.</h2>
            <p>
              For teams preparing an Avalanche L1 and for partners who want to
              follow launch workflows closely.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="site-inner faq-grid">
          <div className="section-heading compact">
            <div className="section-kicker">FAQ</div>
            <h2>Before you join.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <article className="faq-card" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-inner footer-inner">
          <Image
            src="/avalaunch_branding_white.png"
            alt="AvaLaunch"
            width={1672}
            height={941}
            className="footer-brand-image"
            style={{ padding: "3rem" }}
          />
        </div>
      </footer>
    </main>
  );
}
