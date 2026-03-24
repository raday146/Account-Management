import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PersonService } from '../../modules/person';

@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    const persons = await this.personService.findAll();
    return {
      success: true,
      message: 'Persons retrieved successfully',
      data: persons,
    };
  }
}
