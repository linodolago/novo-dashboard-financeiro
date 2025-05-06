
import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button component exists

const ErrorState = ({ error, refetch }) => (
	<div className="flex flex-col justify-center items-center min-h-screen text-center p-6 bg-red-50 rounded-lg shadow-md border border-red-200">
		<h2 className="text-xl font-semibold text-red-700 mb-3">Oops! Algo deu errado.</h2>
		<p className="text-gray-700 mb-5">{error || 'Não foi possível carregar os dados financeiros.'}</p>
		<Button
			onClick={refetch}
			className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 ease-in-out shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
		>
			Tentar Novamente
		</Button>
	</div>
);

export default ErrorState;
