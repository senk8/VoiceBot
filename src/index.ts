import { Message, Client, Intents} from 'discord.js'
import { joinVoiceChannel, VoiceConnection, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } from '@discordjs/voice'
import { createReadStream, readdir } from 'fs'
import * as dotenv from "dotenv"
dotenv.config()

const client = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']})
let vc: VoiceConnection

client.on('ready', () => {
  console.log(`${client.user?.tag} でログインしています。`)
})

client.on('messageCreate', async (msg: Message) => {
    const channnelId = msg.member?.voice.channelId as string
    const guildId = msg.guildId as string

    if (msg.content.startsWith('!con')) {
        if(!!msg.guild?.voiceAdapterCreator){
            vc = joinVoiceChannel({
                channelId: channnelId,
                guildId: guildId,
                adapterCreator: msg.guild.voiceAdapterCreator
            })
        }
    } else if (msg.content.startsWith('!playlist')) {
        const [ _ , title ] = msg.content.split(' ')
        const path = `${__dirname}/playlist/${title}`

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        }).on('error', error => {
            console.error('Error:', error.message)
        });
        const subscription = vc.subscribe(player);

        readdir(path, (err, files)=>{
            if (err) throw err;
            for( const file of files ){
                const resource = createAudioResource(createReadStream(`${path}/${file}`), { inlineVolume: true })
                resource.volume.setVolume(0.05);
                player.play(resource);

                player.on(AudioPlayerStatus.Idle, () => {});
           }
        });
    } else if (msg.content.startsWith('!play')) {
        const [ _ , title ] = msg.content.split(' ')
        const path = `${__dirname}/${title}.mp3`

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        }).on('error', error => {
        	console.error('Error:', error.message)
        });

        const resource = createAudioResource(createReadStream(path), { inlineVolume: true })
        resource.volume.setVolume(0.05);

        const subscription = vc.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log("play now");
            console.log("resource started:", resource.started);
        });
    } else if (msg.content.startsWith('!dc')){
       vc.destroy()
    }
})

client.login(process.env.DISCORD_PATH)