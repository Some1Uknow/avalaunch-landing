import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "AvaLaunch - Launch Avalanche L1s from a prompt" },
			{
				name: "description",
				content:
					"AvaLaunch collects chain config, previews launch plans, gates execution, and stores RPC details, logs, and launch history for Avalanche L1 builders.",
			},
			{
				property: "og:title",
				content: "AvaLaunch - Launch Avalanche L1s from a prompt",
			},
			{
				property: "og:description",
				content:
					"Prompt, review, approve, and track Avalanche L1 launches with AvaLaunch.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:image", content: "/og.png" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.png", type: "image/png" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,700;0,800;1,400;1,700&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
