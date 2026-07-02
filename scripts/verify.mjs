#!/usr/bin/env node
/**
 * Headless verification for the AvaLaunch full-screen landing.
 *
 * Drives an already-running dev server (default http://localhost:5199/) and
 * checks the cinematic hero, full-screen section stack, sidebar tracking,
 * transition states, and waitlist API surface.
 */
import { createRequire } from "node:module";

const URL = process.argv[2] || "http://localhost:5199/";
const require = createRequire(import.meta.url);

let chromium;
try {
	({ chromium } = require("playwright"));
} catch {
	({
		chromium,
	} = require("../../scripts/record-demos/node_modules/playwright/index.js"));
}

const results = [];
const ok = (name) => results.push({ name, pass: true });
const fail = (name, detail) => results.push({ name, pass: false, detail });
const assert = (cond, name, detail) => (cond ? ok(name) : fail(name, detail));

async function main() {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({
		viewport: { width: 1280, height: 800 },
	});

	const consoleErrors = [];
	const pageErrors = [];
	page.on("console", (m) => {
		if (m.type() === "error") consoleErrors.push(m.text());
	});
	page.on("pageerror", (e) => pageErrors.push(e.message));

	const resp = await page.goto(URL, { waitUntil: "load", timeout: 60000 });
	assert(resp && resp.status() === 200, "page returns HTTP 200", resp?.status());

	const structure = await page.evaluate(() => {
		const sections = [...document.querySelectorAll(".snap-section")].map(
			(section) => ({
				id: section.id,
				height: Math.round(section.getBoundingClientRect().height),
				state: section.className,
			}),
		);

		return {
			title: document.title,
			sections,
			sideLinks: document.querySelectorAll(".side-nav__link").length,
			activeSide: document.querySelector(".side-nav__link--active")?.textContent,
			navLinks: document.querySelectorAll(".nav-pill__link").length,
			hero: document.querySelectorAll(".hero").length,
			video: document.querySelectorAll("video.hero__video").length,
			videoOpacity: document.querySelector("video.hero__video")
				? getComputedStyle(document.querySelector("video.hero__video")).opacity
				: "",
			source:
				document.querySelector("video.hero__video source")?.getAttribute("src") ||
				"",
			blurLayers: document.querySelectorAll(".hero__blur-layer").length,
			globalShades: document.querySelectorAll(
				".page-vignette,.hero__overlay--fixed,.hero__blur,.hero__blur-bar",
			).length,
			logoSrc: document.querySelector(".logo__image")?.getAttribute("src") || "",
			headingLines: document.querySelectorAll(".hero__heading .hero__line")
				.length,
			waitlistForm: document.querySelectorAll(".waitlist-card").length,
			honeypot: document.querySelectorAll('input[name="companyWebsite"]').length,
			comparisonRows: document.querySelectorAll(".comparison-row").length,
			faqCards: document.querySelectorAll(".faq-card").length,
			footerLogo:
				document.querySelector(".footer-logo")?.getAttribute("src") || "",
			cardStyle: (() => {
				const card = document.querySelector(".metric-card");
				if (!card) return null;
				const style = getComputedStyle(card);
				return {
					background: style.backgroundColor,
					borderRadius: style.borderRadius,
					color: style.color,
				};
			})(),
		};
	});

	assert(
		structure.title.includes("AvaLaunch"),
		"document title is AvaLaunch",
		structure.title,
	);
	assert(structure.sections.length === 8, "8 full-screen sections", structure.sections);
	assert(
		structure.sections.every((section) => section.height === 800),
		"each section is one viewport tall",
		structure.sections,
	);
	assert(structure.sideLinks === 8, "8 sidebar section links", structure.sideLinks);
	assert(structure.navLinks === 0, "middle top nav removed", structure.navLinks);
	assert(
		structure.sections.some((section) => section.id === "problem"),
		"problem section rendered",
		structure.sections,
	);
	assert(structure.hero === 1, "single hero section", structure.hero);
	assert(structure.video === 1, "one background video", structure.video);
	assert(structure.videoOpacity === "0.58", "video background opacity lowered", structure.videoOpacity);
	assert(/body\-.+\.mp4|body\.mp4/.test(structure.source), "video source present", structure.source);
	assert(structure.blurLayers === 0, "hero blur layers removed", structure.blurLayers);
	assert(structure.globalShades === 0, "global shade overlays removed", structure.globalShades);
	assert(
		/avalaunch_branding_white\.svg/.test(structure.logoSrc),
		"official AvaLaunch wordmark asset rendered",
		structure.logoSrc,
	);
	assert(structure.headingLines === 3, "3 headline lines", structure.headingLines);
	assert(structure.waitlistForm === 1, "waitlist form rendered", structure.waitlistForm);
	assert(structure.honeypot === 1, "honeypot input rendered", structure.honeypot);
	assert(structure.comparisonRows === 6, "comparison table rows rendered", structure.comparisonRows);
	assert(structure.faqCards === 4, "FAQ cards rendered", structure.faqCards);
	assert(
		/avalaunch_branding_white\.svg/.test(structure.footerLogo),
		"footer uses official AvaLaunch wordmark",
		structure.footerLogo,
	);
	assert(
		structure.cardStyle?.background === "rgb(255, 255, 255)" &&
			structure.cardStyle.borderRadius === "0px",
		"post-hero cards use flat white square styling",
		structure.cardStyle,
	);

	await page.waitForFunction(() => document.body.classList.contains("is-ready"), {
		timeout: 8000,
	});
	ok("body gains .is-ready after video/fallback");

	const reveal = await page.evaluate(() => ({
		charCount: document.querySelectorAll(".hero__heading .hero__char").length,
		labelChars: document.querySelectorAll(".hero__label .hero__char").length,
		descChars: document.querySelectorAll(".hero__desc .hero__char").length,
	}));
	assert(reveal.charCount > 25, "headline split into animated chars", reveal);
	assert(reveal.labelChars > 0, "label split into animated chars", reveal);
	assert(reveal.descChars > 0, "description split into animated chars", reveal);

	await page.click('a[href="#workflow"]');
	await page.waitForFunction(
		() =>
			document.querySelector("#workflow")?.classList.contains("is-active") &&
			document
				.querySelector('.side-nav__link[href="#workflow"]')
				?.classList.contains("side-nav__link--active"),
		{ timeout: 5000 },
	);
	ok("sidebar tracks clicked workflow section");

	const transitionState = await page.evaluate(() => ({
		home: document.querySelector("#home")?.className,
		workflow: document.querySelector("#workflow")?.className,
		outputs: document.querySelector("#outputs")?.className,
		workflowTransform: getComputedStyle(
			document.querySelector("#workflow .section-inner"),
		).transform,
	}));
	assert(
		transitionState.home?.includes("is-before"),
		"previous section marked before",
		transitionState,
	);
	assert(
		transitionState.workflow?.includes("is-active"),
		"current section marked active",
		transitionState,
	);
	assert(
		transitionState.outputs?.includes("is-after"),
		"next section marked after",
		transitionState,
	);

	await page.click('a[href="#comparison"]');
	await page.waitForFunction(
		() => document.querySelector("#comparison")?.classList.contains("is-active"),
		{ timeout: 5000 },
	);
	const comparisonFit = await page.evaluate(() => {
		const table = document.querySelector(".comparison-table");
		const section = document.querySelector("#comparison");
		if (!table || !section) return null;
		const tableRect = table.getBoundingClientRect();
		const sectionRect = section.getBoundingClientRect();
		return {
			tableBottom: Math.round(tableRect.bottom),
			sectionBottom: Math.round(sectionRect.bottom),
			fits: tableRect.bottom <= sectionRect.bottom,
		};
	});
	assert(
		comparisonFit?.fits,
		"comparison table fits within its section",
		comparisonFit,
	);

	const apiBase = `${URL.replace(/\/$/, "")}/api/waitlist`;
	const apiGet = await page.request.get(apiBase);
	assert(apiGet.status() === 200, "waitlist GET returns 200", apiGet.status());

	const apiInvalid = await page.request.post(apiBase, {
		data: { email: "not-an-email", companyWebsite: "", source: "verify" },
	});
	assert(apiInvalid.status() === 400, "waitlist invalid email returns 400", apiInvalid.status());

	const verifyEmail = `verify-${Date.now()}@example.com`;
	const apiValid = await page.request.post(apiBase, {
		data: { email: verifyEmail, companyWebsite: "", source: "verify" },
	});
	const validBody = await apiValid.json();
	assert(
		apiValid.status() === 200 && validBody.message === "You are on the list.",
		"waitlist valid email succeeds",
		{ status: apiValid.status(), body: validBody },
	);

	const apiDuplicate = await page.request.post(apiBase, {
		data: { email: verifyEmail, companyWebsite: "", source: "verify" },
	});
	const duplicateBody = await apiDuplicate.json();
	assert(
		apiDuplicate.status() === 200 &&
			duplicateBody.message === "You are already on the list.",
		"waitlist duplicate email succeeds with duplicate message",
		{ status: apiDuplicate.status(), body: duplicateBody },
	);

	const apiHoneypot = await page.request.post(apiBase, {
		data: {
			email: `bot-${Date.now()}@example.com`,
			companyWebsite: "https://spam.example",
			source: "verify",
		},
	});
	const honeypotBody = await apiHoneypot.json();
	assert(
		apiHoneypot.status() === 200 && honeypotBody.message === "You are on the list.",
		"waitlist honeypot exits with success",
		{ status: apiHoneypot.status(), body: honeypotBody },
	);

	assert(
		consoleErrors.length === 0,
		"no console errors",
		consoleErrors.slice(0, 3),
	);
	assert(pageErrors.length === 0, "no page errors", pageErrors.slice(0, 3));

	await browser.close();

	let failed = 0;
	for (const r of results) {
		if (r.pass) {
			console.log(`  PASS  ${r.name}`);
		} else {
			failed++;
			console.log(`  FAIL  ${r.name}  ->  ${JSON.stringify(r.detail)}`);
		}
	}
	console.log(`\n${results.length - failed}/${results.length} checks passed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error("verify crashed:", error);
	process.exit(1);
});
