import { AudioPlayer, createAudioResource } from '@discordjs/voice';
import * as textToSpeech from '@google-cloud/text-to-speech'
import { Readable } from 'stream'

export class TTSClient {
  private client: textToSpeech.TextToSpeechClient
  private player: AudioPlayer 

  constructor(player: AudioPlayer){
    this.client = new textToSpeech.TextToSpeechClient();
    this.player = player
  }

  async speech(text: string) {
    const request = {
      input: new textToSpeech.protos.google.cloud.texttospeech.v1.SynthesisInput({text: text}),
      voice: new textToSpeech.protos.google.cloud.texttospeech.v1.VoiceSelectionParams({languageCode: 'ja', ssmlGender: 'FEMALE'}),
      audioConfig: new textToSpeech.protos.google.cloud.texttospeech.v1.AudioConfig({audioEncoding: 'MP3'}),
    };

    const [response] = await this.client.synthesizeSpeech(request);
    if(!response.audioContent) return

    const stream = Readable.from(response.audioContent)
    const resource = createAudioResource(stream, { inlineVolume: true })
    resource.volume.setVolume(0.05);

    this.player.play(resource);
  }
}