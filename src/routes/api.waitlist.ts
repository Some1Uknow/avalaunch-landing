import { createFileRoute } from "@tanstack/react-router";
import { joinWaitlist, readWaitlistCount } from "../lib/waitlist-service";

export const Route = createFileRoute("/api/waitlist")({
	server: {
		handlers: {
			GET: async () => Response.json(await readWaitlistCount()),
			POST: async ({ request }) => {
				let payload: unknown;

				try {
					payload = await request.json();
				} catch {
					return Response.json(
						{
							ok: false,
							status: 400,
							message: "Send a valid request body.",
						},
						{ status: 400 },
					);
				}

				const result = await joinWaitlist(
					typeof payload === "object" && payload ? payload : {},
					request,
				);

				return Response.json(result, { status: result.status });
			},
		},
	},
});
