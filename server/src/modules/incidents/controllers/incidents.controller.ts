import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IncidentsService } from '../services/incidents.service';
import { CreateIncidentDto } from '../dto/create-incident.dto';
import { Incident } from '../entities/incident.entity';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Post()
    @ApiOperation({ summary: 'Report a new incident' })
    @ApiResponse({ status: 201, description: 'Incident reported successfully.', type: Incident })
    @ApiResponse({ status: 400, description: 'Bad request (e.g. rate limit reached).' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createIncidentDto: CreateIncidentDto): Promise<Incident> {
        return this.incidentsService.create(createIncidentDto);
    }
}
