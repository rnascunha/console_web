import { blob_to_hex, read_c_string, image_hash_compare } from '../utility';
import {
  chip_id,
  spi_flash_mode,
  spi_image_frequency,
  image_flash_size,
  ESP_IMAGE_HEADER_MAGIC,
  header_size,
  header_segment_size,
  ESP_APP_DESC_MAGIC_WORD,
  ESP_BOOTLOADER_DESC_MAGIC_BYTE,
  bootloader_description_size,
  description_size,
} from './constants';
import type {
  ESPImageHeader,
  ESPHeaderSegment,
  ESPImageBase,
  ESPAppDescription,
  ESPBootloaderDescription,
  ESPImageBootloader,
  ESPImageApp,
} from './types';
import { to_hex } from '../../../helper/number_format';
import { error_code, ESPError } from '../error';

function parse_header(header: ArrayBuffer): ESPImageHeader {
  const view = new DataView(header);
  const spi_mode = view.getUint8(2);
  const spi_speed = view.getUint8(3) & 0xf;
  const spi_size = (view.getUint8(3) >> 4) & 0xf;
  const chip_id_val = view.getUint16(12, true);

  return {
    magic: view.getUint8(0),
    segment_count: view.getUint8(1),
    spi_mode: {
      value: spi_mode,
      name: spi_mode in spi_flash_mode ? spi_flash_mode[spi_mode] : spi_mode,
    },
    spi_speed: {
      value: spi_speed,
      name:
        spi_speed in spi_image_frequency
          ? spi_image_frequency[spi_speed]
          : spi_speed,
    },
    spi_size: {
      value: spi_size,
      name:
        spi_size in image_flash_size ? image_flash_size[spi_size] : spi_size,
    },
    entry_addr: view.getUint32(4, true),
    wp_pin: view.getUint8(8),
    spi_pin_drv: header.slice(9, 12),
    chip_id: {
      value: chip_id_val,
      name: chip_id_val in chip_id ? chip_id[chip_id_val] : chip_id_val,
    },
    min_chip_rev: view.getUint8(14),
    min_chip_rev_full: view.getUint16(15, true),
    max_chip_rev_full: view.getUint16(17, true),
    hash_appended: view.getUint8(23),
  };
}

function parse_header_segment(seg: ArrayBuffer): ESPHeaderSegment {
  const arr = new Uint32Array(seg);
  return {
    load_addr: arr[0],
    data_len: arr[1],
  };
}

async function parse_image_base(image: ArrayBuffer): Promise<ESPImageBase> {
  const mw = new Uint8Array(image, 0, 1)[0];
  if (mw !== ESP_IMAGE_HEADER_MAGIC)
    throw new ESPError(
      error_code.WRONG_MAGIC_BYTE_HEADER,
      "Header magic byte doesn't match",
      `${to_hex(mw)} != ${to_hex(ESP_IMAGE_HEADER_MAGIC)}`
    );

  const header_buffer = image.slice(0, header_size);
  const header_segment = image.slice(
    header_size,
    header_size + header_segment_size
  );

  const data: ESPImageBase = {
    header: parse_header(header_buffer),
    header_segment: parse_header_segment(header_segment),
  };

  if (data.header.hash_appended === 1) {
    try {
      data.hash = await image_hash_compare(image);
    } catch (e) {
      if (!(e instanceof ESPError) || e.code !== error_code.NOT_SUPPORTED)
        throw e;
    }
  }

  return data;
}

function parse_app_description(description: ArrayBuffer): ESPAppDescription {
  const magic_word = new Uint32Array(description, 0, 1)[0];
  if (magic_word !== ESP_APP_DESC_MAGIC_WORD)
    throw new ESPError(
      error_code.WRONG_MAGIC_WORD_APP,
      "App description magic word doesn't match",
      `${to_hex(magic_word)} != ${to_hex(ESP_APP_DESC_MAGIC_WORD)}`
    );

  return {
    magic_word,
    secure_version: new Uint32Array(description, 4, 1)[0],
    version: read_c_string(
      new TextDecoder().decode(new Uint8Array(description, 16, 32))
    ),
    project_name: read_c_string(
      new TextDecoder().decode(new Uint8Array(description, 48, 32))
    ),
    time: read_c_string(
      new TextDecoder().decode(new Uint8Array(description, 80, 16))
    ),
    date: read_c_string(
      new TextDecoder().decode(new Uint8Array(description, 96, 16))
    ),
    idf_ver: read_c_string(
      new TextDecoder().decode(new Uint8Array(description, 112, 32))
    ),
    app_elf_sha256: blob_to_hex(description.slice(144, 176)),
  };
}

function parse_bootloader_description(
  desc: ArrayBuffer
): ESPBootloaderDescription {
  const dv = new DataView(desc);
  const magic_byte = dv.getUint8(0);
  if (magic_byte !== ESP_BOOTLOADER_DESC_MAGIC_BYTE)
    throw new ESPError(
      error_code.WRONG_MAGIC_BYTE_BOOTLOADER,
      "Bootloader magic byte doesn't match",
      `${to_hex(magic_byte)} != ${to_hex(ESP_BOOTLOADER_DESC_MAGIC_BYTE)}`
    );

  return {
    magic_byte,
    version: dv.getUint32(4),
    idf_ver: read_c_string(
      new TextDecoder().decode(new Uint8Array(desc, 8, 32))
    ),
    date_time: read_c_string(
      new TextDecoder().decode(new Uint8Array(desc, 40, 24))
    ),
  };
}

export async function esp_image(image: ArrayBuffer): Promise<ESPImageApp> {
  const base: ESPImageBase = await parse_image_base(image);
  const description = image.slice(
    header_size + header_segment_size,
    header_size + header_segment_size + description_size
  );

  return {
    ...base,
    description: parse_app_description(description),
  };
}

export async function esp_bootloader(
  image: ArrayBuffer
): Promise<ESPImageBootloader> {
  const base: ESPImageBase = await parse_image_base(image);
  const desc = image.slice(
    header_size + header_segment_size,
    header_size + header_segment_size + bootloader_description_size
  );

  try {
    return {
      ...base,
      description: parse_bootloader_description(desc),
    };
  } catch (e) {
    return base;
  }
}
