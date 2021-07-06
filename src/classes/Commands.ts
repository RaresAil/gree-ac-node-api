import { Obj, Status, StatusRaw } from '../@types';
import Crypto from '../utils/Crypto';

const parseCommand = (command: { t: string; [key: string]: any }) =>
  Buffer.from(JSON.stringify(command));

export const SCAN = parseCommand({ t: 'scan' });
export const BIND = (mac: string) => parseCommand({ t: 'bind', uid: 0, mac });

export const createRequest = (
  pack: string,
  mac: string,
  i: 0 | 1 = 0
): Buffer =>
  Buffer.from(
    JSON.stringify({
      cid: 'app',
      i,
      pack,
      t: 'pack',
      tcid: mac,
      uid: 0
    }),
    'utf-8'
  );

const generateCommand = (
  pack: {
    t: string;
    [key: string]: any;
  },
  mac: string,
  key: string
) => createRequest(Crypto.encrypt(parseCommand(pack), key), mac);

const Commands = {
  STATUS: (mac: string, key: string) =>
    generateCommand(
      {
        cols: [
          'Pow',
          'Mod',
          'SetTem',
          'WdSpd',
          'Air',
          'Blo',
          'Health',
          'SwhSlp',
          'Lig',
          'SwingLfRig',
          'SwUpDn',
          'Quiet',
          'Tur',
          'StHt',
          'TemUn',
          'HeatCoolType',
          'TemRec',
          'SvSt'
        ],
        mac,
        t: 'status'
      },
      mac,
      key
    ),
  CMD: (mac: string, key: string, data: Partial<Status>) =>
    generateCommand(
      {
        opt: Object.keys(data),
        p: Object.values(data),
        t: 'status'
      },
      mac,
      key
    )
};

export const CommandsOutput: Obj<Obj> = {
  STATUS: (pack: StatusRaw) => {
    return pack.cols.reduce((acc, key, index) => {
      return {
        ...acc,
        [key]: pack.dat[parseInt(index.toString())]
      };
    }, {});
  },
  CMD: ({ r }: { r: number }) => r === 200
};

export default Commands;
