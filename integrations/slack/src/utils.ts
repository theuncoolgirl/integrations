import removeMarkdown from 'remove-markdown';

import { SlackInstallationConfiguration } from './configuration';

export function stripMarkdown(text: string) {
    return removeMarkdown(text);
}

export async function getInstallationConfig(context, externalId) {
    const { api, environment } = context;

    // Lookup the concerned installations
    // cache this?
    const {
        data: { items: installations },
    } = await api.integrations.listIntegrationInstallations(environment.integration.name, {
        externalId,
    });

    /**
     * TODO: Prompt user to select a GitBook installation if there is more than one.
     * by showing org names in a dropdown and asking user to pick one
     */
    const installation = installations[0];
    if (!installation) {
        return {};
    }

    const accessToken = (installation.configuration as SlackInstallationConfiguration)
        .oauth_credentials?.access_token;

    return {
        accessToken,
    };
}

export async function parseEventPayload(req: Request) {
    // Clone the request so its body is still available to the fallback
    const event = await req
        .clone()
        .json<{ event?: { type: string; [key: string]: any }; type?: string }>(); // TODO: untyping this for now

    return event;
}

export async function parseCommandPayload(req: Request) {
    // Clone the request so its body is still available to the fallback
    const requestText = await req.clone().text();

    const event = Object.fromEntries(new URLSearchParams(requestText).entries());

    return event;
}

export async function parseActionPayload(req: Request) {
    // Clone the request so its body is still available to the fallback// Clone the request so its body is still available to the fallback
    const requestText = await req.clone().text();

    const shortcutEvent = Object.fromEntries(new URLSearchParams(requestText).entries());
    const shortcutPayload = JSON.parse(shortcutEvent.payload);

    return shortcutPayload;
}

export function stripBotName(text: string, botName: string) {
    return text.split(new RegExp(`^.*<@${botName}> `)).join('');
}

export function getActionNameAndType(actionId: string) {
    const [actionName, actionPostType = 'ephemeral'] = actionId.split(':');

    return { actionName, actionPostType };
}