import "./globals.css";

export const metadata = {
	title: process.env.NEXT_PUBLIC_APP_NAME || "Vibcoding Reels",
};
export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50 text-gray-900">
				{children}
			</body>
		</html>
	);
}
