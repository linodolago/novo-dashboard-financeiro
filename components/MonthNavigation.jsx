
    import React from 'react';
    import { motion } from 'framer-motion';
    import { ChevronLeft, ChevronRight } from 'lucide-react';
    import { useFinance } from '@/context/FinanceContext';
    import { getMonthName, getPreviousMonth, getNextMonth, formatCurrency } from '@/lib/utils';
    import { Avatar, AvatarFallback } from '@/components/ui/avatar';

    const MonthNavigation = () => {
      const { currentDate, setCurrentDate, monthlyBalance } = useFinance();

      const handlePreviousMonth = () => {
        setCurrentDate(getPreviousMonth(currentDate));
      };

      const handleNextMonth = () => {
        setCurrentDate(getNextMonth(currentDate));
      };

      const { income = 0, expense = 0, balance = 0 } = monthlyBalance || {};

      const monthName = getMonthName(currentDate);
      const year = currentDate.getFullYear(); // Get the year

      return (
        <motion.div
          className="relative flex items-center justify-between p-6 mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-100 shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <button
            onClick={handlePreviousMonth}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex-1 text-center px-16"> {/* Added padding to avoid overlap */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start">
                 {/* Display month and year */}
                 <h1 className="text-4xl md:text-5xl font-bold capitalize text-gray-800 mb-2">{`${monthName} ${year}`}</h1>
                <div className="flex flex-col md:flex-row mt-2 space-y-2 md:space-y-0 md:space-x-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Entradas</p>
                    <p className="text-md sm:text-lg font-semibold text-green-600">{formatCurrency(income)}</p>
                  </div>
                  <div className="md:border-l md:border-gray-300 md:pl-6">
                    <p className="text-xs sm:text-sm text-gray-500">Saídas</p>
                    <p className="text-md sm:text-lg font-semibold text-red-600">{formatCurrency(expense)}</p>
                  </div>
                  <div className="md:border-l md:border-gray-300 md:pl-6">
                    <p className="text-xs sm:text-sm text-gray-500">Saldo</p>
                    <p className="text-md sm:text-lg font-semibold text-blue-600">{formatCurrency(balance)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center ml-4"> {/* Added margin */}
                {/* <p className="mr-2 hidden sm:block text-gray-700">Olá, usuário</p> */}
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </motion.div>
      );
    };

    export default MonthNavigation;
  