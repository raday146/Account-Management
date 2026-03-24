import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity } from './person.entity';

/**
 * Service for managing Person entities and business logic
 */
@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
  ) {}

  /**
   * Find a person by ID
   */
  async findById(personId: number): Promise<PersonEntity | null> {
    return this.personRepository.findOne({
      where: { personId },
    });
  }

  /**
   * Find a person by document
   */
  async findByDocument(document: string): Promise<PersonEntity | null> {
    return this.personRepository.findOne({
      where: { document },
    });
  }

  /**
   * Find all persons
   */
  async findAll(): Promise<PersonEntity[]> {
    return this.personRepository.find();
  }

  /**
   * Create a new person
   */
  async create(data: Partial<PersonEntity>): Promise<PersonEntity> {
    const person = this.personRepository.create(data);
    return this.personRepository.save(person);
  }

  /**
   * Update a person
   */
  async update(
    personId: number,
    data: Partial<PersonEntity>,
  ): Promise<PersonEntity | null> {
    await this.personRepository.update(personId, data);
    return this.findById(personId);
  }

  /**
   * Delete a person
   */
  async delete(personId: number): Promise<boolean> {
    const result = await this.personRepository.delete(personId);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if a person exists by document
   */
  async existsByDocument(document: string): Promise<boolean> {
    const count = await this.personRepository.count({
      where: { document },
    });
    return count > 0;
  }
}
