
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Carregando dados..." }) => (
	<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 bg-opacity-75 z-50 absolute inset-0">
		<Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-700">{message}</p>
	</div>
);

export default LoadingState;
