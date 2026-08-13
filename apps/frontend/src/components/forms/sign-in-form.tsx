import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/design-system/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/design-system/form";
import { Input } from "@shared/design-system/input";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useSignInEmail } from "@shared/queries";
import { ROUTES } from "@shared/routes/constants";
import { SignInSchema, type SignInSchemaType } from "@shared/zod-schemas/auth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignInForm() {
	const navigate = useNavigate();
	const content = DICTIONARY[DEFAULT_LOCALE].pages.login.form;
	const [error, setError] = useState<string | null>(null);
	const signInMutation = useSignInEmail({ apiBaseUrl: import.meta.env.VITE_API_URL });
	const form = useForm<SignInSchemaType>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	const submit = async ({ email, password }: SignInSchemaType) => {
		setError(null);

		try {
			await signInMutation.mutateAsync({
				email,
				password
			});

			await navigate({ to: ROUTES.PROFILE.path, replace: true });
		}
		catch {
			setError(content.signInError);
		}
	};

	return (
		<Form {...form}>
			<form className="space-y-4 pt-4" onSubmit={form.handleSubmit(submit)}>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{content.emailLabel}</FormLabel>
							<FormControl>
								<Input type="email" autoComplete="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{content.passwordLabel}</FormLabel>
							<FormControl>
								<Input type="password" autoComplete="current-password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{error && (
					<p className="rounded-[2px] border-2 border-destructive bg-shade-0 px-3 py-2 text-sm font-extrabold text-destructive">
						{error}
					</p>
				)}
				<Button type="submit" className="w-full" disabled={signInMutation.isPending}>
					{signInMutation.isPending ? content.signInPending : content.signInAction}
				</Button>
			</form>
		</Form>
	);
}
