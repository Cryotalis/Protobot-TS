import {
    Client,
    Collection,
    ContextMenuCommandBuilder,
    GatewayIntentBits,
    Interaction,
    SlashCommandBuilder
} from 'discord.js'

type Command = {
    data: SlashCommandBuilder | ContextMenuCommandBuilder,
    execute: (interaction: Interaction) => Promise<void>
}

export class BotClient extends Client {
    public commands: Collection<string, Command>

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            rest: { timeout: 60000 }
        })
        this.commands = new Collection()
    }
}