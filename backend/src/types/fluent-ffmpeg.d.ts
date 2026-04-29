declare module 'fluent-ffmpeg' {
  interface FfmpegCommand {
    screenshots(options: any): FfmpegCommand;
    on(event: string, callback: (...args: any[]) => void): FfmpegCommand;
  }
  
  const ffmpeg: (input: string | Buffer) => FfmpegCommand;
  
  export = ffmpeg;
}
