/**
 * @brief Main header of binary image
 */
// typedef struct {
//   uint8_t magic;              /*!< Magic word ESP_IMAGE_HEADER_MAGIC */
//   uint8_t segment_count;      /*!< Count of memory segments */
//   uint8_t spi_mode;           /*!< flash read mode (esp_image_spi_mode_t as uint8_t) */
//   uint8_t spi_speed: 4;       /*!< flash frequency (esp_image_spi_freq_t as uint8_t) */
//   uint8_t spi_size: 4;        /*!< flash chip size (esp_image_flash_size_t as uint8_t) */
//   uint32_t entry_addr;        /*!< Entry address */
//   uint8_t wp_pin;            /*!< WP pin when SPI pins set via efuse (read by ROM bootloader,
//                               * the IDF bootloader uses software to configure the WP
//                               * pin and sets this field to 0xEE=disabled) */
//   uint8_t spi_pin_drv[3];     /*!< Drive settings for the SPI flash pins (read by ROM bootloader) */
//   esp_chip_id_t chip_id;      /*!< Chip identification number */
//   uint8_t min_chip_rev;       /*!< Minimal chip revision supported by image
//                                * After the Major and Minor revision eFuses were introduced into the chips, this field is no longer used.
//                                * But for compatibility reasons, we keep this field and the data in it.
//                                * Use min_chip_rev_full instead.
//                                * The software interprets this as a Major version for most of the chips and as a Minor version for the ESP32-C3.
//                                */
//   uint16_t min_chip_rev_full; /*!< Minimal chip revision supported by image, in format: major * 100 + minor */
//   uint16_t max_chip_rev_full; /*!< Maximal chip revision supported by image, in format: major * 100 + minor */
//   uint8_t reserved[4];        /*!< Reserved bytes in additional header space, currently unused */
//   uint8_t hash_appended;      /*!< If 1, a SHA256 digest "simple hash" (of the entire image) is appended after the checksum.
//                                * Included in image length. This digest
//                                * is separate to secure boot and only used for detecting corruption.
//                                * For secure boot signed images, the signature
//                                * is appended after this (and the simple hash is included in the signed data). */
// } __attribute__((packed))  esp_image_header_t;

export interface ESPValue {
  value: number;
  name: number | string;
}

export interface ESPImageHeader {
  magic: number;
  segment_count: number;
  spi_mode: ESPValue;
  spi_speed: ESPValue;
  spi_size: ESPValue;
  entry_addr: number;
  wp_pin: number;
  spi_pin_drv: ArrayBuffer;
  chip_id: ESPValue;
  min_chip_rev: number;
  min_chip_rev_full: number;
  max_chip_rev_full: number;
  hash_appended: number;
}

/**
 * @brief Header of binary image segment
 */
// typedef struct {
//     uint32_t load_addr;     /*!< Address of segment */
//     uint32_t data_len;      /*!< Length of data */
// } esp_image_segment_header_t;

export interface ESPHeaderSegment {
  load_addr: number;
  data_len: number;
}

/**
 * @brief Description about application.
 */
// typedef struct {
//     std::uint32_t magic_word;        /*!< Magic word ESP_APP_DESC_MAGIC_WORD */
//     std::uint32_t secure_version;    /*!< Secure version */
//     std::uint32_t reserv1[2];        /*!< reserv1 */
//     char version[32];           /*!< Application version */
//     char project_name[32];      /*!< Project name */
//     char time[16];              /*!< Compile time */
//     char date[16];              /*!< Compile date*/
//     char idf_ver[32];           /*!< Version IDF */
//     std::uint8_t app_elf_sha256[32]; /*!< sha256 of elf file */
//     std::uint32_t reserv2[20];       /*!< reserv2 */
// } esp_app_desc_t;

export interface ESPAppDescription {
  magic_word: number;
  secure_version: number;
  version: string;
  project_name: string;
  time: string;
  date: string;
  idf_ver: string;
  app_elf_sha256: string;
}

/**
 * @brief Bootloader description structure
 */
// typedef struct {
//   uint8_t magic_byte;         /*!< Magic byte ESP_BOOTLOADER_DESC_MAGIC_BYTE */
//   uint8_t reserved[3];        /*!< reserved for IDF */
//   uint32_t version;           /*!< Bootloader version */
//   char idf_ver[32];           /*!< Version IDF */
//   char date_time[24];         /*!< Compile date and time*/
//   uint8_t reserved2[16];      /*!< reserved for IDF */
// } esp_bootloader_desc_t;
export interface ESPBootloaderDescription {
  magic_byte: number;
  version: number;
  idf_ver: string;
  date_time: string;
}

export interface ESPImageBase {
  header: ESPImageHeader;
  header_segment: ESPHeaderSegment;
  hash?: string;
}

/**
 * As only the newest IDF has a bootloader description (v5.2), this field is
 * not required.
 */
export interface ESPImageBootloader extends ESPImageBase {
  description?: ESPBootloaderDescription;
}

export interface ESPImageApp extends ESPImageBase {
  description: ESPAppDescription;
}
