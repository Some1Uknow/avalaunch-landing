import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
	joinWaitlist,
	readWaitlistCount,
	type WaitlistPayload,
} from "./waitlist-service";

export const getWaitlistCountFn = createServerFn({ method: "GET" }).handler(
	async () => readWaitlistCount(),
);

export const joinWaitlistFn = createServerFn({ method: "POST" })
	.validator((payload: WaitlistPayload) => payload)
	.handler(async ({ data }) => joinWaitlist(data, getRequest()));
