import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import CategoryRepository from './CategoryRepository';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface ResponseList {
  id: string;
  title: string;
  value: string;
  category: Category | undefined;
  created_at: Date;
  updated_at: Date;
}
interface ReturnAll {
  transactions: ResponseList[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<ReturnAll | null> {
    const categoryRepository = getCustomRepository(CategoryRepository);
    const transactions = await this.find();
    const list: ResponseList[] = [];

    if (transactions.length > 0) {
      await Promise.all(
        transactions.map(async transaction => {
          const category = await categoryRepository.findOne({
            id: transaction.category_id,
          });

          const { id, title, value, created_at, updated_at } = transaction;

          list.push({
            id,
            title,
            value,
            category,
            created_at,
            updated_at,
          });
        }),
      );
      return { transactions: list, balance: await this.getBalance() };
    }
    throw new AppError('Sem transações disponiveis', 404);
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((a, b) => a + parseFloat(b.value), 0);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((a, b) => a + parseFloat(b.value), 0);

    const total = income - outcome;

    const balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
