import { blob_to_hex, read_c_string } from '../utility';
import { error_code, ESPError } from '../error';
import { byte_size, to_hex } from '../../../helper/number_format';
import { ArrayBuffer as MD5Digest } from 'spark-md5';
import type { ESPValue } from './types';

export enum ParititonType {
  APP = 0x00,
  DATA = 0x01,
  END = 0xff,
}

export enum PartitionAppSubtype {
  FACTORY = 0x00, // Factory application partition
  OTA_0 = 0x10, // OTA partition 0
  OTA_1 = OTA_0 + 1, // OTA partition 1
  OTA_2 = OTA_0 + 2, // OTA partition 2
  OTA_3 = OTA_0 + 3, // OTA partition 3
  OTA_4 = OTA_0 + 4, // OTA partition 4
  OTA_5 = OTA_0 + 5, // OTA partition 5
  OTA_6 = OTA_0 + 6, // OTA partition 6
  OTA_7 = OTA_0 + 7, // OTA partition 7
  OTA_8 = OTA_0 + 8, // OTA partition 8
  OTA_9 = OTA_0 + 9, // OTA partition 9
  OTA_10 = OTA_0 + 10, // OTA partition 10
  OTA_11 = OTA_0 + 11, // OTA partition 11
  OTA_12 = OTA_0 + 12, // OTA partition 12
  OTA_13 = OTA_0 + 13, // OTA partition 13
  OTA_14 = OTA_0 + 14, // OTA partition 14
  OTA_15 = OTA_0 + 15, // OTA partition 15
  OTA_MAX = OTA_0 + 16, // Max subtype of OTA partition
  TEST = 0x20, // Test application partition

  APP_ANY = 0xff, // Used to search for partitions with any subtype
}

export enum PartitionDataSubtype {
  OTA = 0x00, // OTA selection partition
  PHY = 0x01, // PHY init data partition
  NVS = 0x02, // NVS partition
  COREDUMP = 0x03, // COREDUMP partition
  NVS_KEYS = 0x04, // Partition for NVS keys
  EFUSE_EM = 0x05, // Partition for emulate eFuse bits
  UNDEFINED = 0x06, // Undefined (or unspecified) data partition

  ESPHTTPD = 0x80, // ESPHTTPD partition
  FAT = 0x81, // FAT partition
  SPIFFS = 0x82, // SPIFFS partition
  LITTLEFS = 0x83, // LITTLEFS partition

  DATA_ANY = 0xff, // Used to search for partitions with any subtype
}

// https://github.com/espressif/esp-idf/blob/a7fbf452fa181452f266b16c49063e2ff069f119/components/bootloader_support/include/esp_flash_partitions.h#L69C1-L84C24
// typedef struct {
//   uint32_t offset;
//   uint32_t size;
// } esp_partition_pos_t;

// /* Structure which describes the layout of partition table entry.
// * See docs/partition_tables.rst for more information about individual fields.
// */
// typedef struct {
//   uint16_t magic;
//   uint8_t  type;
//   uint8_t  subtype;
//   esp_partition_pos_t pos;
//   uint8_t  label[16];
//   uint32_t flags;
// } esp_partition_info_t;

export interface Partition {
  magic: ESPValue;
  type: ESPValue;
  subtype: ESPValue;
  address: ESPValue;
  size: ESPValue;
  label: string;
  encrypted: boolean;
  readonly: boolean;
}

export interface ParitionHash {
  magic: ESPValue;
  type: ESPValue;
  hash: string;
}

const ESP_PARTITION_MAGIC = 0x50aa;
const ESP_PARTITION_MAGIC_MD5 = 0xebeb;
const PARTITION_TABLE_SIZE = 32;
const ESP_PARTITION_MD5_OFFSET = 16;

export interface Partitions {
  partitions: Partition[];
  hash?: ParitionHash;
}

function type_to_string(type: ParititonType): string {
  return ParititonType[type] ?? to_hex(type);
}

function app_subtype_to_string(subtype: PartitionAppSubtype): string {
  return PartitionAppSubtype[subtype] ?? to_hex(subtype);
}

function data_subtype_to_string(subtype: PartitionDataSubtype): string {
  return PartitionDataSubtype[subtype] ?? to_hex(subtype);
}

export function parse_partition_table(
  buffer: ArrayBuffer
): Partition | ParitionHash {
  if (buffer.byteLength < PARTITION_TABLE_SIZE)
    throw new ESPError(error_code.SIZE_TOO_SMALL, 'Buffer size too small');

  const dv = new DataView(buffer);
  const magic = dv.getUint16(0, true);
  if (magic !== ESP_PARTITION_MAGIC) {
    if (magic !== ESP_PARTITION_MAGIC_MD5)
      throw new ESPError(
        error_code.WRONG_MAGIC_WORD_PARTITION_TABLE,
        'Wrong magic word partition table',
        to_hex(magic)
      );
    return {
      magic: {
        value: magic,
        name: to_hex(magic),
      },
      type: {
        value: ParititonType.END,
        name: type_to_string(ParititonType.END),
      },
      hash: blob_to_hex(
        buffer.slice(ESP_PARTITION_MD5_OFFSET, PARTITION_TABLE_SIZE)
      ),
    };
  }

  const type = dv.getUint8(2);
  return {
    magic: {
      value: magic,
      name: to_hex(magic),
    },
    type: {
      value: type,
      name: type_to_string(type),
    },
    subtype: {
      value: dv.getUint8(3),
      name:
        type === ParititonType.APP
          ? app_subtype_to_string(dv.getUint8(3))
          : data_subtype_to_string(dv.getUint8(3)),
    },
    address: {
      value: dv.getUint32(4, true),
      name: to_hex(dv.getUint32(4, true)),
    },
    size: {
      value: dv.getUint32(8, true),
      name: byte_size(dv.getUint32(8, true)),
    },
    label: read_c_string(
      new TextDecoder().decode(new Uint8Array(buffer, 12, 16))
    ),
    encrypted: (dv.getUint32(28, true) & (1 << 0)) !== 0,
    readonly: (dv.getUint32(28, true) & (1 << 1)) !== 0,
  };
}

export function parse_partition_tables(buffer: ArrayBuffer): Partitions {
  const partitions: Partitions = { partitions: [] };
  const digest = new MD5Digest();
  try {
    while (true) {
      const p = parse_partition_table(buffer);
      if ('hash' in p) {
        const hash = digest.end();
        if (hash !== p.hash)
          throw new ESPError(error_code.HASH_NOT_MATCH, 'Hash not match', [
            hash,
            p.hash,
          ]);
        partitions.hash = p;
        break;
      }
      partitions.partitions.push(p);
      digest.append(buffer.slice(0, PARTITION_TABLE_SIZE));
      buffer = buffer.slice(PARTITION_TABLE_SIZE);
    }
  } catch (e) {
    const err = e as ESPError;
    console.error(
      `Error! ${err.message} [${err.code}] [${err.args as string}]`
    );
  }
  return partitions;
}
