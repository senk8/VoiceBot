import { AudioPlayer, createAudioResource } from '@discordjs/voice';
import * as textToSpeech from '@google-cloud/text-to-speech'
import { Readable } from 'stream'
import { VoiceService } from './voiceService';

export class TTSClient {
  private client: textToSpeech.TextToSpeechClient
  private voice: VoiceService 

  constructor(voice: VoiceService){
    this.client = new textToSpeech.TextToSpeechClient();
    this.voice = voice
  }

  async speech(text: string) {
    const request = {
      input: new textToSpeech.protos.google.cloud.texttospeech.v1.SynthesisInput({text: text}),
      voice: new textToSpeech.protos.google.cloud.texttospeech.v1.VoiceSelectionParams({languageCode: 'ja', ssmlGender: 'FEMALE'}),
      audioConfig: new textToSpeech.protos.google.cloud.texttospeech.v1.AudioConfig({audioEncoding: 'MP3'}),
    };

    const [response] = await this.client.synthesizeSpeech(request);
    if(!response.audioContent) return

    this.voice.playWithBytes(response.audioContent);
  }
}