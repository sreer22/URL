import SiteLayout from "./(site)/layout";
import HomePage from "./(site)/page";

export default function RootPage() {
	return (
		<SiteLayout>
			<HomePage />
		</SiteLayout>
	);
}
