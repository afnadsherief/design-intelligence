import type { Story } from "@ladle/react";
import { Button } from "@/system";

export const Default: Story = () => <Button>Get Started</Button>;

export const Variants: Story = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Button variant="default">Default</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
    <Button variant="destructive">Destructive</Button>
  </div>
);

export const Sizes: Story = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">⌘</Button>
  </div>
);

export const Disabled: Story = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Button disabled>Disabled</Button>
    <Button variant="outline" disabled>
      Disabled Outline
    </Button>
  </div>
);
