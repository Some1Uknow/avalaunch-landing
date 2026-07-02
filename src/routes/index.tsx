import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import bodyVideo from "../assets/body.mp4?url";
import cardImage from "../assets/card-image.png?url";
import type { WaitlistResult } from "../lib/waitlist-service";

export const Route = createFileRoute("/")({
	component: Home,
});

const CHAR_STEP = 0.038;

const sections = [
	{ id: "home", label: "Home" },
	{ id: "problem", label: "Problem" },
	{ id: "workflow", label: "Workflow" },
	{ id: "outputs", label: "Outputs" },
	{ id: "avalanche", label: "Avalanche" },
	{ id: "comparison", label: "Compare" },
	{ id: "waitlist", label: "Access" },
	{ id: "faq", label: "FAQ" },
] as const;

const problems = [
	{
		value: "Launches are fragmented",
		label: "Config, commands, RPC details, and logs live in different places.",
	},
	{
		value: "CLI steps are easy to miss",
		label: "Builders need to coordinate docs, commands, and environment state.",
	},
	{
		value: "Review is manual",
		label: "Teams need to see what will run before execution starts.",
	},
	{
		value: "Results are hard to share",
		label: "Launch IDs, status, and logs should become one clear record.",
	},
];

const workflowSteps = [
	{
		number: "01",
		title: "Describe",
		body: "Enter the chain name, token, VM, validation mode, and target.",
	},
	{
		number: "02",
		title: "Review",
		body: "AvaLaunch shows the plan and commands before execution.",
	},
	{
		number: "03",
		title: "Deploy",
		body: "Approve the run and keep the deployment details in one place.",
	},
];

const outputs = [
	{
		title: "Launch plan",
		body: "Config and commands before they run.",
	},
	{
		title: "Deployment record",
		body: "RPC URL, chain ID, blockchain ID, subnet ID, VM ID, and status.",
	},
	{
		title: "Run history",
		body: "What ran, what passed, and what needs attention.",
	},
];

const avalancheValue = [
	"Test Avalanche L1 ideas without managing every CLI step by hand.",
	"Keep config, commands, RPC details, and logs in one flow.",
	"Start locally before moving toward Fuji Testnet.",
	"Share a clear launch record with teammates or reviewers.",
];

const comparisonRows = [
	{
		label: "Create config",
		manual: "Manual docs",
		tools: "Partial",
		avalaunch: "Built in",
	},
	{
		label: "Preview commands",
		manual: "Manual review",
		tools: "Not unified",
		avalaunch: "Built in",
	},
	{
		label: "Deploy local L1",
		manual: "CLI steps",
		tools: "Separate tools",
		avalaunch: "Built in",
	},
	{
		label: "Track IDs and logs",
		manual: "Scattered",
		tools: "Partial",
		avalaunch: "Built in",
	},
	{
		label: "Fuji path",
		manual: "Manual checklist",
		tools: "Fragmented",
		avalaunch: "Next release path",
	},
];

const faqs = [
	{
		question: "Who is this for?",
		answer:
			"Builders and teams testing Avalanche L1 ideas before they are ready for production infrastructure.",
	},
	{
		question: "Does this replace Avalanche CLI, AvaCloud, or Builder Console?",
		answer:
			"No. AvaLaunch sits above the launch workflow: it collects intent, previews the plan, gates execution, and tracks results.",
	},
	{
		question: "What works now?",
		answer:
			"Local Avalanche L1 launch flow, plan preview, approval gating, runner execution, persistence, logs, and management views.",
	},
	{
		question: "What is next?",
		answer:
			"Fuji Testnet deployment, runner hardening, hosted demo infrastructure, and public launch proof.",
	},
];

export function Home() {
	const pageRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [activeSection, setActiveSection] = useState("home");
	const [waitlistCount, setWaitlistCount] = useState(0);

	useEffect(() => {
		let cancelled = false;

		fetch("/api/waitlist")
			.then((response) => response.json() as Promise<WaitlistResult>)
			.then((result) => {
				if (!cancelled && result.count) {
					setWaitlistCount(result.count);
				}
			})
			.catch(() => {
				if (!cancelled) setWaitlistCount(0);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const page = pageRef.current;
		const video = videoRef.current;
		if (!page) return;
		const pageRoot = page;

		let started = false;

		function animateLines(
			selector: string,
			baseDelay: number,
			lineGap: number,
		) {
			const inners = pageRoot.querySelectorAll<HTMLElement>(selector);
			inners.forEach((inner, lineIndex) => {
				if (inner.dataset.split === "true") return;
				inner.dataset.split = "true";

				const lineDelay = baseDelay + lineIndex * lineGap;
				let charCount = 0;
				const textNodes: Text[] = [];
				const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT);
				let node = walker.nextNode();

				while (node) {
					textNodes.push(node as Text);
					node = walker.nextNode();
				}

				textNodes.forEach((textNode) => {
					const text = textNode.textContent ?? "";
					const frag = document.createDocumentFragment();

					for (const ch of text) {
						if (ch === " ") {
							frag.appendChild(document.createTextNode(" "));
							continue;
						}

						const span = document.createElement("span");
						span.className = "hero__char";
						span.textContent = ch;
						span.style.animationDelay = `${(lineDelay + charCount * CHAR_STEP).toFixed(3)}s`;
						frag.appendChild(span);
						charCount += 1;
					}

					textNode.parentNode?.replaceChild(frag, textNode);
				});
			});
		}

		function startAnimations() {
			if (started) return;
			started = true;
			document.body.classList.add("is-ready");
			animateLines(".hero__heading .hero__line-inner", 0.3, 0.85);
			animateLines(".hero__label .hero__line-inner", 0.3, 0.65);
			animateLines(".hero__desc .hero__line-inner", 0.3, 0.65);
		}

		let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
		const onCanPlayThrough = () => startAnimations();
		const onTimeUpdate = () => {
			if (video && video.currentTime >= 10) {
				video.currentTime = 0;
				video.play().catch(() => {});
			}
		};

		if (video) {
			video.play().catch(() => {});
			if (video.readyState >= 4) {
				startAnimations();
			} else {
				video.addEventListener("canplaythrough", onCanPlayThrough, {
					once: true,
				});
			}
			video.addEventListener("timeupdate", onTimeUpdate);
		}

		fallbackTimer = setTimeout(startAnimations, 5000);

		const snapSections = pageRoot.querySelectorAll<HTMLElement>(".snap-section");
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

				if (visible?.target.id) {
					setActiveSection(visible.target.id);
				}
			},
			{ threshold: [0.45, 0.6, 0.75] },
		);

		snapSections.forEach((section) => observer.observe(section));

		const onAnchorClick = (e: MouseEvent) => {
			const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
				'a[href^="#"]',
			);
			if (!anchor) return;

			const href = anchor.getAttribute("href") ?? "";
			e.preventDefault();

			if (href === "#") {
				window.scrollTo({ top: 0, behavior: "smooth" });
				return;
			}

			const target = document.querySelector(href);
			target?.scrollIntoView({ behavior: "smooth", block: "start" });
		};
		document.addEventListener("click", onAnchorClick);

		const scrollDown = document.getElementById("scrollDown");
		const onScrollDown = () => {
			const currentIndex = sections.findIndex(
				(section) => section.id === activeSection,
			);
			const next =
				sections[Math.min(Math.max(currentIndex, 0) + 1, sections.length - 1)];
			const fallback = sections[sections.length - 1];
			document
				.getElementById(next?.id ?? fallback?.id ?? "faq")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		};
		scrollDown?.addEventListener("click", onScrollDown);

		return () => {
			if (fallbackTimer) clearTimeout(fallbackTimer);
			if (video) {
				video.removeEventListener("canplaythrough", onCanPlayThrough);
				video.removeEventListener("timeupdate", onTimeUpdate);
			}
			observer.disconnect();
			document.removeEventListener("click", onAnchorClick);
			scrollDown?.removeEventListener("click", onScrollDown);
			document.body.classList.remove("is-ready");
		};
	}, [activeSection]);

	return (
		<div className="landing" ref={pageRef}>
			<div className="hero__bg hero__bg--fixed" aria-hidden="true">
				<video
					className="hero__video"
					ref={videoRef}
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
				>
					<source src={bodyVideo} type="video/mp4" />
				</video>
			</div>

			<header className="header">
				<a className="logo" href="#home" aria-label="AvaLaunch">
					<img
						className="logo__image"
						src="/avalaunch_branding_white.svg"
						alt="AvaLaunch"
					/>
				</a>

				<a className="btn btn--header" href="#waitlist">
					Join waitlist
					<ArrowIcon />
				</a>
			</header>

			<SideNav activeSection={activeSection} />

			<main className="landing-scroll">
				<section
					className={sectionClass("home", activeSection, "hero snap-section")}
					id="home"
				>
					<h1 className="hero__heading">
						<span className="hero__line">
							<span className="hero__line-inner">Launch an Avalanche</span>
						</span>
						<span className="hero__line">
							<span className="hero__line-inner">L1 from a</span>
						</span>
						<span className="hero__line">
							<span className="hero__line-inner">
								<em>Prompt</em>
							</span>
						</span>
					</h1>

					<div className="hero__bottom">
						<div className="hero__label">
							<span className="hero__line-inner">01 — AvaLaunch</span>
						</div>
						<p className="hero__desc">
							<span className="hero__line-inner">
								Describe your L1, review the launch plan,
							</span>{" "}
							<span className="hero__line-inner">
								approve execution, and save RPC details,
							</span>{" "}
							<span className="hero__line-inner">logs, and launch history.</span>
						</p>

						<div className="hero__actions">
							<a className="btn btn--footer" href="#waitlist">
								Get early access
								<ArrowIcon />
							</a>

							<button className="scroll-down" id="scrollDown" type="button">
								<span className="scroll-down__text">Scroll down</span>
								<span className="scroll-down__circle">
									<svg viewBox="0 0 7.222 8.667" fill="none">
										<path
											d="M3.611 1V7.667M3.611 7.667L1 5M3.611 7.667L6.222 5"
											stroke="currentColor"
											strokeWidth="1"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</span>
							</button>
						</div>

						<a className="about-card" href="#workflow">
							<div className="about-card__image">
								<img src={cardImage} alt="Abstract launch artifact" />
							</div>
							<div className="about-card__content">
								<div>
									<h3 className="about-card__title">Launch record</h3>
									<p className="about-card__text">
										{waitlistCount.toLocaleString()}+ builders on the private
										build list.
									</p>
								</div>
								<svg className="about-card__arrow" viewBox="0 0 77 13" fill="none">
									<path
										d="M1 6.5H75M75 6.5L70 1.5M75 6.5L70 11.5"
										stroke="currentColor"
										strokeWidth="1"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</a>
					</div>
				</section>

				<FullscreenSection activeSection={activeSection} id="problem">
					<div className="section-copy">
						<p className="section-kicker">Problem</p>
						<h2>Launching an Avalanche L1 still takes too much coordination.</h2>
					</div>
					<div className="metrics-grid">
						{problems.map((problem) => (
							<article className="glass-card metric-card" key={problem.value}>
								<div className="metric-value">{problem.value}</div>
								<p>{problem.label}</p>
							</article>
						))}
					</div>
				</FullscreenSection>

				<FullscreenSection activeSection={activeSection} id="workflow">
					<div className="section-copy">
						<p className="section-kicker">How it works</p>
						<h2>Prompt in. Launch plan out.</h2>
						<p>
							Describe the L1, review the plan, approve execution, and keep the
							result.
						</p>
					</div>
					<div className="steps-grid">
						{workflowSteps.map((step) => (
							<article className="glass-card step-card" key={step.number}>
								<div className="step-number">{step.number}</div>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</article>
						))}
					</div>
				</FullscreenSection>

				<FullscreenSection activeSection={activeSection} id="outputs">
					<div className="section-copy">
						<p className="section-kicker">Outputs</p>
						<h2>The launch details your team needs.</h2>
						<p>
							AvaLaunch keeps the plan, deployment metadata, and run history
							together.
						</p>
					</div>
					<div className="outputs-grid">
						{outputs.map((output) => (
							<article className="glass-card output-card" key={output.title}>
								<h3>{output.title}</h3>
								<p>{output.body}</p>
							</article>
						))}
					</div>
				</FullscreenSection>

				<FullscreenSection activeSection={activeSection} id="avalanche">
					<div className="split-grid">
						<div className="section-copy">
							<p className="section-kicker">Why Avalanche</p>
							<h2>Less ceremony between idea and L1.</h2>
							<p>
								Avalanche L1s give teams custom execution, gas tokens, validation
								rules, and dedicated throughput. AvaLaunch makes the first launch
								path easier to operate.
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
				</FullscreenSection>

				<FullscreenSection activeSection={activeSection} id="comparison">
					<div className="section-copy">
						<p className="section-kicker">Comparison</p>
						<h2>Better than stitching the launch together by hand.</h2>
						<p>
							AvaLaunch does not replace Avalanche tooling. It makes the launch
							workflow easier to run and review.
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
				</FullscreenSection>

				<FullscreenSection activeSection={activeSection} id="waitlist">
					<div className="waitlist-grid">
						<div className="section-copy">
							<p className="section-kicker">Early access</p>
							<h2>Get the private build.</h2>
							<p>
								For builders testing Avalanche L1 ideas and teams preparing a
								repeatable launch path.
							</p>
							<p className="waitlist-count">
								{waitlistCount.toLocaleString()}+ in waitlist
							</p>
						</div>
						<WaitlistForm onJoined={(count) => setWaitlistCount(count)} />
					</div>
				</FullscreenSection>

				<FullscreenSection activeSection={activeSection} id="faq">
					<div className="faq-grid">
						<div className="section-copy">
							<p className="section-kicker">FAQ</p>
							<h2>Before you join.</h2>
							<a className="btn btn--footer section-cta" href="#waitlist">
								Join waitlist
								<ArrowIcon />
							</a>
						</div>
						<div className="faq-list">
							{faqs.map((faq) => (
								<article className="glass-card faq-card" key={faq.question}>
									<h3>{faq.question}</h3>
									<p>{faq.answer}</p>
								</article>
							))}
						</div>
					</div>
					<footer className="site-footer">
						<img
							className="footer-logo"
							src="/avalaunch_branding_white.svg"
							alt="AvaLaunch"
						/>
						<span>Launch Avalanche L1s from a prompt.</span>
					</footer>
				</FullscreenSection>
			</main>
		</div>
	);
}

function FullscreenSection({
	activeSection,
	children,
	id,
}: {
	activeSection: string;
	children: ReactNode;
	id: (typeof sections)[number]["id"];
}) {
	return (
		<section className={sectionClass(id, activeSection, "snap-section")} id={id}>
			<div className="section-inner">{children}</div>
		</section>
	);
}

function sectionClass(id: string, activeSection: string, base: string) {
	const activeIndex = sections.findIndex((section) => section.id === activeSection);
	const index = sections.findIndex((section) => section.id === id);
	const state =
		index === activeIndex
			? "is-active"
			: index < activeIndex
				? "is-before"
				: "is-after";

	return `${base} ${state}`;
}

function SideNav({ activeSection }: { activeSection: string }) {
	return (
		<nav className="side-nav" aria-label="Sections">
			{sections.map((section) => (
				<a
					className={`side-nav__link ${
						activeSection === section.id ? "side-nav__link--active" : ""
					}`}
					href={`#${section.id}`}
					key={section.id}
				>
					<span className="side-nav__link-text">{section.label}</span>
					{activeSection === section.id ? <span className="side-nav__line" /> : null}
				</a>
			))}
		</nav>
	);
}

function WaitlistForm({ onJoined }: { onJoined: (count: number) => void }) {
	const [email, setEmail] = useState("");
	const [companyWebsite, setCompanyWebsite] = useState("");
	const [status, setStatus] = useState<WaitlistResult>({
		ok: true,
		status: 200,
		message: "No spam. Product access and changelogs only.",
	});
	const [isPending, setIsPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsPending(true);

		try {
			const response = await fetch("/api/waitlist", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					email,
					companyWebsite,
					source: "landing-page",
				}),
			});
			const result = (await response.json()) as WaitlistResult;

			setStatus(result);

			if (result.ok) {
				setEmail("");
				if (typeof result.count === "number") {
					onJoined(result.count);
				}
			}
		} catch {
			setStatus({
				ok: false,
				status: 503,
				message: "Waitlist is temporarily unavailable.",
			});
		} finally {
			setIsPending(false);
		}
	}

	return (
		<form className="waitlist-card" onSubmit={onSubmit}>
			<div className="waitlist-header">
				<span className="waitlist-badge">Early access</span>
							<p>Leave your email. We’ll send the private build and launch updates.</p>
			</div>
			<label className="field-shell">
				<span>Email</span>
				<input
					aria-label="Email address"
					autoComplete="email"
					inputMode="email"
					placeholder="team@company.com"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
			</label>
			<input
				aria-hidden="true"
				autoComplete="off"
				name="companyWebsite"
				onChange={(event) => setCompanyWebsite(event.target.value)}
				tabIndex={-1}
				type="text"
				value={companyWebsite}
				className="sr-only"
			/>
			<button className="waitlist-button" disabled={isPending} type="submit">
				{isPending ? "Saving..." : "Join waitlist"}
			</button>
			<p className={`form-status ${status.ok ? "success" : "error"}`}>
				{status.message}
			</p>
		</form>
	);
}

function ArrowIcon() {
	return (
		<svg className="btn__arrow" viewBox="0 0 8 8" fill="none">
			<path
				d="M1 7L7 1M7 1H2M7 1V6"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
