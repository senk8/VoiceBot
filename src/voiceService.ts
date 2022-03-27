import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { createReadStream, readdir } from "fs";

const PLAYER_TIME_OUT_DURATION = 300000

export class VoiceService {
    vc: VoiceConnection
    player: AudioPlayer

    constructor(channelId: string, guildId: string, creator: DiscordGatewayAdapterCreator){
        this.vc = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: creator
        })
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        }).on('error', error => {
            console.error('Error:', error.message)
        });
        this.vc.subscribe(this.player);
    }

    play(title: string){
        const path = `${__dirname}/${title}.mp3`

        const resource = createAudioResource(createReadStream(path), { inlineVolume: true })
        resource.volume.setVolume(0.05);

        this.player.play(resource);
    }

    playlist(title: string){
        const path = `${__dirname}/playlist/${title}`

        readdir(path, async (err, files)=>{
            if (err) throw err;
            for( const file of files ){
                const resource = createAudioResource(createReadStream(`${path}/${file}`), { inlineVolume: true })
                resource.volume.setVolume(0.05);
                this.player.play(resource);

                //this.player.on(AudioPlayerStatus.Playing, () => {
                //    msg.channel.send(`${file}を再生します。`)
                //});

                await entersState(this.player, AudioPlayerStatus.Idle, PLAYER_TIME_OUT_DURATION)
           }
        });
    }

    destroy(){
        this.vc.destroy()
    }
}