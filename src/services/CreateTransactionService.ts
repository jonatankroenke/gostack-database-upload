import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransanctionsRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoryRepository';

interface Request {
  title: string;
  value: string;
  type: 'income' | 'outcome';
  category: string;
}
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

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transanctionRepository = getCustomRepository(TransanctionsRepository);
    const categoryRepository = getCustomRepository(CategoryRepository);

    const balance = await transanctionRepository.getBalance();

    if (type === 'outcome') {
      if (parseFloat(value) > balance.total) {
        throw new AppError('Sem saldo suficiente', 400);
      }
    }

    let findCategory = await categoryRepository.findOne({ title: category });

    if (!findCategory) {
      const createCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(createCategory);

      findCategory = createCategory;
    }

    const transaction = transanctionRepository.create({
      title,
      value,
      type,
      category_id: findCategory.id,
    });

    await transanctionRepository.save(transaction);

    delete transaction.category_id;

    transaction.category = findCategory;

    return transaction;
  }

  public async list(): Promise<ReturnAll | null> {
    const transanctionRepository = getCustomRepository(TransanctionsRepository);

    const listTransactions = transanctionRepository.all();

    return listTransactions;
  }
}

export default CreateTransactionService;
