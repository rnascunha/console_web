import {
  hex_sha256,
  blob_to_hex,
  digest_support,
  read_c_string,
} from './utility';
import * as espt from './types';
import { error_code, ESPError } from './error';

function parse_header(header: ArrayBuffer): espt.ESPImageHeader {
  const view = new DataView(header);
  const spi_mode = view.getUint8(2);
  const spi_speed = view.getUint8(3) & 0xf;
  const spi_size = (view.getUint8(3) >> 4) & 0xf;
  const chip_id = view.getUint16(12, true);

  return {
    magic: view.getUint8(0),
    segment_count: view.getUint8(1),
    spi_mode: {
      value: spi_mode,
      name:
        spi_mode in espt.spi_flash_mode
          ? espt.spi_flash_mode[spi_mode]
          : spi_mode,
    },
    spi_speed: {
      value: spi_speed,
      name:
        spi_speed in espt.spi_image_frequency
          ? espt.spi_image_frequency[spi_speed]
          : spi_speed,
    },
    spi_size: {
      value: spi_size,
      name:
        spi_size in espt.image_flash_size
          ? espt.image_flash_size[spi_size]
          : spi_size,
    },
    entry_addr: view.getUint32(4, true),
    wp_pin: view.getUint8(8),
    spi_pin_drv: header.slice(9, 12),
    chip_id: {
      value: chip_id,
      name: chip_id in espt.esp_chid_id ? espt.esp_chid_id[chip_id] : chip_id,
    },
    min_chip_rev: view.getUint8(14),
    hash_appended: view.getUint8(23),
  };
}

function parse_header_segment(seg: ArrayBuffer): espt.ESPHeaderSegment {
  const arr = new Uint32Array(seg);
  return {
    load_addr: arr[0],
    data_len: arr[1],
  };
}

function parse_description(
  description: ArrayBuffer
): espt.ESPImageAppDescription {
  return {
    magic_word: new Uint32Array(description, 0, 1)[0],
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

function esp_image_parse(image: ArrayBuffer): espt.ESPImageParsed {
  const mw = new Uint8Array(image, 0, 1)[0];
  if (mw !== espt.ESP_IMAGE_HEADER_MAGIC) {
    throw new ESPError(
      error_code.WRONG_MAGIC_WORD,
      "Image header magic word doesn't match",
      `0x${mw
        .toString(16)
        .padStart(2, '0')} != 0x${espt.ESP_IMAGE_HEADER_MAGIC.toString(
        16
      ).padStart(2, '0')}`
    );
  }

  const header = image.slice(0, espt.header_size);
  const header_segment = image.slice(
    espt.header_size,
    espt.header_size + espt.header_segment_size
  );
  const description = image.slice(
    espt.header_size + espt.header_segment_size,
    espt.header_size + espt.header_segment_size + espt.description_size
  );

  return {
    header: parse_header(header),
    header_segment: parse_header_segment(header_segment),
    description: parse_description(description),
  };
}

async function esp_hash(image: ArrayBuffer): Promise<string> {
  if (!digest_support())
    throw new ESPError(error_code.NOT_SUPPORTED, 'Crypto API not supported');

  const calculated = await hex_sha256(image.slice(0, -32));
  const hash = blob_to_hex(image.slice(-32));

  if (calculated !== hash)
    throw new ESPError(error_code.HASH_NOT_MATCH, 'Hash not match', {
      calculated,
      hash,
    });

  return hash;
}

export async function esp_image(image: ArrayBuffer): Promise<espt.ESPImage> {
  const data = esp_image_parse(image);
  const hash = data.header.hash_appended === 1 ? await esp_hash(image) : '';

  return {
    hash,
    ...data,
  };
}
