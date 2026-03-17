import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="flex flex-col items-center justify-center text-center gap-4 max-w-md">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                    <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Page not found</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        The page you are looking for does not exist or has been moved.
                    </p>
                </div>
                <Button asChild variant="default">
                    <Link href="/home">
                        <Home className="h-4 w-4 mr-1" />
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
