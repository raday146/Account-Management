/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountEntity } from './account.entity';
import { TransactionEntity } from '../transaction/transaction.entity';
import { PersonEntity } from '../person/person.entity';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockAccount: AccountEntity = {
    accountId: 1,
    personId: 1,
    balance: '1000.00',
    dailyWithdrawalLimit: '500.00',
    activeFlag: true,
    accountType: 1,
    createDate: new Date(),
    person: {} as PersonEntity,
    transactions: [],
  };

  beforeEach(async () => {
    const mockAccountRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
      getRepository: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: mockAccountRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get(getRepositoryToken(AccountEntity));
    dataSource = module.get(DataSource);
  });

  describe('withdraw', () => {
    it('should fail if account not found', async () => {
      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        return cb(mockManager);
      });

      await expect(service.withdraw(1, 100)).rejects.toThrow(NotFoundException);
    });

    it('should fail if account is not active', async () => {
      const inactiveAccount = { ...mockAccount, activeFlag: false };

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(inactiveAccount),
        };
        return cb(mockManager);
      });

      await expect(service.withdraw(1, 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should fail if insufficient balance', async () => {
      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockAccount),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          }),
        };
        return cb(mockManager);
      });

      await expect(service.withdraw(1, 2000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should fail if exceeding daily withdrawal limit', async () => {
      const todayTransaction = {
        transactionId: 1,
        accountId: 1,
        value: '-400.00',
        transactionDate: new Date(),
      };

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockAccount),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([todayTransaction]),
          }),
        };
        return cb(mockManager);
      });

      await expect(service.withdraw(1, 200)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should succeed when valid', async () => {
      const updatedAccount = { ...mockAccount, balance: '900.00' };

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockAccount),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          }),
          save: jest.fn().mockResolvedValue(updatedAccount),
          create: jest.fn().mockReturnValue({}),
        };
        return cb(mockManager);
      });

      const result = await service.withdraw(1, 100);
      expect(result).toEqual(updatedAccount);
    });
  });

  describe('deposit', () => {
    it('should fail if account not found', async () => {
      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        return cb(mockManager);
      });

      await expect(service.deposit(1, 100)).rejects.toThrow(NotFoundException);
    });

    it('should increase balance', async () => {
      const updatedAccount = { ...mockAccount, balance: '1100.00' };

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockAccount),
          save: jest.fn().mockResolvedValue(updatedAccount),
          create: jest.fn().mockReturnValue({}),
        };
        return cb(mockManager);
      });

      const result = await service.deposit(1, 100);
      expect(result.balance).toBe('1100.00');
    });

    it('should create a transaction record', async () => {
      let transactionCreated = false;

      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn().mockResolvedValue(mockAccount),
          save: jest.fn().mockImplementation((entity, data) => {
            if (data && 'value' in data) {
              transactionCreated = true;
            }
            return Promise.resolve(mockAccount);
          }),
          create: jest.fn().mockImplementation((entity, data) => data),
        };
        return cb(mockManager);
      });

      await service.deposit(1, 100);
      expect(transactionCreated).toBe(true);
    });
  });

  describe('getStatement', () => {
    it('should fail if account not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getStatement(1, new Date(), new Date()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return transactions within date range', async () => {
      const transactions = [
        {
          transactionId: 1,
          accountId: 1,
          value: '100.00',
          transactionDate: new Date('2024-01-15'),
        },
        {
          transactionId: 2,
          accountId: 1,
          value: '-50.00',
          transactionDate: new Date('2024-01-20'),
        },
      ] as TransactionEntity[];

      accountRepository.findOne.mockResolvedValue(mockAccount);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
        getMany: jest.fn().mockResolvedValue(transactions),
      };

      dataSource.getRepository = jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      });

      const result = await service.getStatement(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by transaction type', async () => {
      const deposits = [
        {
          transactionId: 1,
          accountId: 1,
          value: '100.00',
          transactionDate: new Date('2024-01-15'),
        },
      ] as TransactionEntity[];

      accountRepository.findOne.mockResolvedValue(mockAccount);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(deposits),
      };

      dataSource.getRepository = jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      });

      const result = await service.getStatement(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        1,
        10,
        'deposit',
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.value >= 0',
      );
      expect(result.transactions).toHaveLength(1);
    });
  });

  describe('blockAccount', () => {
    it('should fail if account not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);

      await expect(service.blockAccount(1)).rejects.toThrow(NotFoundException);
    });

    it('should fail if account already blocked', async () => {
      const blockedAccount = { ...mockAccount, activeFlag: false };
      accountRepository.findOne.mockResolvedValue(blockedAccount);

      await expect(service.blockAccount(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set activeFlag to false', async () => {
      accountRepository.findOne.mockResolvedValue(mockAccount);
      const blockedAccount = { ...mockAccount, activeFlag: false };
      accountRepository.save.mockResolvedValue(blockedAccount);

      const result = await service.blockAccount(1);
      expect(result.activeFlag).toBe(false);
    });
  });
});
