import type { Story } from "@ladle/react";
import { Input } from "@/system";

export const Default: Story = () => <Input type="text" placeholder="Enter your name" />;

export const States: Story = () => (
  <div className="flex w-[320px] flex-col gap-4">
    <Input type="text" placeholder="Enabled" />
    <Input type="text" placeholder="Disabled" disabled />
    <Input type="email" placeholder="Email address" />
    <Input type="password" placeholder="Password" />
  </div>
);
