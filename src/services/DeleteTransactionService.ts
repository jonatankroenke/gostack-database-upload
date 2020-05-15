import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransanctionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransanctionsRepository);
    const deleteTransaction = await transactionsRepository.delete({ id });

    if (deleteTransaction) {
      throw new AppError('', 204);
    }
    throw new AppError('Erro ao realizar a exclusão', 400);
  }
}

export default DeleteTransactionService;
