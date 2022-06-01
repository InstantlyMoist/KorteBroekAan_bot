const { Client, Location, List, Buttons, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const Enmap = require('enmap');
const qrcode = require('qrcode-terminal');
const { login } = require('./instagram_provider');
const fs = require('fs');

const whatsappClient = new Client({
    authTimeoutMs: 900000,
    puppeteer: { headless: true , args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    authStrategy: new LocalAuth({dataPath: './data/auth.json'}),
});

whatsappClient.commands = new Enmap();
whatsappClient.messagemedia = MessageMedia;

exports.login = () => {
    whatsappClient.initialize();
}

fs.readdir(__dirname + "/../commands/whatsapp/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(__dirname + "/../commands/whatsapp/" + file);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        whatsappClient.commands.set(commandName, props);
    });
});

whatsappClient.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('authenticated', () => {
    console.log('Client is authenticated!');
});

whatsappClient.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    const args = msg.body.slice('!'.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = whatsappClient.commands.get(command);
    if (!cmd) return;
    cmd.run(whatsappClient, msg, args);
});