import Image from "next/image";
import { getWaitlistCount } from "@/lib/waitlist-db";
import { HeroWorkflowDemo } from "@/components/hero-workflow-demo";
import { WaitlistForm } from "@/components/waitlist-form";

export const dynamic = "force-dynamic";

const metrics = [
  {
    value: "1 launch prompt",
    label: "Describe the chain, token, validation mode, and target environment in one place.",
  },
  {
    value: "1 approval gate",
    label: "Review the deployment plan before any command runs.",
  },
  {
    value: "Local L1 deploys",
    label: "Create and track a local Avalanche L1 with RPC details and logs.",
  },
  {
    value: "1 launch record",
    label: "Keep chain ID, token, status, runs, and launch history together.",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Describe the L1",
    body:
      "Give AvaLaunch the name, token symbol, chain ID, VM, validation mode, and target environment.",
  },
  {
    number: "02",
    title: "Review the plan",
    body:
      "AvaLaunch turns the brief into a deterministic launch plan and shows what will run before execution.",
  },
  {
    number: "03",
    title: "Deploy and manage",
    body:
      "After approval, AvaLaunch runs the local deployment and stores the RPC, logs, status, and project record.",
  },
];

const outputs = [
  {
    title: "Launch plan",
    body:
      "The exact config and command sequence before execution.",
  },
  {
    title: "Deployment record",
    body:
      "RPC URL, chain ID, token symbol, blockchain ID, subnet ID, VM ID, and status.",
  },
  {
    title: "Run history",
    body:
      "A clear log of what ran, what passed, and what needs attention.",
  },
];

const avalancheValue = [
  "Helps builders test Avalanche L1 ideas without becoming infra operators first.",
  "Turns scattered CLI steps, configs, RPC details, and logs into one product flow.",
  "Creates a repeatable path from local L1 deployment to Avalanche L1 on Fuji Testnet.",
  "Gives teams shareable launch evidence for grants, partners, and internal review.",
];

const comparisonRows = [
  {
    label: "Turn a chain idea into config",
    manual: "Docs and guesswork",
    tools: "Partial",
    avalaunch: "Built in",
  },
  {
    label: "Preview commands before execution",
    manual: "Manual review",
    tools: "Not unified",
    avalaunch: "Built in",
  },
  {
    label: "Deploy a local Avalanche L1",
    manual: "CLI-heavy",
    tools: "Tool by tool",
    avalaunch: "Built in",
  },
  {
    label: "Track RPC, IDs, logs, and status",
    manual: "Scattered",
    tools: "Partial",
    avalaunch: "Built in",
  },
  {
    label: "Prepare for Fuji Testnet",
    manual: "Manual checklist",
    tools: "Fragmented",
    avalaunch: "Next release path",
  },
];

const faqs = [
  {
    question: "Who is this for?",
    answer:
      "Hackathon teams, app-chain founders, and infra-light builders who want to create and manage Avalanche L1s without manually coordinating every CLI step.",
  },
  {
    question: "Does this replace Avalanche CLI, AvaCloud, or Builder Console?",
    answer:
      "No. AvaLaunch is the operator layer around the launch workflow. It collects intent, previews the plan, gates execution, and tracks the resulting L1 details.",
  },
  {
    question: "What works now?",
    answer:
      "The current product supports local Avalanche L1 launch flow, launch-plan preview, approval gating, runner execution, persistence, logs, and L1 management views.",
  },
  {
    question: "What is next?",
    answer:
      "Avalanche L1 deployment on Fuji Testnet, stronger runner hardening, hosted demo infrastructure, and public launch proof.",
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
            <div className="eyebrow">For Avalanche L1 builders</div>
            <h1>Launch an Avalanche L1 from a prompt.</h1>
            <p className="hero-lede">
              AvaLaunch collects chain config, previews the deployment plan,
              waits for approval, runs the Avalanche tooling, and stores the
              RPC, logs, and launch history.
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
                Local Avalanche L1 deployment today. Fuji Testnet is the next
                release path.
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
            <h2>Prompt in. Launch plan out.</h2>
            <p>
              Describe the L1, review the config, approve the plan, and let
              AvaLaunch run the deployment path.
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
            <h2>The launch artifacts that matter.</h2>
            <p>
              Everything a builder needs to inspect, repeat, and share the
              launch.
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
            <h2>Less ceremony between idea and L1.</h2>
            <p>
              Avalanche L1s give teams custom execution, gas tokens, validation
              rules, and isolated throughput. AvaLaunch makes the launch path
              easier to operate.
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
            <h2>Better than stitching the launch together by hand.</h2>
            <p>
              Avalanche tooling is powerful. AvaLaunch wraps the launch
              workflow around it.
            </p>
          </div>

          <div className="comparison-table" role="table" aria-label="Product comparison">
            <div className="comparison-row comparison-head" role="row">
              <div role="columnheader">Task</div>
              <div role="columnheader">Manual process</div>
              <div role="columnheader">Existing tools</div>
              <div role="columnheader">AvaLaunch</div>
            </div>
            {comparisonRows.map((row) => (
              <div className="comparison-row" role="row" key={row.label}>
                <div role="cell">{row.label}</div>
                <div role="cell">{row.manual}</div>
                <div role="cell">{row.tools}</div>
                <div role="cell" className="accent-cell">
                  {row.avalaunch}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <div className="site-inner waitlist-grid">
          <div className="section-heading compact">
            <div className="section-kicker">Early access</div>
            <h2>Get the private build.</h2>
            <p>
              For builders preparing Avalanche L1s and teams that want a faster
              path from prompt to running chain.
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
