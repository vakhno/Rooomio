import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/design-system/tabs";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

import SignInForm from "@/components/forms/sign-in-form";
import SignUpForm from "@/components/forms/sign-up-form";

export default function LoginTabs() {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.login.tabs;

	return (
		<Tabs defaultValue="sign-in" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="sign-in">{content.signIn}</TabsTrigger>
				<TabsTrigger value="sign-up">{content.signUp}</TabsTrigger>
			</TabsList>
			<TabsContent value="sign-in">
				<SignInForm />
			</TabsContent>
			<TabsContent value="sign-up">
				<SignUpForm />
			</TabsContent>
		</Tabs>
	);
}
