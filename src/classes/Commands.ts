const parseCommand = (command: { t: string; [key: string]: any }) =>
  Buffer.from(JSON.stringify(command));

export const SCAN = parseCommand({ t: 'scan' });
