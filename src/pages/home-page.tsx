import { Button } from 'proqio-ui';

export function HomePage() {
    return (
        <main className="flex h-full flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">Infinitus</h1>
            <p className="text-muted-foreground max-w-md text-center text-lg">
                Open-source cloud security assessment tool for AWS, Azure, GCP,
                Kubernetes, GitHub, and more.
            </p>
            <Button variant="primary" asChild>
                <a
                    href="https://proqio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Proqio
                </a>
            </Button>
        </main>
    );
}
