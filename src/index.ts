import { Message, Client, Intents} from 'discord.js'
import {  AudioPlayerStatus } from '@discordjs/voice'
import * as dotenv from "dotenv"
import { TTSClient } from './ttsClient'
import { VoiceService } from './voiceService'
dotenv.config()

const client = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES']})
let voice: VoiceService

client.on('ready', () => {
  console.log(`${client.user?.tag} でログインしています。`)
})

client.on('messageCreate', async (msg: Message) => {
    if(msg.author.bot)return
    const channnelId = msg.member?.voice.channelId
    if(!channnelId)return
    const guildId = msg.guildId
    if(!guildId)return

    if (msg.content.startsWith('!con')) {
        if(!!msg.guild?.voiceAdapterCreator){
            voice = new VoiceService(channnelId, guildId, msg.guild.voiceAdapterCreator)
        }
    } 
    if(!voice) return

    const tts = new TTSClient(voice.player)
    if (msg.content.startsWith('!playlist')) {
        const [ _ , title ] = msg.content.split(' ')
        voice.playlist(title)
    } else if (msg.content.startsWith('!play')) {
        const [ _ , title ] = msg.content.split(' ')
        voice.play(title)

        voice.player.on(AudioPlayerStatus.Playing, () => {
            msg.channel.send(`${title}を再生します。`)
        });
    } else if (msg.content.startsWith('!dc')){
        voice.destroy()
    } else {
        tts.speech(msg.content)
    }
})

client.login(process.env.DISCORD_PATH)