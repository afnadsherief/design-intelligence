import type { Story } from "@ladle/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@/system";

export const Basic: Story = () => (
  <Card className="w-[320px]">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description text</CardDescription>
    </CardHeader>
    <CardContent>Body content of the card.</CardContent>
  </Card>
);

export const WithFooter: Story = () => (
  <Card className="w-[320px]">
    <CardHeader>
      <CardTitle>Plan</CardTitle>
      <CardDescription>Pro tier</CardDescription>
    </CardHeader>
    <CardContent>All features included.</CardContent>
    <CardFooter>
      <Button>Upgrade</Button>
    </CardFooter>
  </Card>
);
