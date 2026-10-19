// d:\Privatework\PCremote\ClientApp\src\services\DecoderService.ts - Web decoder (mostly pass-through for base64 JPEG)

export class DecoderService {
  /**
   * For web, we mostly just pass through base64 JPEG data
   * Real implementation would decode H.264/VP9 via WebCodecs or WASM
   */
  public decodeFrame(base64Data: string): string {
    // If already a data URL, return as-is
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }
    // Otherwise assume it's raw base64 JPEG
    return `data:image/jpeg;base64,${base64Data}`;
  }

  /**
   * Decode input event acknowledgment from host
   */
  public decodeAck(data: any): { success: boolean; message?: string } {
    return {
      success: data.success === true,
      message: data.message
    };
  }
}

export const decoderService = new DecoderService();