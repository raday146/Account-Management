import { DataSource } from 'typeorm';
import { PersonEntity } from '../../modules/person/person.entity';
import { AccountEntity } from '../../modules/account/account.entity';
import { TransactionEntity } from '../../modules/transaction/transaction.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { personsData } from 'src/common';

dotenv.config({ path: join(__dirname, '../../../.env') });

async function seed(): Promise<void> {
  for (const key of ['DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!process.env[key]) {
      throw new Error(
        `${key} is not set. Copy backend/.env.example to backend/.env and fill it in.`,
      );
    }
  }

  console.log('Starting database seed...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [PersonEntity, AccountEntity, TransactionEntity],
    synchronize: true,
    logging: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('Database connected\n');

    const personRepository = AppDataSource.getRepository(PersonEntity);
    const accountRepository = AppDataSource.getRepository(AccountEntity);
    const transactionRepository =
      AppDataSource.getRepository(TransactionEntity);

    console.log('Creating persons...');

    const persons: PersonEntity[] = [];

    for (const personData of personsData) {
      const existing = await personRepository.findOne({
        where: { document: personData.document },
      });

      if (existing) {
        console.log(
          `Person already exists: ${existing.name} (ID: ${existing.personId})`,
        );
        persons.push(existing);
      } else {
        const person = personRepository.create(personData);
        const saved = await personRepository.save(person);
        console.log(`Person created: ${saved.name} (ID: ${saved.personId})`);
        persons.push(saved);
      }
    }

    console.log('\nCreating account for John Doe...');
    const account = accountRepository.create({
      personId: persons[0].personId,
      balance: '0.00',
      dailyWithdrawalLimit: '1000.00',
      accountType: 1,
      activeFlag: true,
    });
    const savedAccount = await accountRepository.save(account);
    console.log(` Account created: Checking (ID: ${savedAccount.accountId})`);
    console.log(`  Balance: $${savedAccount.balance}`);
    console.log(`  Daily Limit: $${savedAccount.dailyWithdrawalLimit}`);

    console.log('\nCreating transactions...');

    const deposit1 = transactionRepository.create({
      accountId: savedAccount.accountId,
      value: '1000.00',
    });
    await transactionRepository.save(deposit1);
    console.log('✓ Transaction 1: Deposit +$1000.00');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const withdrawal1 = transactionRepository.create({
      accountId: savedAccount.accountId,
      value: '-250.50',
    });
    await transactionRepository.save(withdrawal1);
    console.log(' Transaction 2: Withdrawal -$250.50');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const deposit2 = transactionRepository.create({
      accountId: savedAccount.accountId,
      value: '500.00',
    });
    await transactionRepository.save(deposit2);
    console.log('Transaction 3: Deposit +$500.00');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const withdrawal2 = transactionRepository.create({
      accountId: savedAccount.accountId,
      value: '-100.00',
    });
    await transactionRepository.save(withdrawal2);
    console.log(' Transaction 4: Withdrawal -$100.00');

    const expectedBalance = 1000.0 - 250.5 + 500.0 - 100.0;

    await accountRepository.update(savedAccount.accountId, {
      balance: expectedBalance.toFixed(2),
    });

    console.log(`\n✓ Final balance: $${expectedBalance.toFixed(2)}`);

    console.log('\nDatabase seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  Persons: ${persons.length}`);
    persons.forEach((p) => console.log(`    - ${p.name} (ID: ${p.personId})`));
    console.log(`  Account ID: ${savedAccount.accountId}`);
    console.log(`  Transactions: 4 (2 deposits, 2 withdrawals)`);
    console.log(`  Final Balance: $${expectedBalance.toFixed(2)}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('\n✓ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Seed script failed:', error);
    process.exit(1);
  });
