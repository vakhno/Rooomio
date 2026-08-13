import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/design-system/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/design-system/form";
import { Input } from "@shared/design-system/input";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useSignUpEmail } from "@shared/queries";
import { ROUTES } from "@shared/routes/constants";
import { SignUpSchema, type SignUpSchemaType } from "@shared/zod-schemas/auth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignUpForm() {
	const navigate = useNavigate();
	const content = DICTIONARY[DEFAULT_LOCALE].pages.login.form;
	const [error, setError] = useState<string | null>(null);
	const signUpMutation = useSignUpEmail({ apiBaseUrl: import.meta.env.VITE_API_URL });
	const form = useForm<SignUpSchemaType>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: ""
		}
	});

	const submit = async ({ email, name, password }: SignUpSchemaType) => {
		setError(null);

		try {
			await signUpMutation.mutateAsync({
				email,
				name,
				password
			});

			await navigate({ to: ROUTES.PROFILE.path, replace: true });
		}
		catch {
			setError(content.signUpError);
		}
	};

	return (
		<Form {...form}>
			<form className="space-y-4 pt-4" onSubmit={form.handleSubmit(submit)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{content.nameLabel}</FormLabel>
							<FormControl>
								<Input autoComplete="name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
								<Input type="password" autoComplete="new-password" {...field} />
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
				<Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
					{signUpMutation.isPending ? content.signUpPending : content.signUpAction}
				</Button>
			</form>
		</Form>
	);
}
