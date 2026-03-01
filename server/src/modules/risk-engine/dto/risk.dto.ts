import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRiskTilesDto {
    @IsString()
    city: string;

    @IsString()
    bbox: string; // "minLng,minLat,maxLng,maxLat"

    @IsNumber()
    @Type(() => Number)
    zoom: number;

    @IsOptional()
    @IsString()
    timebucket?: string = 'default';
}

export class GetRiskHereDto {
    @IsString()
    city: string;

    @IsNumber()
    @Type(() => Number)
    lat: number;

    @IsNumber()
    @Type(() => Number)
    lng: number;

    @IsOptional()
    @IsString()
    time?: string;
}

export class GetRouteRiskDto {
    @IsString()
    city: string;

    @IsString()
    polyline: string;

    @IsOptional()
    @IsString()
    time?: string;
}

export class GetTopCorridorsDto {
    @IsString()
    city: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 20;
}
