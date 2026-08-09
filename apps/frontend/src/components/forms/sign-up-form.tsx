import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/design-system/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/design-system/form";
import { Input } from "@shared/design-system/input";
import { useSignUpEmail } from "@shared/queries";
import { ROUTES } from "@shared/routes/constants";
import { SignUpSchema, type SignUpSchemaType } from "@shared/zod-schemas/auth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignUpForm() {
	const navigate = useNavigate();
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
			setError("Could not create this account.");
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
							<FormLabel>Name</FormLabel>
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
							<FormLabel>Email</FormLabel>
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
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input type="password" autoComplete="new-password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
					{signUpMutation.isPending ? "Please wait" : "Sign Up"}
				</Button>
			</form>
		</Form>
	);
}
