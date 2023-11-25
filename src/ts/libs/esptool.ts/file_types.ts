interface ESPFileTypeInfo {
  name: string;
  type: string;
  offset: number;
}

export const files_info: Record<string, ESPFileTypeInfo> = {
  app: {
    name: 'app.bin',
    type: 'app',
    offset: 0x10000,
  },
  bootloader: {
    name: 'bootloader/bootloader.bin',
    type: 'bootloader',
    offset: 0x1000,
  },
  partition_table: {
    name: 'partition_table/partition-table.bin',
    type: 'partition-table',
    offset: 0x8000,
  },
  otadata: {
    name: 'ota_data_initial.bin',
    type: 'otadata',
    offset: 0xd000,
  },
};

const file_type = Object.values(files_info).map(f => f.type);
export type ESPFileType = (typeof file_type)[number];

export interface ESPFlashFile {
  offset: string;
  name: string;
  file: File;
  type: ESPFileType;
  buffer?: ArrayBuffer;
  select?: boolean;
}
