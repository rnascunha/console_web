export interface TimestampValues {
  timezone: string;
  timestamp: number;
}

export interface TimestampOptions {
  clocks?: string[];
  timestamp?: TimestampValues[];
}
