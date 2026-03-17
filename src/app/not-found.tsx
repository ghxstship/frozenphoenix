import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
            <div className="flex flex-col items-center justify-center text-center gap-4 max-w-md">
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
                    <FileQuestion className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">404 — Page not found</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        The page you are looking for does not exist or has been moved.
                    </p>
                </div>
                <Button asChild variant="default" size="lg">
                    <Link href="/home">
                        <Home className="h-4 w-4 mr-2" />
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
