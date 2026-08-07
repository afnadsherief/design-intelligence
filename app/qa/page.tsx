import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input } from "@/system";

export default function QAPage() {
  return (
    <main className="p-8">
      <div className="max-w-[720px] mb-8">
        <h1 className="text-[var(--font-size-6)] font-bold mb-4">Visual QA</h1>
      </div>
      <div data-testid="card" data-qa="card" className="w-[360px] mb-8">
        <Card>
          <CardHeader>
            <CardTitle>QA Card</CardTitle>
            <CardDescription>Visual regression fixture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input type="text" placeholder="Fixtures" data-qa="input" />
              <div className="flex flex-wrap items-center gap-4" data-testid="buttons">
                <Button variant="default" data-qa="button">
                  Primary
                </Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}