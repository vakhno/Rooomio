declare namespace NodeJS {
	interface ProcessEnv {
		PORT: string;
		VITE_APP_URL: string;
		POSTGRES_URL: string;
		POSTGRES_DB: string;
		POSTGRES_USER: string;
		POSTGRES_PASSWORD: string;
		VITE_API_URL: string;
		JWT_SECRET: string;
	}
}
