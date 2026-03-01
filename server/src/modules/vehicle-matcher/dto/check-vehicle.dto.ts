import { IsString, IsOptional, IsEnum, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransportType } from '../entities/vehicle-fingerprint.entity';

export class CheckVehicleDto {
    @ApiProperty({ example: 'Lagos' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'ABC 123 XY', required: false })
    @IsString()
    @IsOptional()
    plate?: string;

    @ApiProperty({ example: '123', required: false })
    @IsString()
    @IsOptional()
    platePartial?: string;

    @ApiProperty({ example: 'Toyota', required: false })
    @IsString()
    @IsOptional()
    vehicleMake?: string;

    @ApiProperty({ example: 'Silver', required: false })
    @IsString()
    @IsOptional()
    vehicleColor?: string;

    @ApiProperty({ enum: TransportType, example: 'taxi', required: false })
    @IsEnum(TransportType)
    @IsOptional()
    transportType?: TransportType;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    tintedWindows?: boolean;

    @ApiProperty({ example: 'roof rack, dent left door', required: false })
    @IsString()
    @IsOptional()
    distinctiveFeatures?: string;
}
