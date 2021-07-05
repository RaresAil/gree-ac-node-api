/* eslint-disable no-useless-constructor */
export default abstract class PKCS7 {
  private constructor() {}

  private static PADDING = [
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
    [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    [9, 9, 9, 9, 9, 9, 9, 9, 9],
    [8, 8, 8, 8, 8, 8, 8, 8],
    [7, 7, 7, 7, 7, 7, 7],
    [6, 6, 6, 6, 6, 6],
    [5, 5, 5, 5, 5],
    [4, 4, 4, 4],
    [3, 3, 3],
    [2, 2],
    [1]
  ];

  public static pad(input: Buffer): Buffer {
    const padding = this.PADDING[input.byteLength % 16 || 0];
    const buffer = Buffer.alloc(input.byteLength + padding.length);

    buffer.set(input);
    buffer.set(padding, input.byteLength);

    return buffer;
  }

  public static removePad(input: Buffer): Buffer {
    return input.subarray(0, input.byteLength - input[input.byteLength - 1]);
  }
}
