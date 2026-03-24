import { DataSource } from 'typeorm';
import { PersonEntity } from '../../modules/person/person.entity';
import { AccountEntity } from '../../modules/account/account.entity';
import { TransactionEntity } from '../../modules/transaction/transaction.entity';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../../.env') });

async function seed(): Promise<void> {
  console.log('Starting database seed...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'account_management',
    entities: [PersonEntity, AccountEntity, TransactionEntity],
    synchronize: true,
    logging: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected\n');

    const personRepository = AppDataSource.getRepository(PersonEntity);
    const accountRepository = AppDataSource.getRepository(AccountEntity);
    const transactionRepository = AppDataSource.getRepository(TransactionEntity);

    const existingPerson = await personRepository.findOne({
      where: { document: '12345678900' },
    });

    let person: PersonEntity;

    if (existingPerson) {
      console.log('Person already exists. Using existing person.');
      person = existingPerson;
    } else {
      console.log('Creating person...');
      person = personRepository.create({
        name: 'John Doe',
        document: '12345678900',
        birthDate: new Date('1990-01-15'),
      });
      person = await personRepository.save(person);
      console.log(`✓ Person created: ${person.name} (ID: ${person.personId})`);
    }

    console.log('\nCreating account...');
    const account = accountRepository.create({
      personId: person.personId,
      balance: '0.00',
      dailyWithdrawalLimit: '1000.00',
      accountType: 'checking',
      activeFlag: true,
    });
    const savedAccount = await accountRepository.save(account);
    console.log(`✓ Account created: ${savedAccount.accountType} (ID: ${savedAccount.accountId})`);
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
    console.log('✓ Transaction 2: Withdrawal -$250.50');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const deposit2 = transactionRepository.create({
      accountId: savedAccount.accountId,
      value: '500.00',
    });
    await transactionRepository.save(deposit2);
    console.log('✓ Transaction 3: Deposit +$500.00');

    await new Promise((resolve) => setTimeout(resolve, 100));

    const withdrawal2 = transactionRepository.create({
      accountId: savedAccount.accountId,
      value: '-100.00',
    });
    await transactionRepository.save(withdrawal2);
    console.log('✓ Transaction 4: Withdrawal -$100.00');

    const finalAccount = await accountRepository.findOne({
      where: { accountId: savedAccount.accountId },
    });
    const finalBalance = finalAccount ? parseFloat(finalAccount.balance) : 0;
    const expectedBalance = 1000.0 - 250.5 + 500.0 - 100.0;

    await accountRepository.update(savedAccount.accountId, {
      balance: expectedBalance.toFixed(2),
    });

    console.log(`\n✓ Final balance: $${expectedBalance.toFixed(2)}`);

    console.log('\nDatabase seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  Person: ${person.name} (${person.document})`);
    console.log(`  Person ID: ${person.personId}`);
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
