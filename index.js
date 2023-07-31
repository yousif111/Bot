const { Client, GatewayIntentBits, Partials, AttachmentBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ],

    partials: [
        Partials.Message
    ]
});

const { token, prefix, allowedExtensions } = require('./config/config.json');
const messages = require('./config/messages.json');
const getExtension = require('./functions/getExtension');
const { html_beautify } = require('js-beautify');

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const file = message.attachments.first()?.url;
    if (!file) return message.reply({ content: `${messages.noFile}` });
    const fileExtension = getExtension(file);
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) return message.reply({ content: `${messages.invaildFormat.replace('${currentExtension}', fileExtension)}` });

    try {
        const response = await fetch(file);
        if (!response.ok) return message.reply({ content: `${messages.errorFetching.replace('{error}', `${response.statusText}`)}` });

        const text = await response.text();

        if (text) {
            const beautified = html_beautify(text);

            const attachment = new AttachmentBuilder(Buffer.from(beautified, 'utf-8'), { name: `${messages.outputFileName.replace('${fileExtension}', fileExtension)}` });
            return message.reply({ content: `${messages.beautifiedReply}`, files: [attachment] });
        }
    } catch (error) {
        console.log(error);
    }
});

client.once('ready', () => {
    console.log('Prettifier is ready!');
});

client.login(token);