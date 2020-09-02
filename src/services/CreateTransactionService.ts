// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';


interface Request {
  title: string
  type: 'income' | 'outcome'
  value: number
  category: string
}

class CreateTransactionService {
  public async execute({ title, type, value, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository)
    const categoryReporitory = getRepository(Category)

    const { total } = await transactionsRepository.getBalance()

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough Balance')
    }

    let transactionCategory = await categoryReporitory.findOne({
      where: {
        title: category
      }
    })

    if (!transactionCategory) {
      transactionCategory = categoryReporitory.create({ title: category })
      await categoryReporitory.save(transactionCategory)
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory
    })

    await transactionsRepository.save(transaction)

    return transaction
  }
}

export default CreateTransactionService;
