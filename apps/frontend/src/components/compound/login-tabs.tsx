import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/design-system/tabs";

import SignInForm from "@/components/forms/sign-in-form";
import SignUpForm from "@/components/forms/sign-up-form";

export default function LoginTabs() {
	return (
		<Tabs defaultValue="sign-in" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="sign-in">Enter</TabsTrigger>
				<TabsTrigger value="sign-up">Create</TabsTrigger>
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
