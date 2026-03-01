import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncidentSeverity, TransportType, Outcome } from '../entities/incident.entity';

export class LocationDto {
    @ApiProperty()
    @IsNumber()
    lat: number;

    @ApiProperty()
    @IsNumber()
    lng: number;
}

export class CreateIncidentDto {
    @ApiProperty({ example: 'Lagos' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'robbery' })
    @IsString()
    @IsNotEmpty()
    incident_type: string;

    @ApiProperty({ enum: IncidentSeverity })
    @IsEnum(IncidentSeverity)
    severity: IncidentSeverity;

    @ApiProperty({ enum: TransportType })
    @IsEnum(TransportType)
    transport_type: TransportType;

    @ApiPropertyOptional({ example: 'Silver' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    vehicle_color?: string;

    @ApiPropertyOptional({ example: '123' })
    @IsString()
    @IsOptional()
    @MaxLength(10)
    plate_partial?: string;

    @ApiProperty({ enum: Outcome })
    @IsEnum(Outcome)
    outcome: Outcome;

    @ApiPropertyOptional()
    @IsOptional()
    threat_indicators?: any;

    @ApiPropertyOptional({ example: 'Armed robbery near the bridge' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ type: LocationDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ApiProperty({ description: 'SHA-256 hash of device/user ID' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    reporter_hash: string;
}
