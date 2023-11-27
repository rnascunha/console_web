/**
 * https://github.com/espressif/esp-idf/blob/53ff7d43dbf/components/esp_bootloader_format/include/esp_bootloader_desc.h
 */

// ESP constants
export const header_size = 24;
export const header_segment_size = 8;
export const description_size = 256;

// Bootloader
export const bootloader_description_size = 80;
export const ESP_BOOTLOADER_DESC_MAGIC_BYTE = 80; // eslint-disable-line

/* Max count of segments in the image. */
export const ESP_IMAGE_MAX_SEGMENTS = 16; // eslint-disable-line
export const ESP_IMAGE_HEADER_MAGIC = 0xe9; // eslint-disable-line
export const ESP_APP_DESC_MAGIC_WORD = 0xabcd5432; // eslint-disable-line

/**
 * @brief ESP chip ID
 *
 */
// typedef enum {
//   ESP_CHIP_ID_ESP32 = 0x0000,  /*!< chip ID: ESP32 */
//   ESP_CHIP_ID_ESP32S2 = 0x0002,  /*!< chip ID: ESP32-S2 */
//   ESP_CHIP_ID_ESP32C3 = 0x0005, /*!< chip ID: ESP32-C3 */
//   ESP_CHIP_ID_ESP32S3 = 0x0009, /*!< chip ID: ESP32-S3 */
//   ESP_CHIP_ID_ESP32C2 = 0x000C, /*!< chip ID: ESP32-C2 */
//   ESP_CHIP_ID_ESP32C6 = 0x000D, /*!< chip ID: ESP32-C6 */
//   ESP_CHIP_ID_ESP32H2 = 0x0010, /*!< chip ID: ESP32-H2 */
//   ESP_CHIP_ID_ESP32P4 = 0x0012, /*!< chip ID: ESP32-P4 */
//   ESP_CHIP_ID_INVALID = 0xFFFF /*!< Invalid chip ID (we defined it to make sure the esp_chip_id_t is 2 bytes size) */
// } __attribute__((packed)) esp_chip_id_t;

export const chip_id: Record<number, string> = {
  0x0000: 'ESP32',
  0x0002: 'ESP32-S2',
  0x0005: 'ESP32-C3',
  0x0009: 'ESP32-S3',
  0x000c: 'ESP32-C2',
  0x000d: 'ESP32-C6',
  0x0010: 'ESP32-H2',
  0x0012: 'ESP32-P4',
  0xffff: 'invalid',
};

/**
 * @brief SPI flash mode, used in esp_image_header_t
 */
// typedef enum {
//     ESP_IMAGE_SPI_MODE_QIO,         /*!< SPI mode QIO */
//     ESP_IMAGE_SPI_MODE_QOUT,        /*!< SPI mode QOUT */
//     ESP_IMAGE_SPI_MODE_DIO,         /*!< SPI mode DIO */
//     ESP_IMAGE_SPI_MODE_DOUT,        /*!< SPI mode DOUT */
//     ESP_IMAGE_SPI_MODE_FAST_READ,   /*!< SPI mode FAST_READ */
//     ESP_IMAGE_SPI_MODE_SLOW_READ    /*!< SPI mode SLOW_READ */
// } esp_image_spi_mode_t;
export const spi_flash_mode: Record<number, string> = {
  0: 'QIO',
  1: 'QOUT',
  2: 'DIO',
  3: 'DOUT',
  4: 'FAST_READ',
  5: 'SLOW_READ',
};

/**
 * @brief SPI flash clock division factor.
 */
// typedef enum {
//   ESP_IMAGE_SPI_SPEED_DIV_2,        /*!< The SPI flash clock frequency is divided by 2 of the clock source */
//   ESP_IMAGE_SPI_SPEED_DIV_3,        /*!< The SPI flash clock frequency is divided by 3 of the clock source */
//   ESP_IMAGE_SPI_SPEED_DIV_4,        /*!< The SPI flash clock frequency is divided by 4 of the clock source */
//   ESP_IMAGE_SPI_SPEED_DIV_1 = 0xF   /*!< The SPI flash clock frequency equals to the clock source */
// } esp_image_spi_freq_t;
export const spi_frequency_divisor: Record<number, number> = {
  0: 2,
  1: 3,
  2: 4,
  0xf: 1,
};

/**
 * @brief Supported SPI flash sizes
 */
// typedef enum {
//     ESP_IMAGE_FLASH_SIZE_1MB = 0,   /*!< SPI flash size 1 MB */
//     ESP_IMAGE_FLASH_SIZE_2MB,       /*!< SPI flash size 2 MB */
//     ESP_IMAGE_FLASH_SIZE_4MB,       /*!< SPI flash size 4 MB */
//     ESP_IMAGE_FLASH_SIZE_8MB,       /*!< SPI flash size 8 MB */
//     ESP_IMAGE_FLASH_SIZE_16MB,      /*!< SPI flash size 16 MB */
//     ESP_IMAGE_FLASH_SIZE_32MB,      /*!< SPI flash size 32 MB */
//     ESP_IMAGE_FLASH_SIZE_64MB,      /*!< SPI flash size 64 MB */
//     ESP_IMAGE_FLASH_SIZE_128MB,     /*!< SPI flash size 128 MB */
//     ESP_IMAGE_FLASH_SIZE_MAX        /*!< SPI flash size MAX */
// } esp_image_flash_size_t;

export const image_flash_size: Record<number, string> = {
  0: '1MB',
  1: '2MB',
  2: '4MB',
  3: '8MB',
  4: '16MB',
  5: '32MB',
  6: '64MB',
  7: '128MB',
  9: 'MAX',
};

/**
 * @brief SPI flash clock frequency
 */
// typedef enum {
//     ESP_IMAGE_SPI_SPEED_40M,        /*!< SPI clock frequency 40 MHz */
//     ESP_IMAGE_SPI_SPEED_26M,        /*!< SPI clock frequency 26 MHz */
//     ESP_IMAGE_SPI_SPEED_20M,        /*!< SPI clock frequency 20 MHz */
//     ESP_IMAGE_SPI_SPEED_80M = 0xF   /*!< SPI clock frequency 80 MHz */
// } esp_image_spi_freq_t;

export const spi_image_frequency: Record<number, string> = {
  0: '40MHz',
  1: '26MHz',
  2: '20MHz',
  0xf: '80MHz',
};
