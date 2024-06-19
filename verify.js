const token = "";
const template = "QxGczWPDV7Hc";
const serverName = "Generated Server by Discord Bot"
const serversToGenerate = 1;

let count = serversToGenerate;

const data = {
    name: serverName,
    icon: null,
    channels: [],
    system_channel_id: null,
    guild_template_code: template
};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bot ${token}`
};

const createServer = () => {
    console.log(`[ SYSTEM ] Started to create a server...`);

    fetch(`https://discord.com/api/v9/guilds/templates/${data.guild_template_code}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            console.log(`[ ERROR ] Rate limited. Retrying after ${retryAfter} seconds.`);
            return new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
                .then(createServer);
        }
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errData)}`);
            });
        }
        return response.json();
    })
    .then(guildData => {
        return fetch(`https://discord.com/api/v9/channels/${guildData.system_channel_id}/invites`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ max_age: 86400 })
        });
    })
    .then(response => {
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            console.log(`[ ERROR ] Rate limited. Retrying after ${retryAfter} seconds.`);
            return new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
                .then(createServer);
        }
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errData)}`);
            });
        }
        return response.json();
    })
    .then(inviteData => {
        count--;
        console.log(`[ SYSTEM ] Server Created: https://discord.gg/${inviteData.code} || Remaining servers to create: ${count}`);
        if (count === 0) {
            clearInterval(interval);
            console.log(`[ SYSTEM ] All servers have been generated.`);
        }
    })
    .catch(error => {
        if (error.message.includes('30001')) {
            console.log("[ ERROR ] Maximum number of guilds reached. Stopping server creation.");
        } else {
            console.log("[ ERROR ] Failed to create server.");
            console.error(error);
        }
        clearInterval(interval);
    });
};

const interval = setInterval(() => {
    if (count > 0) {
        createServer();
    }
}, 10000);