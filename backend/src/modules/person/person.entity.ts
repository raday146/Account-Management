import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { AccountEntity } from '../account/account.entity';

@Entity('person')
export class PersonEntity {
  @PrimaryGeneratedColumn()
  personId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  document: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => AccountEntity, (account) => account.person)
  accounts: AccountEntity[];
}
