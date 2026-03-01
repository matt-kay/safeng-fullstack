import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StartTripDto {
  @IsString()
  city: string;

  @IsNumber()
  startLat: number;

  @IsNumber()
  startLng: number;

  @IsNumber()
  @IsOptional()
  destLat?: number;

  @IsNumber()
  @IsOptional()
  destLng?: number;
}

export class TelemetryPointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  speed: number;

  @IsNumber()
  heading: number;

  @IsString()
  networkState: string;

  @IsString()
  timestamp: string;
}

export class BatchTelemetryDto {
  @IsString()
  tripId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelemetryPointDto)
  points: TelemetryPointDto[];
}

export class EndTripDto {
  @IsString()
  tripId: string;
}

export class TriggerSosDto {
  @IsString()
  tripId: string;

  @IsString()
  encryptedPayload: string; // base64
}
